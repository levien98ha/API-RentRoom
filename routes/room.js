var express = require('express');
const Room = require('../model/room')
var router = express.Router();
const auth = require('../middleware/auth')

// get list user 
router.get('/room/list', async (req, res) => {
  Room.find({}, function(err, rooms) {
    res.status(200).send({rooms: rooms});
 });
})