const router = require('express').Router()
const Adoption = require('../model/Adoption')
const multer = require('multer')
const sharp = require('sharp')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/Adoption')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

router.route('/').get((req, res) => {
    Adoption.find().pretty().then(pets => {
        res.json(pets)
    }).catch(err => res.status(400).json(err))
})

router.route('/add').post(upload.single('adoptPicture'), (req, res) => {
    const{name, breed, description, health, address, colour} = req.body
    // const adoptPicture = req.file.path
    var adopted = false

    sharp(req.file.path)
        .resize(200, 200)
        .toFile('./uploads/resize/resized_' + req.file.originalname, (err) => {
            if(!err){
                console.log('Resized successfully')
            }else{
                console.log(err)
            }
        })
        const adoptPicture = './uploads/resize/resized_' + req.file.originalname

    const newAdoption = new Adoption({
        name,
        breed,
        description,
        health,
        address,
        colour,
        adoptPicture,
        adopted
    })
    newAdoption.save().then(user => {
        console.log("new pet to be adopted added")
        console.log(adoptPicture)
        res.json(user)
    }).catch(err => res.status(400).json(err))

})

router.route('/:postId').get((req, res) => {
    Adoption.findById(req.params.postId).then(user => {
        if(!user){
            res.json('No Pets found')
        }else{
            res.json(user.name + '  ' + user.breed + '  ' + user.address)
           
        }
    }).catch(err => res.status(400).json(err))
})

router.route('/:postId/adopted').get((req, res) => {
    Adoption.findById(req.params.postId).then(user => {
        if(user){
            user.adopted = true
            user.save()
            console.log("adopted!!!")
            res.json('Adopted')
        }else{
            res.json("no dog found")
        }
    }).catch(err => res.status(400).json(err))
})

module.exports = router