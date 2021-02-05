const router = require('express').Router();
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const CLient = require('../model/client');
dotenv.config();
// route to register
router.post('/register', async (req, res) => {
  try {
    if (req.body.password != req.body.confirm_password) {
      return res.send('Password do not match');
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const user = await CLient.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: password,
    });
    const msg = {
      to: req.body.email,
      from: process.env.SENDER_EMAIL,
      subject: 'User Registered',
      text: `Your email have been registerd with username ${req.body.username}`,
      html: `<strong>Your email have been registerd with username ${req.body.username}</strong>`,
    };
    await sgMail.send(msg).then(() => {
      console.log('email sent');
    });
    res.status(200).send({
      status: 1,
      message: 'Success',
      data: {
        message: `user created with username : ${req.body.username} and email : ${req.body.email}`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: 0,
      message: 'failure',
      data: {
        message: error.errors[0].message ? error.errors[0].message : error,
      },
    });
  }
});
// router to login
router.post('/login', async (req, res, next) => {
  try {
    console.log('request made')
    passport.authenticate('local', {
      successRedirect: 'user/login',
      failureRedirect: 'user/errlogin',
    })(req, res, next);
    console.log('request completely analysed')
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/user/login', (req, res) => {
//     console.log('passport login')
//   const token = jwt.sign({ id: req.user.id }, process.env.SECRET, {
//     expiresIn: 60 * 60,
//   });
//   res.header('token', token).send(`user logged in `);
res.send('log in')
});

router.get('/user/errlogin', (req, res) => {
  res.send('could not log-in');
});

router.get('/get', async (req, res) => {
  try {
    res.send('User');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.patch('/update', async (req, res) => {
  try {
    res.send('User updated');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.put('/delete', async (req, res) => {
  try {
    res.send('User Deleted');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/list/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page);
    res.send(`users on page ${page}`);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post('/address', async (req, res) => {
  try {
    res.send('Address added');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    const id = req.params.id;
    res.send('User with id');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post('/forgotpassword', async (req, res) => {
  try {
    res.send('use reset password link to reset password');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post('/resetpassword', async (req, res) => {
  try {
    res.send('password resetted');
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = router;
