const passport = require('passport')
const Googlestrategy = require("passport-google-oauth20").Strategy
const mongoose = require('mongoose')
const User = mongoose.model('GoogleUsers')
const keys = require('../config/key')

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user)
    })
})

passport.use(
    new Googlestrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback"
    }, 
    (accessToken, refreshToken, profile, done) => {
        User.findOne({googleID: profile.id}).then((user) => {
            if(user){
                done(null, user)
            }else{
                new User({googleID: profile.id}).save()
                .then((user) => {
                    done(null, user)
                })
            }
        })
    })
)