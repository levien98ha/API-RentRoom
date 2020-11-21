const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const profileSchema = mongoose.Schema({
    useri_id: {
        type: String
    },
    name: {
        type: String,
        trim: true
    },
    date_of_birth: {
        type: String
    },
    gender: {
        type: Number,
        enum: [0, 1]
    },
    city: {
        type: String
    },
    district: {
        type: String
    },
    ward: {
        type: String
    },
    imgUrl: {
        type: String
    },
    phonenumber: {
        type: String
    },
    ex_key: {
        type: Number
    }
});

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile