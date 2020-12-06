var express = require('express');
const Mark = require('../model/marksRoom')
var router = express.Router();
const User = require('../model/user')
var limit = 10;

// get list mark by user id 
router.post('/mark/list', async (req, res) => {
    Mark.find({user_id: req.body.userId})
    .skip((req.body.page - 1) * limit)
    .limit(limit)
    .exec((err, doc) => {
        if (err) {
          return res.json(err);
        }
        Mark.countDocuments({user_id: req.body.userId}).exec((count_error, count) => {
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

// get list mark by user id 
router.post('/mark/list/all', async (req, res) => {
  try {
    const list = await Mark.find({user_id: req.body.userId})
    res.status(200).send({data: list})
  } catch (error) {
    res.status(400).send(error)
  }
})

// create mark
router.post('/mark', async (req, res) => {
    try {
        const { userId, roomId } = req.body;
        const mark = new Mark({
            user_id: userId,
            room_id: roomId,
            ex_key: 0
        })
        await mark.save()

        const obj = {
            room_id: roomId
        }
          
        const userUpdate = await User.update({_id: userId}, { $push: { mark: obj} }, {upsert:true})
        res.status(201).send({data: mark })
    } catch (error) {
        res.status(400).send(error)
    }
})

// create mark by userId and roomId
router.post('/mark/del', async (req, res) => {
    try {
      const mark = await Mark.findOneAndDelete({ user_id: req.body.userId, room_id: req.body.roomId })
      const user = await User.findOneAndUpdate({_id: req.body.userId}, {$pull : {mark: {room_id: req.body.roomId}}})
        res.status(201).send({data: mark})
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;