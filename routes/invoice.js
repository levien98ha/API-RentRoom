var express = require('express');
const Invoice = require('../model/invoice');
const Room = require('../model/room');
var router = express.Router();
const { createInvoice } = require('../createInvoice/createInvoice.js');
var fs = require("fs");

// get list invoice by user id 
router.post('/invoice/list', async (req, res) => {
    try {
        const listInvoice = 
            await Invoice.find({room_id: req.body.roomId})
                .populate({    
                    path: "room_id",
                    model: "Room"})
                .populate({    
                    path: "user_rent",
                    model: "User"})
                .populate({    
                    path: "user_id",
                    model: "User"})
                .sort({'date_end': -1})
        res.send({data: listInvoice})
    } catch (error) {
        res.status(400).send(error)
    }
})

// get data invoice by id
router.post('/invoice/id', async (req, res) => {
    try {
        const invoice = 
            await Invoice.find({_id: req.body._id})
                .populate({    
                    path: "room_id",
                    model: "Room"})
                .populate({    
                    path: "user_rent",
                    model: "User"})
                .populate({    
                    path: "user_id",
                    model: "User"})
        res.send({data: invoice})
    } catch (error) {
        res.status(400).send(error)
    }
})

// create invoice
router.post('/invoice', async (req, res) => {
    try {
        const { title, user_id, user_rent, room_id, date_start, date_end, electric_before, electric_last, water_before, water_last } = req.body;
        if (electric_last < electric_before || water_last < water_before) throw Error('Electrical/ Water figures must not be less than last month.')

        const invoice = new Invoice({
            title: title,
            user_id: user_id,
            user_rent: user_rent,
            room_id: room_id,
            date_start: date_start,
            date_end: date_end,
            electric_before: electric_before,
            electric_last: electric_last,
            water_before: water_before,
            water_last: water_last,
            total: 0,
            ex_key: 0
        })

        let totalElectric = calcElectricPrice(electric_before, electric_last).toFixed()
        let totalWater = calcWaterPrice(water_before, water_last).toFixed()
        const priceRoom = (await Room.findOne({_id: room_id})).toObject()
        if (priceRoom.status === 'AVAILABLE') throw Error('Room status has been change. Please contact with owner.')
        invoice.total = Number(totalElectric) + Number(totalWater) + Number(priceRoom.price)
        invoice.total = invoice.total.toFixed()
        await invoice.save()

        const invoiceSend = 
            await Invoice.find({_id: invoice._id})
                .populate({    
                    path: "room_id",
                    model: "Room"})
                .populate({    
                    path: "user_rent",
                    model: "User"})
                .populate({    
                    path: "user_id",
                    model: "User"})
        res.status(200).send({data: invoiceSend })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.put('/invoice', async (req, res) => {
    try {
        const { _id, title, user_id, user_rent, room_id, date_start, date_end, electric_before, electric_last, water_before, water_last } = req.body;

        if (electric_last < electric_before || water_last < water_before) throw Error('Electrical/ Water figures must not be less than last month.')

        let totalElectric = calcElectricPrice(electric_before, electric_last).toFixed()
        let totalWater = calcWaterPrice(water_before, water_last).toFixed()

        const priceRoom = await Room.findOne({_id: room_id._id})
        if (priceRoom.status === 'AVAILABLE') throw Error('Room status has been change. Please contact with owner.')
        
        let total = Number(totalElectric) + Number(totalWater) + Number(priceRoom.price)
        total = total.toFixed()

        const userId = user_id._id
        const userRent = user_rent._id
        const roomId = room_id._id

        const invocie =  await Invoice.update({_id: _id}, {$set: {
            title: title,
            user_id: user_id._id,
            user_rent: user_rent._id,
            room_id: room_id._id,
            date_start: date_start,
            date_end: date_end,
            electric_before: electric_before,
            electric_last: electric_last,
            water_before: water_before,
            water_last: water_last,
            total: total
        }})
        res.status(200).send({data: 'succefull'})
    } catch (error) {
        console.log(error)
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
        
        createInvoice(invoice, "invoice.pdf");
        // const pdf_file = `${__dirname},invoice.pdf`;
        // res.setHeader('Content-type', 'application/pdf');
        // console.log(pdf_file)
        // res.download(pdf_file); 

        var file = fs.createReadStream('./invoice.pdf');
        var stat = fs.statSync('./invoice.pdf');
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        file.pipe(res);
        // res.send("oke");
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