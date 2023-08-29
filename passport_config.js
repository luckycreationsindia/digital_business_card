const LocalStrategy = require('passport-local').Strategy;
const Customer = require("./models/customer");
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        Customer.find({_id: id}, {password: 0}).then((rows) => {
            try {
                let user = rows[0];
                done(null, user);
            } catch (err) {
                done(null, false, {status: 'Error', message: 'Error connecting to database'});
            }
        }).catch((err) => {
            return done(null, false, {
                status: 'Error',
                message: 'Error connecting to database',
                error: err.message
            });
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        verifyUser));

    function verifyUser(req, email, password, done) {
        Customer.find({email: email}).then((rows) => {
            try {
                if (!rows.length) {
                    return done(null, false, {status: 'Error', message: 'Invalid username/password'});
                } else {
                    let user = rows[0];
                    if (!user.status)
                        return done(null, false, {
                            status: 'Error',
                            message: 'Please wait until Admin/Manager Verify your Account'
                        });

                    if (!bcrypt.compareSync(password, user.password)) {
                        return done(null, false, {
                            status: 'Error',
                            message: 'Invalid username/password'
                        });
                    } else {
                        req.session.username = user.email;
                        return done(null, user);
                    }
                }
            } catch (err) {
                done(null, false, {status: 'Error', message: 'Error connecting to database'});
            }
        }).catch((err) => {
            return done(null, false, {
                status: 'Error',
                message: 'Error connecting to database',
                error: err.message
            });
        });
    }
};