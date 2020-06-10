const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const newAdoption = new Schema({
    name: {type: String, required: true},
    breed: {type: String},
    // picture rtemaining
    adoptPicture: {type: String, required: true},
    description: {type: String, required: true},
    health: {type: String, required: true},
    address: {type: String, required: true},
    colour: {type: String, required: true},
    adopted: {type: Boolean}
})

const Adoption = mongoose.model('adoptions', newAdoption)
module.exports = Adoption