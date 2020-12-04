var express = require('express');
const User = require('../model/user')
const Room = require('../model/room')
const Request = require('../model/request')
var router = express.Router();
const auth = require('../middleware/auth');
const { on } = require('../model/user');

var limit = 10;

// get list request by user rent 
router.post('/request/send', async (req, res) => {
    Request.find({ user_rent: req.body.userId })
    .skip((req.body.page - 1) * limit)
    .limit(limit)
    .exec((err, doc) => {
        if (err) {
          return res.json(err);
        }
        Request.countDocuments({ user_owner: req.body.userId }).exec((count_error, count) => {
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

// get list request by owner 
router.post('/request/receive', async (req, res) => {
    Request.find({ user_owner: req.body.userId })
    .skip((req.body.page - 1) * limit)
    .limit(limit)
    .exec((err, doc) => {
        if (err) {
          return res.json(err);
        }
        Request.countDocuments({ user_owner: req.body.userId }).exec((count_error, count) => {
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

// create user for admin
router.post('/request', async (req, res) => {

    const checkExist = Request.find({ user_rent: req.body.userRent, room_id: req.body.roomId })
    if (!checkExist) throw Error('Request rent room is exist.')

    // Create a new user
    try {
        const { userOwner, userRent, roomId } = req.body;
        const checkRoomStatus = (await Room.findOne({_id: roomId})).toObject()
        if (checkRoomStatus.status === 'UNAVAILABLE') throw Error('Room has rent by another user.')
        const request = new Request({
            user_owner: userOwner,
            user_rent: userRent,
            room_id: roomId,
            status: 'IN PROGRESS',
            ex_key: 0
        })
        await request.save()

        const obj = {
          room_id: roomId
        }
        
        const userUpdate = await User.update({_id: userRent}, { $push: { request: obj} }, {upsert:true})
        console.log(userUpdate)
        res.status(201).send({ data: request })
    } catch (error) {
        res.status(400).send(error)
    }
})

// change status request
router.put('/request', async (req, res) => {
    try {
        const { userId, requestId, status, ex_key } = req.body
        const request = (await Request.findOne({ _id: requestId })).toObject()

        // check status room
        const checkRoomStatus = (await Room.findOne({_id: request.roomId})).toObject()

        if (userId !== request.user_owner || userId !== request.user_rent || (userId === request.user_owner && userId === request.user_rent))
            throw Error('User can not update room. Please contact with administrator.')

        // check exkey
        if (ex_key !== request.ex_key) throw Error('Data has changed. Please reload page to update data.')

        // update
        if (userId === request.user_owner) {
            if (status === 'IN PROGRESS' || status === 'CANCEL') throw Error('User can not change status room.')
            request.status = status
            ex_key = ex_key + 1
            if (status === 'ACCEPT') {
                checkRoomStatus.status = 'UNAVAILABLE'
                await (await checkRoomStatus).save()

                // change all status request
                const listRequest = await Request.find({room_id: (await checkRoomStatus)._id})
                for (const list in listRequest) {
                    list.status = 'DENIED'
                    await list.save()
                }
            }
        } else if (userId === request.user_rent) {
            if (status === 'ACCEPT' || status === 'DENIED') throw Error('User can not change status room.')
            if (checkRoomStatus.status === 'UNAVAILABLE') throw Error('Room has rent by another user.')
            request.status = status
            ex_key = ex_key + 1
        }
        await request.save()
        res.status(200).send({ request })
    } catch (error) {
        res.status(400).send(error)
    }
})

// get user profile 
router.post('/request/user', async (req, res) => {
  try {    console.log(req)
    const checkUser = await Request.find({room_id: req.body._id, user_rent: req.body.userId, status: 'IN PROGRESS' })
    res.send({ data: checkUser })
  } catch(error) {
    res.status(400).send(error)
  }
})

module.exports = router;
