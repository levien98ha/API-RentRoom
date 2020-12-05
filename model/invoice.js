const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const invoiceSchema = mongoose.Schema({
    title: {
        type: String
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    user_rent: {
        type: String,
        required: true,
        ref: 'User'
    },
    room_id: {
        type: String,
        required: true,
        ref: 'Room'
    },
    date_start: {
        type: String
    },
    date_end: {
        type: String
    },
    electric_before: {
        type: Number
    },
    water_before: {
        type: Number
    },
    electric_last: {
        type: Number
    },
    water_last: {
        type: Number
    },
    total: {
        type: Number
    }
})

const Invoice = mongoose.model('Invoice', invoiceSchema)

module.exports = Invoice