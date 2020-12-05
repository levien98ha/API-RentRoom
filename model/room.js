const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const roomSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String
    },
    photo: [{
        name: {
            type: String
        },
        img_url: {
            type: String
        }
    }],
    status: {
        type: String,
        enum: ['AVAILABLE', 'UNAVAILABLE']
    },
    price: {
        type: Number,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    time_description: {
        type: String,
        required: true
    },
    toilet: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    district: {
        type: String
    },
    ward: {
        type: String
    },
    description: {
        type: String
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    user_rent: {
        type: String,
        ref: 'User'
    },
    date_time: {
        type: String
    },
    ex_key: {
        type: Number
    }
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room