require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {})
const cors = require('cors')
const port = process.env.PORT || 8000
const passport = require('passport')
const db = require('./models')

app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(passport.initialize())
require('./config/passport')(passport)

app.get('/', (req, res) => {
  res.send("Hello World")
})

app.use('/users', require('./controllers/users'))
app.use('/rooms', require('./controllers/rooms'))

io.on('connection', (socket) => {
  console.log('New client connected')
  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })

  socket.on('SEND_MESSAGE', (data) => {
    // add data.author and data.message to db
    db.message.create(data)
    .then(msg => {
      db.user.findOne({where: {id: msg.userId}})
      .then(user => {
        let out = {
          roomId: msg.roomId,
          userId: msg.userId,
          content: msg.content,
          user: {
            username: user.username
          }
        }
        io.emit('RECEIVE_MESSAGE', out)
      })
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
  })
})

server.listen(port, () => {
  console.log('Port is running on', port)
});