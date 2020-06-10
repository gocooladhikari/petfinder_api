const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: true
    },
    active: {
        type: Boolean
    },
    secretcode: {
        type: String
    },
    reset: {
        type: Boolean,
        default: true
    }
})

const User = mongoose.model('users', userSchema)
module.exports = User