require('dotenv').config()
const express = require('express')
const router = express.Router()
const db = require('../models')
const bcrypt = require('bcryptjs')

router.post('/create', (req, res) => {
  // create room in db
  bcrypt.hash(req.body.roompassword, 10)
  .then(hash => {
    db.room.findOrCreate({
      where: {
        name: req.body.roomname
      },
      defaults: {
        userId: req.body.roomOwner,
        password: hash,
        isPublic: req.body.roomIsPub
      }
    })
    .then(([room, wasCreated]) => {
      if (wasCreated) {
        db.usersRooms.create({
          userId: req.body.roomOwner,
          roomId: room.id
        })
        .then(userRoom => {
          if (userRoom) {
            res.send(room)
          } else {
            res.status(400).send()
          }
        })
        .catch(err => console.log(err))
      } else {
        res.status(400).send()
      }
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))
})

router.post('/find', (req, res) => {
  console.log(req.body);
  db.room.findOne({where: {name: req.body.roomname}})
  .then(room => {
    res.send(room)
  })
})

router.post('/msgInit', (req, res) => {
  // TODO see if user has permission to get messages (has used password and favorited the room)
  // req.body.user.id
  // then do the following:
  db.message.findAll({where: {roomId: req.body.room.id}, include: [db.user]})
  .then(msgs => {
    res.send(msgs)
  })
})

router.post('/is-subscribed', (req, res) => {
  db.usersRooms.findOne({
    where: {
      userId: req.body.userId,
      roomId: req.body.roomId,
    }
  })
  .then(userRoom => {
    if (userRoom) {
      res.send(true)
    } else {
      res.send(false)
    }
  })
  .catch(err => console.log(err))
})

router.post('/subscribe', (req, res) => {
  db.usersRooms.create({
    userId: req.body.userId,
    roomId: req.body.roomId,
  })
  .then(userRoom => {
    if (userRoom) {
      res.send(true)
    } else {
      res.send(false)
    }
  })
  .catch(err => console.log(err))
})

router.post('/unsubscribe', (req, res) => {
  db.usersRooms.destroy({
    where: {
      userId: req.body.userId,
      roomId: req.body.roomId,
    }
  })
  .then(destroyedNum => {
    if (destroyedNum) {
      res.send(true)
    } else {
      res.send(false)
    }
  })
  .catch(err => console.log(err))
})

router.get('/public', (req, res) => {
  db.room.findAll({where: {isPublic: true}})
  .then(pubRooms => {
    if (pubRooms) {
      res.send(pubRooms)
    } else {
      res.status(404).send()
    }
  })
  .catch(err => console.log(err))
})

module.exports = router;