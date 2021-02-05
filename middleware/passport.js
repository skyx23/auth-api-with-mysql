const LocalStratergy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../model/client');

module.exports = function (passport) {
  passport.use(
    new LocalStratergy(
      { usernameField: 'username', passwordField: 'password' },
      (username, password, done) => {
        User.findOne({ where: { username: username } })
          .then((user) => {
            if (!user) {
              return done(null, false, { message: 'username not found' });
            }
            console.log(user);
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                console.log('password matched')
                return done(null, user);
              } else {
                return done(null, false, { message: "password doesn't match" });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );
  passport.serializeUser(function (user, done) {
    console.log(user)
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    console.log(id)
    User.findByPk(id, function (err, user) {
      done(err, user);
    });
  });
};
