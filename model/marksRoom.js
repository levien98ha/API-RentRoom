const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const marksSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    room_id: {
        type: String,
        required: true
    },
    ex_key: {
        type: Number
    }
})

const Marks = mongoose.model('Marks', marksSchema)

module.exports = Marks