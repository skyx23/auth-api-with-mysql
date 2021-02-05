const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const routes = require('./router/routes');
const sequelize = require('./db/config');
dotenv.config();
const app = express();
require('./middleware/passport')(passport);
// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session()); 
const port = process.env.PORT || 3000;
app.use('/user', routes);
app.listen(port, () => {
  console.log(`server set up : listening on ${port}`);
});
