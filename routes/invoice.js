var express = require('express');
const Invoice = require('../model/invoice');
const Room = require('../model/room');
var router = express.Router();


// get list mark by user id 
router.post('/invoice/list', async (req, res) => {
    Invoice.find({}, function (err, userId) {
        res.status(200).send({ user_id: req.body.id });
    });
})

// create invoice
router.post('/invoice', async (req, res) => {
    try {
        const { userId, userRent, roomId, dateStart, dateEnd, electricBefore, electricLast, waterBefore, waterLast } = req.body;

        if (electricLast < electricBefore || waterLast < waterBefore) throw Error('Electrical/ Water figures must not be less than last month.')

        const invoice = new Invoice({
            user_id: userId,
            user_rent: userRent,
            room_id: roomId,
            date_start: dateStart,
            date_end: dateEnd,
            electric_before: electricBefore,
            electric_last: electricLast,
            water_before: waterBefore,
            water_last: waterLast,
            total: 0,
            ex_key: 0
        })

        let totalElectric = calcElectricPrice(electricBefore, electricLast)
        let totalWater = calcWaterPrice(waterBefore, waterLast)
        const priceRoom = (await Room.findOne({_id: roomId})).toObject()
        if (priceRoom.status === 'AVAILABLE') throw Error('Room status has been change. Please contact with owner.')
        invoice.total = totalElectric + totalWater + priceRoom.price
        await invoice.save()
        res.status(201).send({ invoice })
    } catch (error) {
        res.status(400).send(error)
    }
})

function calcElectricPrice(number1, number2) {
    let total = 0
    let el = number2 - number1
    if (el <= 50) {
        total = el * 1678
    } 
    if (50 < el <= 100) {
        total = 50 * 1678 + (el - 50) * 1734
    } 
    if (100 < el <= 200) {
        total = 50 * 1678 + 50 * 1734 + (el - 100) * 2014
    } 
    if (200 < el <= 300) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + (el - 200) * 2536
    } 
    if (300 < el <= 400) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + 100 * 2536 + (el - 300) * 2834
    } 
    if (400 < el) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + 100 * 2536 + 100 * 2834 + (el - 400) * 2927
    }
    total += total * 10 / 100
    return total;
}

function calcWaterPrice(number1, number2) {
    let wt = number2 - number1
    let total = 0
    if (wt <= 10) {
        total = wt * 6869
    }
    if (10 < wt <= 20) {
        total = 10 * 6869 + (wt - 10) * 8110
    } 
    if (20 < wt <= 30) {
        total = 10 * 6869 + 10 * 8110 + (wt - 20) * 9969
    }
    if (30 < wt) {
        total = 10 * 6869 + 10 * 8110 + 10 * 9969 + (wt - 30) * 18318
    }
    return total
}

module.exports = router;