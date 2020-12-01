var express = require('express');
const Room = require('../model/room')
const User = require('../model/user')
const Request = require('../model/request')
var router = express.Router();
const auth = require('../middleware/auth')

var limit = 10;

// get room by id 
router.get('/room/:id', async (req, res) => {
    const roomById = await Room.findById(req.params.id)
    res.status(200).send({ roomById })
})

// get list room 
router.get('/room/list', async (req, res) => {
    Room.find({})
        .skip((req.body.page - 1) * limit)
        .limit(limit)
        .exec((err, doc) => {
            if (err) {
                return res.json(err);
            }
            Room.countDocuments({}).exec((count_error, count) => {
                if (err) {
                    return res.json(count_error);
                }
                return res.json({
                    total: count,
                    page: req.body.page,
                    pageSize: doc.length,
                    data: doc
                });
            })
        })
})

// get recently room
router.post('/room/recently', async (req, res) => {
    try {
        const room = await Room.find({}).sort({'date_time': -1}).limit(6)
        res.status(200).send({ data: room })
    } catch (err) {
        res.status(400).send(err)
    }
})

// get same room
router.post('/room/search/same', async (req, res) => {
    Room.find({
        category: req.body.category,
        user_id: req.body.userId
    },
        function (err, result) {
            if (err) throw err
            res.status(200).send({ result });
        }).limit(2);
})

// get search 
router.post('/room/search', async (req, res) => {
    Room.find({
        category: req.body.category,
        price: { $gte: req.body.minPrice, $lte: req.body.maxPrice },
        are: { $gte: req.body.minArea, $lte: req.body.maxArea },
        city: { $regex: '.*' + req.body.city + '.*' },
        district: { $regex: '.*' + req.body.district + '.*' },
        ward: { $regex: '.*' + req.body.ward + '.*' }
    })
        .skip((req.body.page - 1) * limit)
        .limit(limit)
        .exec((err, doc) => {
            if (err) {
                return res.json(err);
            }
            Room.countDocuments({
                category: req.body.category,
                price: { $gte: req.body.minPrice, $lte: req.body.maxPrice },
                are: { $gte: req.body.minArea, $lte: req.body.maxArea },
                city: { $regex: '.*' + req.body.city + '.*' },
                district: { $regex: '.*' + req.body.district + '.*' },
                ward: { $regex: '.*' + req.body.ward + '.*' }
            }).exec((count_error, count) => {
                if (err) {
                    return res.json(count_error);
                }
                return res.json({
                    total: count,
                    page: req.body.page,
                    pageSize: doc.length,
                    data: doc
                });
            })
        })
})

// get list room by customer id 
router.post('/user/room', async (req, res) => {
    Room.find({
        user_id: req.body.user_id
    })
        .skip((req.body.page - 1) * limit)
        .limit(limit)
        .exec((err, doc) => {
            if (err) {
                return res.json(err);
            }
            Room.countDocuments({ user_id: req.body.user_id }).exec((count_error, count) => {
                if (err) {
                    return res.json(count_error);
                }
                return res.json({
                    total: count,
                    page: req.body.page,
                    pageSize: doc.length,
                    data: doc
                });
            })
        })
})

// create room
router.post('/room', async (req, res) => {
    try {
        const { title, category, photo, price, area, time_description, toilet, city, district, ward, description, user_id } = req.body;
        const room = new Room({
            title: title,
            category: category,
            photo: photo,
            status: 'AVAILABLE',
            price: price,
            area: area,
            time_description: time_description,
            toilet: toilet,
            city: city,
            district: district,
            ward: ward,
            description: description,
            user_id: user_id,
            user_rent: '',
            date_time: formatDate(),
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
        const roomExist = await Room.findById(req.body._id)
        const userOwner = await User.findById(req.body.user_id)
        if (((roomExist.user_id !== (await userOwner)._id) && userOwner.role === 'operator') ||
            userOwner.role === 'user') { throw new Error('User can not role update room.') }
        roomExist.title = title
        roomExist.category = category
        roomExist.photo = photo
        roomExist.status = status
        roomExist.price = price
        roomExist.area = area
        roomExist.time_description = time_description
        roomExist.toilet = toilet
        roomExist.city = city
        roomExist.district = district
        roomExist.ward = ward
        roomExist.description = description
        roomExist.user_id = user_id,
        roomExist.user_rent = user_rent
        roomExist.date_time = roomExist.date_time
        roomExist.ex_key = ex_key + 1
        await roomExist.save()
        // check list request if room is unavailable
        if (status === 'UNAVAILABLE') {
            const findRequest = await Request.find({ room_id: (await roomExist)._id, status: 'IN PROGRESS' })
            if (findRequest) {
                for (let list in findRequest) {
                    list.status = 'DENIED'
                    await list.save()
                }
            }
        }
        res.status(201).send(roomExist)
    } catch (error) {
        res.status(400).send(error)
    }
})

// delete room
router.post('/room/delete', async (req, res) => {
    try {
        const checkRoom = await Room.findOne({user_id: req.body.user_id})
        if (!checkRoom) {
            res.json({Error: 'You cannot delete this room'})
        }
        const room = await Room.deleteOne({_id: req.body._id})
        res.send({data: room})
    } catch (error) {
        res.status(400).send(error)
    }
})

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = router;