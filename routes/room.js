var express = require('express');
const Room = require('../model/room')
const User = require('../model/user')
var router = express.Router();
const auth = require('../middleware/auth')

// get room by id 
router.get('/room/:id', async (req, res) => {
    const roomById = Room.findById(req.params.id)
    res.status(200).send({ roomById })
})

// get list room 
router.get('/room/list', async (req, res) => {
    Room.find({}, function (err, rooms) {
        res.status(200).send({ rooms: rooms });
    });
})

// get search 
router.get('/room/search', async (req, res) => {
    Room.find({ 
        category: req.body.category,
        price: { $gte: req.body.minPrice, $lte: req.body.maxPrice }, 
        are: { $gte: req.body.minArea, $lte: req.body.maxArea }, 
        city: { $regex: '.*' + req.body.city + '.*' },
        district: { $regex: '.*' + req.body.district + '.*' },
        ward: { $regex: '.*' + req.body.ward + '.*' } }, 
        function (err, result) {
            if (err) throw err
            res.status(200).send({result}); 
        });
})

// get list room by customer id 
router.get('/user/room', async (req, res) => {
    Room.find({ 
        user_id: req.body.user_id}, 
        function (err, result) {
            if (err) throw err
            res.status(200).send({result}); 
        });
})

// create room
router.post('/room', async (req, res) => {
    try {
        const { title, category, photo, status, price, area, time_description, toilet, city, district, ward, description, user_id, user_rent } = req.body;
        const room = new Room({
            title: title,
            category: category,
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
            ex_key: 0
        })
        await room.save()
        res.status(201).send({ room })
    } catch (error) {
        res.status(400).send(error)
    }
})

// update room
router.put('/room', async (req, res) => {
    try {
        const { title, category, photo, status, price, area, time_description, toilet, city, district, ward, description, user_id, user_rent, ex_key } = req.body
        const roomExist = Room.findById(req.body.id)
        const userOwner = User.findById(req.body.user_id)
        if (((roomExist.user_id !== (await userOwner)._id) && userOwner.role === 'operator') || userOwner.role === 'enduser') throw new Error('User can not role update room.')
        roomExist = {
            title: title,
            category: category,
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
            ex_key: ex_key+1
        }
        await room.save()
        res.status(201).send({ room })
    } catch (error) {
        res.status(400).send(error)
    }
})