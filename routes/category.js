var express = require('express');
const Category = require('../model/category')
const User = require('../model/user')
var router = express.Router();

// get category by id 
router.get('/categori/:id', async (req, res) => {
    const categoryById = Category.findById(req.params.id)
    res.status(200).send({ categoryById })
})

// get list category 
router.get('/category/list', async (req, res) => {
    Category.find({}, function (err, categories) {
        res.status(200).send({ categories: categories });
    });
})

// create category
router.post('/category', async (req, res) => {
    try {
        const { name } = req.body;
        const category = new Room({
            name: name,
            ex_key: 0
        })
        await category.save()
        res.status(201).send({ category })
    } catch (error) {
        res.status(400).send(error)
    }
})

// create category
router.put('/category', async (req, res) => {
    try {
        const categoryExist = Category.findById(req.body.id)
        const { name } = req.body;
        categoryExist.name = name
        await categoryExist.save()
        res.status(201).send({ categoryExist })
    } catch (error) {
        res.status(400).send(error)
    }
})

// create category
router.delete('/category', async (req, res) => {
    try {
        const categoryExist = Category.findByIdAndDelete(req.body.id)
        await categoryExist.save()
        res.status(201).send({ categoryExist })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;