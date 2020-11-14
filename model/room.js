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
        type: String,
        required: true
    },
    ward: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    user_id: {
        type: String,
        required: true
    },
    user_rent: {
        type: String
    },
    ex_key: {
        type: Number,
        required: true
    },
    del_flg: {
        type: Number,
        required: true
    }
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room