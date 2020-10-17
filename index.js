require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 8000
const passport = require('passport')

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

app.listen(port, () => {
  console.log('Port is running on', port)
});