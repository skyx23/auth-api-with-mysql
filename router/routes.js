const router = require('express').Router();
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const verify = require('../middleware/verify');
const CLient = require('../model/client');
const Address = require('../model/address');
dotenv.config();
sgMail.setApiKey(process.env.API_KEY);
// route to register user
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
      status: '1',
      message: 'Success',
      data: {
        message: `user created with username : ${req.body.username} and email : ${req.body.email}`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: '0',
      message: 'failure',
      data: {
        message: error,
      },
    });
  }
});
// router to login user
router.post('/login', async (req, res) => {
  try {
    const user = await CLient.findOne({
      where: { username: req.body.username },
    });
    const password = bcrypt.compare(req.body.password, user.password);
    if (!password) {
      return res.send('password entered do not match');
    }
    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: 60 * 60,
    });
    res
      .status(200)
      .header('token', token)
      .send({
        status: '1',
        message: 'success',
        data: {
          message: `user logged in with token [${token}]`,
        },
      });
  } catch (error) {
    res.status(400).send({
      status: '0',
      message: 'failure',
      data: {
        message: error.errors[0].message ? error.errors[0].message : error,
      },
    });
  }
});
// router to get user
router.get('/get', verify, async (req, res) => {
  try {
    const value = req.user.id;
    const user = await CLient.findOne({ where: { id: value } });
    console.log(value);
    res.send({
      status: '1',
      message: 'success',
      data: user,
    });
  } catch (error) {
    res.send({
      status: '0',
      message: 'failure',
      data:  error,
    });
  }
});
// route update user
router.patch('/update', verify, async (req, res) => {
  try {
    const value = req.user.id;
    const updated = await CLient.update(
      {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      },
      { where: { id: value } }
    );
    const user = await CLient.findOne({ where: { id: value } });
    const msg = {
      to: user.email,
      from: process.env.SENDER_EMAIL,
      subject: 'User Updated',
      text: `Your first-name and last-name has been updated to ${req.body.first_name} and ${req.body.last_name} respectively`,
      html: `<strong>Your first-name and last-name has been updated to ${req.body.first_name} and ${req.body.last_name} respectively</strong>`,
    };
    await sgMail.send(msg).then(() => {
      console.log('email sent');
    });
    res.send({
      status: '1',
      message: 'success',
      data: {
        message: 'user updated',
      },
    });
  } catch (error) {
    res.send({
      status: '0',
      message: 'failure',
      data: {
        message: error,
      },
    });
  }
});
// route to delete user
router.put('/delete', verify, async (req, res) => {
  try {
    const value = req.user.id;
    const deleted = await CLient.destroy({ where: { id: value } });
    if (!deleted) return res.send('user could not be deleted');
    res.send({
      status: '1',
      message: 'success',
      data: {
        message: 'user deleted',
      },
    });
  } catch (error) {
    res.send({
      status: '0',
      message: 'failure',
      data: {
        message: error,
      },
    });
  }
});
// route to display users
router.get('/list/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page);
    if (page < 0) return res.send('please enter a valid page value');
    const skip = (page - 1) * 10;
    const data = await CLient.findAll({ limit: 10, offset: skip });
    res.send({
      status: '1',
      message: 'success',
      data: data,
    });
  } catch (error) {
    res.send({
      status: '1',
      message: 'failure',
      data: error,
    });
  }
});

router.post('/address',verify ,async (req, res) => {
  try {
    const address =  await Address.create({
        userId : req.user.id,
        address : req.body.address,
        city : req.body.city,
        state : req.body.state,
        pin_code : req.body.pin_code,
        phone_no : req.body.phone_no
    })
    console.log(address)
    res.send({
        status : '1',
        message : 'success',
        data : {
            message : 'Address added to user '
        }
    })
  } catch (error) {
    console.log(error);
    res.send({
        status : '0',
        message : 'failure',
        data : {
            message : error
        }
    });
  }
});

router.get('/get',verify, async (req, res) => {
  try {
    const user =await CLient.findAll({include : {model : Address ,as : "Address"}})
    res.send(user);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
// route to use for forgot password
router.post('/forgotpassword', async (req, res) => {
  try {
    const user = await CLient.findOne({
      where: { username: req.body.username, email: req.body.email },
    });
    if (!user) return res.send('credentials do not match');
    const msg = {
      to: user.email,
      from: process.env.SENDER_EMAIL,
      subject: 'User Requested forgot password',
      text: `Your have requested for forgot password`,
      html: `<strong>Your have requested for forgot password</strong>`,
    };
    await sgMail.send(msg).then(() => {
      console.log('msg sent');
    });
    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: 60 * 10,
    });
    res.header('token', token).send({
      status: '1',
      message: 'success',
      data: {
        message: ' use reset password link to reset password',
      },
    });
  } catch (error) {
    res.send({
      status: '0',
      message: 'failure',
      data: {
        message: error,
      },
    });
  }
});
// route to reset password
router.post('/resetpassword', verify, async (req, res) => {
  try {
    const value = req.user.id;
    if (req.body.password != req.body.confirm_password) {
      return res.send('Password do not match');
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const updated = await CLient.update(
      { password: password },
      {
        where: {
          id: value,
        },
      }
    );
    const msg = {
      to: await CLient.findOne({ where: { id: value } }).datavalues.email, // Change to your recipient
      from: process.env.SENDER_EMAIL,
      subject: 'User password updated',
      text: `Your password has been updated in the database  as entered `,
      html: `<strong>Your password has been updated in the database  as entered </strong>`,
    };
    await sgMail.send(msg).then(() => {
      console.log('msg sent');
    });
    res.send({
        status : '1',
        message : 'success',
        data : {
            message : 'password has been updated in the database'
        }
    });
  } catch (error) {
    res.send({
        status : '0',
        message : 'failure',
        data : {
            message : error 
        }
    });
  }
});

module.exports = router;

