require('dotenv').config()
const express = require('express')
const router = express.Router()
const db = require('../models')

router.post('/create', (req, res) => {
  // create room in db
  db.room.findOrCreate({
    where: {
      name: req.body.roomname
    },
    defaults: {
      userId: req.body.roomOwner,
      password: req.body.roompassword,
      isPublic: req.body.roomIsPub
    }
  })
  .then(([room, wasCreated]) => {
    if (wasCreated) {
      res.send(room)
    } else {
      res.status(400).send()
    }
  })
  .catch(err => console.log(err))
})

module.exports = router;