require('dotenv').config()
const express = require('express')
const router = express.Router()
const db = require('../models')
const bcrypt = require('bcryptjs')
const { subscribe } = require('./users')

router.post('/create', (req, res) => {
  // create room in db
  if (req.body.password === "") {
    db.room.findOrCreate({
      where: {
        name: req.body.name
      },
      defaults: {
        userId: req.body.userId,
        password: '',
        isPublic: req.body.isPublic
      }
    })
    .then(([room, wasCreated]) => {
      if (wasCreated) {
        db.usersRooms.create({
          userId: req.body.userId,
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
  } else {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
      db.room.findOrCreate({
        where: {
          name: req.body.name
        },
        defaults: {
          userId: req.body.userId,
          password: hash,
          isPublic: req.body.isPublic
        }
      })
      .then(([room, wasCreated]) => {
        if (wasCreated) {
          db.usersRooms.create({
            userId: req.body.userId,
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
  }
})

router.post('/find', (req, res) => {
  console.log(req.body);
  db.room.findOne({where: {name: req.body.roomname}})
  .then(room => {
    res.send(room)
  })
})

router.post('/msgInit', (req, res) => {
  let findMsgs = () => {
    db.message.findAll({where: {roomId: req.body.room.id}, include: [db.user]})
    .then(msgs => {
      res.send(msgs)
    })
    .catch(err => console.log(err))
  }

  db.usersRooms.findOne({
    where: {
      userId: req.body.user.id,
      roomId: req.body.room.id
    }
  })
  .then(subscribedRoom => {
    if (subscribedRoom) {
      findMsgs()
    } else {
      db.room.findOne({where: {
        id: req.body.room.id
      }})
      .then(room => {
        if (room.isPublic) {
          findMsgs()
        } else {
          res.status(404).send()
        }
      })
      .catch(err => console.log(err))
    }
  })
  .catch(err => console.log(err))
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
  db.usersRooms.findOrCreate({
    where: {
      userId: req.body.userId,
      roomId: req.body.roomId,
    }
  })
  .then(([userRoom, wasCreated]) => {
    if (wasCreated) {
      res.send(true)
    } else {
      if (userRoom) {
        res.send(true)
      } else {
        res.send(false)
      }
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