const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const requestSchema = mongoose.Schema({
    user_owner: {
        type: String,
        ref: 'User',
        required: true
    },
    user_rent: {
        type: String,
         ref: 'User',
        required: true
    },
    room_id: {
        type: String, ref: 'Room'
    },
    status: {
        type: String,
        enum: ['IN PROGRESS', 'ACCEPT', 'DENIED', 'CANCEL']
    },
    ex_key: {
        type: Number
    }
})

const Request = mongoose.model('Request', requestSchema)

module.exports = Request