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
    .populate({
      path: "room_id",
      model: "Room"
    })
    .populate({
      path: "user_owner",
      model: "User"
    })
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
  Request.find({ user_owner: req.body.userId }).populate({
    path: "room_id",
    model: "Room"
  })
    .populate({
      path: "user_rent",
      model: "User"
    })
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

// create request for admin
router.post('/request', async (req, res) => {

  const checkExist = Request.find({ user_rent: req.body.userRent, room_id: req.body.roomId })
  if (!checkExist) throw Error('Request rent room is exist.')

  // Create a new user
  try {
    const { userOwner, userRent, roomId } = req.body;
    const checkRoomStatus = (await Room.findOne({ _id: roomId })).toObject()
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

    const userUpdate = await User.update({ _id: userRent }, { $push: { request: obj } }, { upsert: true })
    res.status(201).send({ data: request })
  } catch (error) {
    res.status(400).send(error)
  }
})

// change status request
router.put('/request', async (req, res) => {
  try {
    const { userId, requestId, status } = req.body
    const request = await Request.findOne({ _id: requestId })

    // check status room
    const checkRoomStatus = await Room.findOne({ _id: request.room_id })

    if (userId !== request.user_owner && userId !== request.user_rent && (userId === request.user_owner && userId === request.user_rent))
      throw Error('User can not update room. Please contact with administrator.')

    // update
    if (userId === request.user_owner) {
      if (status === 'IN PROGRESS' || status === 'CANCEL') throw Error('User can not change status room.')
      request.status = status
      if (status === 'ACCEPT') {
        const updateRoom = await Room.updateOne({_id: request.room_id}, {$set : {status: 'UNAVAILABLE', user_rent: request.user_rent}});
        // change all status request
        const listRequest = await Request.updateMany({ room_id: (await checkRoomStatus)._id, _id: {$ne: requestId} }, {$set: {status: 'DENIED'}})
      }
    } else if (userId === request.user_rent) {
      if (status === 'ACCEPT' || status === 'DENIED') throw Error('User can not change status room.')
      if (checkRoomStatus.status === 'UNAVAILABLE') throw Error('Room has rent by another user.')
      request.status = status
    }
    await request.save()
    res.status(200).send({ data: request })
  } catch (error) {
    res.status(400).send(error)
  }
})

// get user profile 
router.post('/request/user', async (req, res) => {
  try {
    const checkUser = await Request.find({ room_id: req.body._id, user_rent: req.body.userId, status: 'IN PROGRESS' })
    res.json({_id: checkUser._id})
  } catch (error) {
    res.status(400).send(error)
  }
})

module.exports = router;
