const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const invoiceSchema = mongoose.Schema({
    user_id: {
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
    }, 
    ex_key: {
        type: Number
    }
})

const Invoice = mongoose.model('Invoice', invoiceSchema)

module.exports = Invoice