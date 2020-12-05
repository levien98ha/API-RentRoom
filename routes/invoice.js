var express = require('express');
const Invoice = require('../model/invoice');
const Room = require('../model/room');
var router = express.Router();
const { createInvoice } = require('../createInvoice/createInvoice.js');

// get list mark by user id 
router.post('/invoice/list', async (req, res) => {
    Invoice.find({}, function (err, userId) {
        res.status(200).send({ user_id: req.body.id });
    });
})

// create invoice
router.post('/invoice', async (req, res) => {
    try {
        const { title, userId, userRent, roomId, dateStart, dateEnd, electricBefore, electricLast, waterBefore, waterLast } = req.body;

        if (electricLast < electricBefore || waterLast < waterBefore) throw Error('Electrical/ Water figures must not be less than last month.')

        const invoice = new Invoice({
            title: title,
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
        // createInvoice(invoice, "invoice.pdf");
        res.status(201).send({data: invoice })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.put('/invoice', async (req, res) => {
    try {
        const { _id, title, userId, userRent, roomId, dateStart, dateEnd, electricBefore, electricLast, waterBefore, waterLast } = req.body;

        if (electricLast < electricBefore || waterLast < waterBefore) throw Error('Electrical/ Water figures must not be less than last month.')

        let totalElectric = calcElectricPrice(electricBefore, electricLast)
        let totalWater = calcWaterPrice(waterBefore, waterLast)

        const priceRoom = (await Room.findOne({_id: roomId})).toObject()
        if (priceRoom.status === 'AVAILABLE') throw Error('Room status has been change. Please contact with owner.')

        let total = totalElectric + totalWater + priceRoom.price

        const invoiceUpdate = Invoice.update({_id: _id}, {$set: {
            title: title,
            user_id: userId,
            user_rent: userRent,
            room_id: roomId,
            date_start: dateStart,
            date_end: dateEnd,
            electric_before: electricBefore,
            electric_last: electricLast,
            water_before: waterBefore,
            water_last: waterLast,
            total: total
        }})

        res.status(200).send({data: invoiceUpdate })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/invoice/download', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({_id: req.body._id}).populate({
            path: "user_rent",
            model: "User"
          })
          .populate({
            path: "user_id",
            model: "User"
          })
          .populate({
            path: "room_id",
            model: "Room"
          })
        res.send(createInvoice(invoice, "invoice.pdf"));
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
    else if (50 < el <= 100) {
        total = 50 * 1678 + (el - 50) * 1734
    } 
    else if (100 < el <= 200) {
        total = 50 * 1678 + 50 * 1734 + (el - 100) * 2014
    } 
    else if (200 < el <= 300) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + (el - 200) * 2536
    } 
    else if (300 < el <= 400) {
        total = 50 * 1678 + 50 * 1734 + 100 * 2014 + 100 * 2536 + (el - 300) * 2834
    } 
    else if (400 < el) {
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