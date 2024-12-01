const express = require (`express`); // web server dan routing 
const session = require(`express-session`); // middleware 
const passport = require('passport'); // autentikasi 
const GoogleStrategy = require("passport-google-oauth20").Strategy; // authentication w/ google ouauth 20

const app = express();

app.use(session({ // set the middle ware 
    secret: 'secret-key', // encrpyt key session
    resave: false, // decide save or not session if there is changes 
    saveUnitialized: true // save sess altho no data 
}));

app.set('view engine', 'ejs'); // set ejs as engine template 

//initialise passport 
app.use(passport.initialize());
app.use(passport.session());

// menggunakan pass utk google strategi
passport.use(new GoogleStrategy({
    clientID:"976665504645-tlbo68404dqo9lkqqeb0dej7k5ur3hkd.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL:"http://localhost:3000/auth/google/callback" // membuat user kembali ke web setelah login 
},
(accessToken, refreshToken, profile, done) => { // callback for authtication result 
    return done(null, profile);
}
));

// integrasi sessiond engan passport, session dibuat otomatis pas udh login
passport.serializeUser((user, done) => {
    done(null, user);
});
// hapus session pas log out 
passport.deserializeUser((obj, done) => {
    done(null, obj);
});


//render file bernama index
app.get('/', (req, res) => {
    res.render('index');
});

//login,  menjalankan passport utk authentikasi yg menyatakan ingin akses apa
app.get('/auth/google',
   passport.authenticate('google', {// menggunakan google untuk autentikasi
    scope: ['profile', 'email'],  // apa yang akan diakses, user hrs tau apa yng diakses  
    prompt: 'select_account' }));// munculin prompt, biar user choose which to use 


// user gagal login, diarahkan ke url root kmbli ke index
app.get("/auth/google/callback", passport.authenticate('google',
    {failureRedirect: '/'}), // kalau gagal login redirect to root url, balik ke index 
    (req, res) =>{
    res.redirect('/profile'); // // if successful
});

// mengecek user sdh login/tdk
app.get('/profile',(req,res) => { // aft login msk sini 
    if(!req.isAuthenticated()){ // check login or no 
        return res.redirect('/auth/google');// if no
    }
    res.render("profile", {user: req.user}); //if yes, render profile 
});

//code logout 
app.get('/logout', (req,res) => {
    req.logout(err => { // klao error munculin error
        if(err) return next(err);
        res.redirect('/'); //redirect home index
    });
});

// nama port 
app.listen(3000, () => {
    console.log('Server running on port 3000');
});