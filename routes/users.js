var express = require('express');
const User = require('../model/user')
var router = express.Router();
const auth = require('../middleware/auth')

// get user profile 
router.get('/users/me', auth, async(req, res) => {
  // View logged in user profile
  res.send(req.user)
})

// get list user 
router.get('/users/list', async (req, res) => {
  User.find({}, function(err, users) {
    res.status(200).send({users: users});
 });
})

// create user for admin
router.post('/admin/users', async (req, res) => {
  // Create a new user
  try {
    const { name, email, password, role } = req.body;
    const user = new User({
      name: name,
      email: email,
      password: password,
      role: role
    })
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).send({ user, token })
  } catch (error) {
      res.status(400).send(error)
  }
})

// register user
router.post('/users', async (req, res) => {
  // Create a new user
  try {
      const { name, email, password } = req.body;
      const user = new User({
        name: name,
        email: email,
        password: password,
        role: 'enduser'
      })
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).send({ user, token })
  } catch (error) {
      res.status(400).send(error)
  }
})

// log out user 
router.post('/users/me/logout', auth, async (req, res) => {
  // Log user out of the application
  try {
      req.user.tokens = req.user.tokens.filter((token) => {
          return token.token != req.token
      })
      await req.user.save()
      res.send()
  } catch (error) {
      res.status(500).send(error)
  }
})

module.exports = router;
