require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const db = require('../models')

router.post('/signup', (req, res) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    db.user.findOrCreate({
      where: {
        username: req.body.username
      },
      defaults: {
        email: req.body.email,
        password: hash
      }
    }).then(([user, wasCreated]) => {
      if (wasCreated) {
        res.json(user)
      } else {
        res.status(400).json({msg: 'Username already exists'})
      }
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))
})

router.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  // Find a user via username
  db.user.findOne({where: {username}})
  .then(user => {
    if (!user) {
      res.status(400).json({msg: 'User not found'})
    } else {
      bcrypt.compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          const payload = {
            id: user.id,
            username: user.username
          }
          jwt.sign(payload, JWT_SECRET, {expiresIn: 3600}, (error, token) => {
            res.json({success: true, token: `Bearer ${token}`})
          })
        } else {
          return res.status(400).json({password: 'Password or email is incorrect'})
        }
      })
      .catch(err => console.log(err))
    }
  })
  .catch(err => console.log(err))
})

router.get('/profile/:userId', (req, res) => {
  db.user.findOne({where: {id: req.params.userId}, include: [db.room]})
  .then(userInfo => {
    if (userInfo.rooms.length === 0) {
      res.send([''])
    } else {
      res.send(userInfo.rooms)
    }
  })
  .catch(err => console.log(err))
})

router.post('/userInfo', (req, res) => {
  db.user.findOne({where: {id: req.body.user.id}})
  .then(user => {
    if (user) {
      res.send(user)
    } else {
      res.status(400).send()
    }
  })
})

router.post('/update-email', (req, res) => {
  db.user.update({email: req.body.email}, {where: {id: req.body.user.id}})
  .then(user => {
    if (user) {
      res.send(true)
    } else {
      res.status(400).send()
    }
  })
})

router.post('/update-password', (req, res) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    db.user.update({password: hash}, {where: {id: req.body.user.id}})
    .then(user => {
      if (user) {
        res.send(true)
      } else {
        res.status(400).send()
      }
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))
})

module.exports = router;