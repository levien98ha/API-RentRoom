const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const requestSchema = mongoose.Schema({
    user_owner: {
        type: String,
        required: true
    },
    user_rent: {
        type: String,
        required: true
    },
    room_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['IN PROGRESS', 'ACCEPT', 'DENIED', 'CANCEL']
    },
    ex_key: {
        type: Number,
        required: true
    }
})

const Request = mongoose.model('Request', requestSchema)

module.exports = Request