const router = require('express').Router();
const validator = require('validator')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const randomstring = require('randomstring')
const multer = require('multer')
const bcrypt = require('bcrypt')

const User = require('../model/User')
const Sendgrid = require('../config/sendgrid')

// Multer disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/users')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

// File Filter to upload only images
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

// Multer setup
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    filefilter: fileFilter
})

// Sendgrgid options
// const options = {
//     auth: {
//         api_user: Sendgrid.user,
//         api_key: Sendgrid.pass
//     }
// }

const client = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adhikari.gokul5@gmail.com',
        pass: 'hackme1234gocool22'
    }
})


router.route('/user').get((req, res) => {
        // res.send('works')
        User.find().then(
            users =>{
                res.json(users)
            }
        ).catch(err => res.status(400).json('Error: ' + err))
})

router.post('/user/signup', upload.single('profilePicture'),(req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const password2 = req.body.password2
    const profilePicture = req.file.path


    User.findOne({username: username})
        .then(user => {
            if(user){
                res.json('User already exists')
            }else{
                if(password != password2){
                    res.json('Passwords donot match')
                    console.log('Passwords donot match')
                }else{

                    if(!validator.isEmail(req.body.email)){
                        res.json('Invalid Email')
                    }else{
                        const secretcode = randomstring.generate(4)

                        const newUser = new User({
                            username: username,
                            email: email,
                            password: password,
                            profilePicture: profilePicture,
                            secretcode: secretcode,
                            active: false
                        })

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if(err) throw err
                                newUser.password = hash
                                // newUser.save()
                                //     .then(() => {
                                //         res.json('User added')
                                //         console.log('added')
                                //         console.log(profilePicture)
                                //     }).catch(err => res.status(400).json('Errors:' + err))
                                
                            })
                        })

                        var sendEmail = {
                            from: 'gocool.adhikari11@gmail.com',
                            to: email,
                            subject: 'Account verification',
                            text: '',
                            html: `Token: ${secretcode}`
                        }
                        client.sendMail(sendEmail, (err, info) => {
                            if(err){
                                console.log('This is error: ' + err)
                            }else{
                                console.log(info)
                                newUser.save().then((user) => {
                                    res.json('User added')
                                    console.log(user)
                                }).catch(err => res.status(400).json('Errors: ' + err))
                            }
                        })
                        
                    }
                        
                }

                
                    
            }
        }) 
})

router.route('/user/signup/verify').post((req, res) => {
    const secretcode = req.body.secretcode
    User.findOne({secretcode: secretcode}).then((user) => {
        // console.log(user)
        if(!user){
            res.json('Code doesnot match')
        }else{
            user.secretcode = ''
            user.active = true
            user.save()
            console.log(user)
            res.json('User added to database')
        }

    }).catch(err => res.status(400).json('Error: ' + err))
})

router.route('/user/signin').post((req, res) => {
    const email = req.body.email
    let password = req.body.password

    User.findOne({email: email})
    .then((user) =>{
        if(!user){
            res.json('User not registered')
            console.log('not registered')
        }else{
            // Check if user is verified
            if(user.active == false){
                console.log('Please verify your account first')
                res.json('Please verify your account first')
            }else{
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err
                    if(isMatch) {
                        res.json('Logged In')
                    }else{
                        res.send('password dont match')
                    }
                })
            }
            
            
        }
    }).catch(err => console.log(err))
})

// Forgot password handling routes
router.route('/user/reset').post((req, res) => {
    const email = req.body.email
    User.findOne({email: email}).then(user => {
        if(!user){
            console.log('Your email is invalid. PLease enter a valid email')
            res.json('Your email is invalid. PLease enter a valid email')
        }else{
            console.log('Do some resetting logics')
            const sendEmail = {
                from: 'adhikari.gokul5@gmail.com',
                to: email,
                subject: 'Password Resetting',
                html: `<a>localhost:5000/user/userID/reset</a>`
            }

            client.sendMail(sendEmail, (err, info) => {
                if(err){
                    console.log(err)
                }else{
                    console.log(info)
                    res.json('Sent')
                    user.reset = false
                }
            })
        }
    }).catch(err => console.log(err))
})

router.route('/:userId/reset').post((req, res) => {
    const password = req.body.password
    const password2 = req.body.password2

    User.findById(req.params.userId).then(user => {
        if(!user){
            console.log('Something went wrong')
        }else{
            if(password !== password2){
                console.log('Both passwords dont match')
            }else{
                console.log(password)
                User.findByIdAndUpdate(req.params.userId, {"password": password}).then(result => {
                    if(result){
                        console.log(result)
                        res.json(result)
                    }
                }).catch(err => console.log("This is error: " + err))
                
            }
        }
    }).catch(err => console.log(err))
})

module.exports = router
