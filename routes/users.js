var express = require('express');
const User = require('../model/user')
const Request = require('../model/request')
var router = express.Router();
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');
const mongoose = require('mongoose');
const Room = require('../model/room');
const Invoice = require('../model/invoice');
var limit = 10;

// get user profile 
router.get('/users/me', auth, async (req, res) => {
  // View logged in user profile
  res.send(req.user)
})

// get list user 
router.get('/users/list', async (req, res) => {
  User.find({}).skip((req.body.page - 1) * limit).limit(limit).exec((err, doc) => {
    if (err) {
      return res.json(err);
    }
    User.countDocuments({}).exec((count_error, count) => {
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


// create user for admin
router.post('/admin/users', async (req, res) => {
  // Create a new user
  try {
    const { name, date_of_birth, gender, city, district, ward, imgUrl, phonenumber, email, role } = req.body;

    const checkEmail = await User.findOne({ email: email })
    if (checkEmail) res.send({ error: 'MSE00029' }) //MSE00029 = 'The email address is already exists.';

    const randomstring = Math.random().toString(36).slice(-8);
    const user = new User({
      email: email,
      password: randomstring,
      role: role,
      name: name,
      date_of_birth: date_of_birth,
      gender: gender,
      city: city,
      district: district,
      ward: ward,
      imgUrl: imgUrl,
      phonenumber: phonenumber
    })

    await user.save()
    const token = await user.generateAuthToken()
    var readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
          throw err;
          callback(err);
        }
        else {
          callback(null, html);
        }
      });
    }
    // function send mail
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 's2nlvs2@gmail.com',
        pass: 'Vien09071998#'
      }
    });

    await readHTMLFile('mail/createUser.html', function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        password: randomstring
      };
      var htmlToSend = template(replacements);

      var mailOptions = {
        from: 's2nlvs2@gmail.com',
        to: email,
        subject: 'FindSafe - CREATE ACCOUNT BY ADMINISTRATOR',
        html: htmlToSend
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });

    res.status(201).send({ user })
  } catch (error) {
    res.status(400).send(error)
  }
})

// register user
router.post('/users', async (req, res) => {
  // Create a new user
  try {
    const { email, password } = req.body;
    const checkEmail = await User.findOne({ email: email })
    if (checkEmail) res.send({ error: 'MSE00029' }) //MSE00029 = 'The email address is already exists.';
    const user = new User({
      email: email,
      password: password,
      role: 'user',
      name: '',
      date_of_birth: '',
      gender: '',
      city: '',
      district: '',
      ward: '',
      imgUrl: '',
      phonenumber: ''
    })

    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
})

// update user
router.put('/users', auth, async (req, res) => {
  // Create a new user
  try {
    const checkExist = await User.findById(req.body.user_id)
    const { email, password } = req.body;
    checkExist.email = email
    checkExist.password = password
    await checkExist.save()
    res.status(200).send(checkExist)
  } catch (error) {
    res.status(400).send(error)
  }
})

//update pass
router.put('/users/password', async (req, res) => {
  // Create a new user
  try {
    const checkExist = await User.findById(req.body.user_id)
    const { current_pass, password } = req.body;

    bcrypt.compare(checkExist.password, current_pass, async function (err, result) {
      if (result === true) {
        checkExist.password = password
        await checkExist.save()
        res.status(200).send({ user: checkExist })
      } else {
        return res.json({ error: 'Current password is incorrect.' }) // 'The 'Email' or 'Pasword' is incorrect.'
      }
    })
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


// login user 
router.post('/users/me/login', async (req, res) => {
  // Log user out of the application
  try {
    const user = await User.findOne({ email: req.body.email })
    bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (result === true) {
        res.send({ role: user.role, token: user.tokens[0].token, userId: user._id })
      } else {
        throw new Error('MSE00074') // 'The 'Email' or 'Pasword' is incorrect.'
      }
    })
  } catch (error) {
    res.status(500).send(error)
  }
})

// reset password - send mail pass
router.post('/users/reset/password', async (req, res) => {
  // Log user out of the application
  try {
    const user = await User.findOne({ email: req.body.email })
    const randomstring = Math.random().toString(36).slice(-8);
    user.password = randomstring;

    var readHTMLFile = function (path, callback) {
      fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
          throw err;
          callback(err);
        }
        else {
          callback(null, html);
        }
      });
    }
    // function send mail
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 's2nlvs2@gmail.com',
        pass: 'Vien09071998#'
      }
    });

    await readHTMLFile('mail/resetPass.html', function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        passwordReset: randomstring
      };
      var htmlToSend = template(replacements);

      var mailOptions = {
        from: 's2nlvs2@gmail.com',
        to: user.email,
        subject: 'FindSafe - RESET PASSWORD',
        html: htmlToSend
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });

    await user.save()
    res.status(200).send({ user })
  } catch (error) {
    res.status(500).send(error)
  }
})

// get profile user
router.post('/users/profile', async (req, res) => {
  try {
    const userMail = await User.findById(req.body._id)
    const user = {
      _id: userMail._id,
      user_id: userMail.user_id,
      name: userMail.name,
      date_of_birth: userMail.date_of_birth,
      gender: userMail.gender,
      city: userMail.city,
      district: userMail.district,
      ward: userMail.ward,
      imgUrl: userMail.imgUrl,
      phonenumber: userMail.phonenumber,
      email: userMail.email
    }
    res.status(200).send({ user: user })
  } catch (error) {
    res.status(500).send(error)
  }
})

// put profile user
router.put('/users/profile', async (req, res) => {
  try {
    const userInfo = await User.findById({ _id: req.body._id })
    const { name, date_of_birth, gender, city, district, ward, imgUrl, phonenumber, email } = req.body;
    userInfo.name = name
    userInfo.date_of_birth = date_of_birth
    userInfo.gender = gender
    userInfo.city = city
    userInfo.district = district
    userInfo.ward = ward
    userInfo.imgUrl = imgUrl
    userInfo.phonenumber = phonenumber
    userInfo.email = email
    userInfo.role = req.body.role? req.body.role : userInfo.role
    userInfo.ex_key = userInfo.ex_key + 1
    await userInfo.save()
    res.status(200).send({ user: userInfo })
  } catch (error) {
    res.status(500).send(error)
  }
})

// delete user
// delete room
router.post('/user/delete', async (req, res) => {
  try {
    const checkUser = await User.findOne({_id: req.body._id })
    if (!checkUser) {
      res.json({ Error: 'User has been deleted or does not exist.' })
    }
    const user = await User.deleteOne({ _id: req.body._id })
    Room.deleteMany({ user_id: req.body._id })
    Invoice.deleteMany({ user_id: req.body._id })
    Request.updateMany({ user_owner: req.body._id, status: 'IN PROGRESS' }, { $set: { status: 'DENIED' } })
    Request.deleteOne({ user_owner: req.body._id, status: 'ACCEPT' })
    res.send({ data: 'Successfull.' })
  } catch (error) {
    res.status(400).send(error)
  }
})


module.exports = router;
