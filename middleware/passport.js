const LocalStratergy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../model/client');
const { use } = require('../router/routes');

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
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
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
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    User.findByPk(id).then(user => {
      done(null, user)
    }).catch(err=>{
      done(err, null)
    })
  });
};
