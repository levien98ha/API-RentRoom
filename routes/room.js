var express = require('express');
const Room = require('../model/room')
var router = express.Router();
const auth = require('../middleware/auth')

// get list room 
router.get('/room/list', async (req, res) => {
    Room.find({}, function (err, rooms) {
        res.status(200).send({ rooms: rooms });
    });
})

// create room
router.post('/room', async (req, res) => {
    try {
        const { title, photo, status, price, area, time_description, toilet, city, district, ward, description, user_id, user_rent} = req.body;
        const room = new Room({
            title: title,
            photo: photo,
            status: status,
            price: price,
            area: area,
            time_description: time_description,
            toilet: toilet,
            city: city,
            district: district,
            ward: ward,
            description: description,
            user_id: user_id,
            user_rent: user_rent,
            ex_key: 0,
            del_flg: 0
        })
        await room.save()
        res.status(201).send({ room })
    } catch (error) {
        res.status(400).send(error)
    }
})