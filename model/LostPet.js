const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newOwner = new Schema({
    ownername: {type: String},
    owneremail: {type: String}
})

const newDescription = new Schema({
    aboutpet: {type: String},
    fromowner: {type: String}
})

const newLost = new Schema({
    name:{type: String, required: true},
    breed: {type: String},
    age: {type: Number},
    // Picture remaining
    petImage: [{type: String, trim: true}],
    ownerinfo: [
        newOwner
    ],
    gender: {type: String, required: true},
    colour: {type: String},
    description: [
        newDescription
    ],
    address: [{type: String, required: true}],
    found: {type: Boolean},
    createdAt: {type: Date, default: Date.now()},
    time: {type: String}
})

 mongoose.model('losts', newLost)
 mongoose.model('owner', newOwner)
 mongoose.model('description', newDescription)
// module.exports = Lost