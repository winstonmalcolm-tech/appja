const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");

//This is used to tell passport which social provide to use to authenticate later
passport.use(
    new GoogleStrategy({
        //Options for a stategy

    }),

    (accessToken, refreshToken, profile, cb) => {
        //passport callback function

    }


);