const router = require('express').Router()
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const LostPet = mongoose.model("losts")

// Multer 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log(file)
        cb(null, './uploads/lostPets')
    },
    filename: (req, file, cb) => {
        // console.log(file.filename)
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req, file, cb ) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
     limits: {
        fileSize: 1024 * 1024 * 50
    },
    fileFilter: fileFilter
})


// Time Calculations
const CalcDate = (createdAt) => {
    var milisecnow = Date.now()
    var miliseccreated = Date.parse(createdAt)
    var timeinmilisec = milisecnow - miliseccreated

    var miliSec = timeinmilisec
    var sec = 1000
    var hour = sec * 60 * 60
    var day = hour * 24
    var week = day * 7
    var month = day * 30

    var days = Math.round(miliSec/day)
    var weeks = Math.round(miliSec/week)
    var months = Math.round(miliSec/month)

}

router.route('/').get((req, res) => {
    LostPet.find().then(pets => {
        
        for(var i = 0; i<pets.length; i++ ){
            console.log(pets[i].name)
            const name = 'shephard'
            pets[i].breed = name
            pets.save()
        }

    }).catch(err => console.log(err))
})

router.post('/add', upload.array('petImage', 4), (req, res) => {
    // console.log(req.files)
    const name = req.body.name
    const breed = req.body.breed
    const age = req.body.age
    const gender = req.body.gender
    const colour = req.body.colour
    const address = req.body.address
    const ownername = req.body.ownername
    const owneremail = req.body.owneremail
    // const ownerId = req.body.ownerId
    const aboutpet = req.body.aboutpet
    const fromowner = req.body.fromowner
    // const petImage = req.files.path
    var found = false

    LostPet.findOne({name: name})
        .then(user => {
            if(user){
                console.log(user)
                res.json('You already have posted about your pet')

            }else{
                const newLost = new LostPet({
                    name, 
                    breed,
                    age,
                    gender,
                    colour,
                    address,
                    // petImage,
                    found
                })

                for(var i = 0; i<req.files.length; i++){
                    newLost.petImage.push(req.files[i].path)
                }

                newLost.ownerinfo.push({
                    ownername,
                    owneremail
                })

                newLost.description.push({
                    aboutpet,
                    fromowner
                })

                newLost.save().then(user => {
                    console.log('added')
                    res.json(user)

                    // Date calculations
                    var created = "May 29, 2020"
                    var milisecnow = Date.now()
                    var miliseccreated = Date.parse(created)
                    var timeinmilisec = milisecnow - miliseccreated

                    var miliSec = timeinmilisec
                    var sec = 1000
                    var hour = sec * 60 * 60
                    var day = hour * 24
                    var week = day * 7
                    var month = day * 30

                    var days = Math.round(miliSec/day)
                    var weeks = Math.round(miliSec/week)
                    var months = Math.round(miliSec/month)

                    if(months == 0 && weeks == 0 && days == 0){
                        console.log('Today')
                        user.time = 'Today'
                    }
                    else if(months == 0 && weeks == 0){
                        console.log(days + ' days')
                        if(days == 1){
                            user.time = days + ' day ago'
                        }else{
                            user.time = days + ' days ago'
                        }
                        
                    }
                    else if(months == 0 && weeks !== 0){
                        console.log(weeks + ' weeks')
                        if(weeks == 1){
                            user.time = weeks + ' week ago'
                        }else{
                            user.time = weeks + ' weeks ago'
                        }
                    }
                    else if(months !== 0 && weeks !== 0 && days !== 0){
                         console.log(months + ' months')
                         if(months == 1){
                            user.time = months + ' month ago'
                        }else{
                            user.time = months + ' months ago'
                        }
                    }

                    user.save()

                   
                }).catch(err => console.log(err))
            }
        }).catch(err => res.json(err))

})

router.route('/:postId/found').get((req, res) => {
    LostPet.findById(req.params.postId).then(user =>{
        if(user){
            user.found = true
            user.save()
            res.json('Dog Found')
            console.log('dog found')
        }else{
            res.json('user not found')
        }
    }).catch(err => res.status(400).json(err))
})

//Testing route for address search 

// router.route('/search/bansbari').get((req, res)=>{
//     const add = "bansbari"
//     LostPet.find({address: {$in: ["bansbari"]}}).then(aadrs => {
//         if(!aadrs){
//             console.log('No dog in particular address')
//         }else{
//             console.log("dog found")
//             for(var i = 0; i < aadrs.length; i++){
//                 console.log(aadrs[i].name)
//             }
//             console.log(aadrs)
//             // console.log(aadrs.breed)
            
//         }
//     })
// })


module.exports = router