var express = require('express');
const Mark = require('../model/marksRoom')
var router = express.Router();


// get list mark by user id 
router.get('/mark/list', async (req, res) => {
    Marks.find({}, function (err, userId) {
        res.status(200).send({ user_id: req.params.id });
    });
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
        res.status(201).send({ mark })
    } catch (error) {
        res.status(400).send(error)
    }
})

// create mark by userId and roomId
router.delete('/mark', async (req, res) => {
    try {
        const markDel = Mark.findOneAndDelete({ user_id: req.body.userId, room_id: req.body.roomId })
        await markDel.save()
        res.status(201).send({ markDel })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;