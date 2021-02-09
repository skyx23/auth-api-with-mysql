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
const emailSent = async (email, msg) => {
  const mail = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: 'User Registered',
    text: `${msg}`,
    html: `<strong>${msg}</strong>`,
  };
  await sgMail.send(mail);
};
// route to register user
router.post('/register', async (req, res) => {
  try {
    if (req.body.password != req.body.confirm_password) {
      return res.send('Password do not match');
    }
    if (
      !req.body.first_name ||
      !req.body.last_name ||
      !req.body.username ||
      !req.body.email ||
      !req.body.password
    ) {
      return res.send({
        status : '0',
        message : 'failure',
        data : 'Please fill  all the respective fields to register'
      })
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
    const msg = `Your email have been registerd with username ${req.body.username}`;
    emailSent(req.body.email, msg);
    res.status(200).send({
      status: '1',
      message: 'Success',
      data: `user created with username : ${req.body.username} and email : ${req.body.email}`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: '0',
      message: 'failure',
      data: error,
    });
  }
});
router.post('/login', async (req, res, next) => {
  try {
    passport.authenticate('local', {
      successRedirect: 'user/login',
      failureRedirect: 'user/errlogin',
    })(req, res, next);
  } catch (err) {
    res.send(err);
  }
});
router.get('/user/login', (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.SECRET, {
    expiresIn: 60 * 60,
  });
  res.header('token', token).send({
    status : '1',
    message : 'success',
    data : 'user successfully logged in'
  });
});
router.get('/user/errlogin', (req, res) => {
  res.send({
    status : '0',
    message : 'failure',
    data : 'could not log in'
  });
});
// router to get user
router.get('/get', verify, async (req, res) => {
  try {
    const value = req.user.id;
    const user = await CLient.findOne(
      { where: { id: value } },
      { include: { model: Address, as: 'Address' } }
    );
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
      data: error,
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
    const msg = `Your first-name and last-name has been updated to ${req.body.first_name} and ${req.body.last_name} respectively`;
    const user = await CLient.findOne({ where: { id: value } });
    emailSent(user.email, msg);
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
    const address_del = await Address.destroy({ where: { userId: value } });
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
    const data = await CLient.findAll(
      { limit: 10, offset: skip },
      { include: { model: Address, as: 'Address' } }
    );
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

router.post('/address', verify, async (req, res) => {
  try {
    if (!req.body.address ||
      !req.body.city ||
      !req.body.state ||
      !req.body.pin_code ||
      !req.body.phone_no 
      ) {
        return res.send({
          status : '0',
          message: 'failure',
          data : 'please fill all the respective details to add address'
        })
      } 
    const address = await Address.create({
      userId: req.user.id,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pin_code: req.body.pin_code,
      phone_no: req.body.phone_no,
    });
    console.log(address);
    res.send({
      status: '1',
      message: 'success',
      data: {
        message: 'Address added to user ',
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: '0',
      message: 'failure',
      data: {
        message: error,
      },
    });
  }
});

router.get('/get/address', verify, async (req, res) => {
  try {
    const user = await CLient.findAll({
      include: { model: Address, as: 'Address' },
    });
    res.send({
      status: '1',
      message: 'failure',
      data: user,
    });
  } catch (error) {
    res.send({
      status: '0',
      message: 'failure',
      data: error,
    });
  }
});
// route to use for forgot password
router.post('/forgotpassword', async (req, res) => {
  try {
    const user = await CLient.findOne({
      where: { username: req.body.username, email: req.body.email },
    });
    if (!user) return res.send('credentials do not match');
    const msg = `Your have requested for forgot password`;
    emailSent(user.email, msg);
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
    const msg = `Your password has been updated in the database  as entered `;
    const mail = await CLient.findOne({ where: { id: value } }).datavalues
      .email;
    emailSent(mail, msg);
    res.send({
      status: '1',
      message: 'success',
      data: {
        message: 'password has been updated in the database',
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

module.exports = router;
