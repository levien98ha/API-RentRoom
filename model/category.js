const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ex_key: {
        type: Number,
        required: true
    }
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category