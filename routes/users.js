var express = require('express');
const User = require('../model/user')
const Profile = require('../model/user-profile')
var router = express.Router();
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');

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
    const checkEmail = await User.findOne({email: email})
    if (checkEmail) res.send({error: 'MSE00029'}) //MSE00029 = 'The email address is already exists.';
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
    const { email, password } = req.body;
    checkExist.email = email
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


// login user 
router.post('/users/me/login', async (req, res) => {
  // Log user out of the application
  try {
    const user = await User.findOne({email: req.body.email})
    bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (result === true) {
        res.send({role: user.role, token: user.tokens[0].token})
      } else {
        throw new Error('MSE00074') // 'The "Email" or "Pasword" is incorrect.'
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
    const user = await User.findOne({email: req.body.email})
    console.log(user)
    const randomstring = Math.random().toString(36).slice(-8);
    user.password = randomstring;

    var readHTMLFile = function(path, callback) {
      fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
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

    await readHTMLFile('mail/resetPass.html', function(err, html) {
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
    res.send({user})
  } catch (error) {
    res.status(500).send(error)
  }
})

// get profile user


// put profile user

module.exports = router;
