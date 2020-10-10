require('dotenv').config()

// Passport strategy for authenticating with JSON Web Token
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const sequelize = require('sequelize')
const db = require('../models')
const options = {}
// jwtFromRequest: function that accepts a request as the
// only parameter & returns either the JWT as a string or null

// fromAuthHeaderAsBearerToken() creates an extractor that looks for JWT in auth header
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
options.secretOrKey = process.env.JWT_SECRET

module.exports = (passport) => {
  passport.use(new JwtStrategy(options, (jwtPayload, done) => {
    db.user.findOne(jwtPayload.id)
    .then(user => {
      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
    .catch(error => console.log(error))
  }))
};