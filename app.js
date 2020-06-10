const express = require("express")
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const cors = require('cors')
const passport = require('passport')
const cookieSession = require("cookie-session")
const keys = require('./config/key')
require('./model/LostPet')

require('./model/GoogleUser')
require('./services/passport')

const app = express()

// Database connection
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex: true })
    const connection = mongoose.connection
    connection.once('open', () => {
      console.log("MongoDB database connection established successfully")
   })

app.use('/uploads', express.static('uploads'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// cors
app.use(cors())

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
}))

app.use(passport.initialize())
app.use(passport.session())

const userRouter = require('./routes/user')
const lostRouter = require('./routes/lost')
const adoptionRoute = require('./routes/adoption')

require('./routes/authRoute')(app)
app.use('/', userRouter)
app.use('/lost', lostRouter)
app.use('/adoption', adoptionRoute)

// Email validation check
// const emailExists = require('email-exists')
// console.log('Email check')

// emailExists({sender: 'gocool.adhikari11@gmail.com', recipient: 'adhikari@gmail.com'})
//     .then(console.log).catch(console.log)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log('Listening to port: 5000'))