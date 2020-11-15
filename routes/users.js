var express = require('express');
const User = require('../model/user')
const Profile = require('../model/user-profile')
var router = express.Router();
const auth = require('../middleware/auth')

// get user profile 
router.get('/users/me', auth, async (req, res) => {
  // View logged in user profile
  res.send(req.user)
})

// get list user 
router.get('/users/list', async (req, res) => {
  User.find({}, function (err, users) {
    res.status(200).send({ users: users });
  });
})

// create user for admin
router.post('/admin/users', async (req, res) => {
  // Create a new user
  try {
    const { email, password, role } = req.body;
    const user = new User({
      email: email,
      password: password,
      role: role,
      ex_key: 0,
      del_flg: 0
    })
    await user.save()

    const profile = new Profile({
      user_id: user._id,
      name: "",
      date_of_birth: "",
      gender: "",
      city: "",
      district: "",
      ward: "",
      imgUrl: "",
      phonenumber: "",
      ex_key: 0
    })
    await profile.save()
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
    const { email, password } = req.body;
    const user = new User({
      email: email,
      password: password,
      role: 'enduser',
      ex_key: 0
    })

    await user.save()

    const token = await user.generateAuthToken()
    const profile = new Profile({
      user_id: user._id,
      name: "",
      date_of_birth: "",
      gender: "",
      city: "",
      district: "",
      ward: "",
      imgUrl: "",
      phonenumber: "",
      ex_key: 0
    })
    await profile.save()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
})

// update password
router.put('/users/:id', auth, async (req, res) => {
  // Create a new user
  try {
    const checkExist = await User.findById(req.params.id)
    const { name, password } = req.body;
    checkExist.name = name
    checkExist.password = password
    await checkExist.save()
    res.status(200).send(checkExist)
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

// get profile user


// put profile user

module.exports = router;
