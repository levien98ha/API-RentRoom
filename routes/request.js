var express = require('express');
const User = require('../model/user')
const Request = require('../model/request')
var router = express.Router();
const auth = require('../middleware/auth')

// get list request by user rent 
router.get('/request/send', async (req, res) => {
    Request.find({ user_rent: req.body.userId },
        function (err, result) {
            if (err) throw err
            res.status(200).send({ result });
        })
})

// get list request by owner 
router.get('/request/receive', async (req, res) => {
    Request.find({ user_owner: req.body.userId },
        function (err, result) {
            if (err) throw err
            res.status(200).send({ result });
        });
})

// create user for admin
router.post('/request', async (req, res) => {

    const checkExist = Request.find({user_rent: req.body.userRent, room_id: roomId})
    if (checkExist) throw new Error('Request rent room is exist.')

    // Create a new user
    try {
        const { userOwner, userRent, roomId } = req.body;
        const request = new Request({
            user_owner: userOwner,
            user_rent: userRent,
            room_id: roomId,
            status: 'IN PROGRESS',
            ex_key: 0
        })
        await request.save()
        res.status(201).send({ request })
    } catch (error) {
        res.status(400).send(error)
    }
})

// change status request
router.put('/request', async (req, res) => {
    try {
        const { userId, requestId, status, ex_key } = req.body
        const request = Request.findOne({ _id: requestId }, function (err, result) {
            if (err) throw err
        });
        if (userId !== request.user_owner || userId !== request.user_rent || (userId === request.user_owner && userId === request.user_rent))
            throw new Error('User can not update room. Please contact with administrator.')

        // check exkey
        if (ex_key !== request.ex_key) throw new Error('Data has changed. Please reload page to update data.')

        // update
        if (userId === request.user_owner) {
            if (status === 'IN PROGRESS' || status === 'CANCEL') throw new Error('User can not change status room.')
            request.status = status
            ex_key = ex_key + 1
        } else if (userId === request.user_rent) {
            if (status === 'ACCEPT' || status === 'DENIED') throw new Error('User can not change status room.')
            request.status = status
            ex_key = ex_key + 1
        }
        await request.save()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;
