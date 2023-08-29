const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");
const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.find({_id: id}, {password: 0}).populate('customer_id').then((rows) => {
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

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        },
        (req, email, password, done) => {
            let token = req.headers['api-token'];
            if(!token || token !== process.env.API_TOKEN) {
                return done(null, false, {status: 'Error', message: 'Invalid Token'});
            }

            if (!req.body.first_name || !req.body.email) {
                return done(null, false, {status: 'Error', message: 'All Fields are Required.'});
            }

            let hash = bcrypt.hashSync(password, saltRounds);

            const user = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: hash,
                mobile: req.body.mobile,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                pincode: req.body.pincode,
                role: 0,
                status: false
            });

            user.save().then((user) => {
                return done(null, false, {status: 'Success', message: 'Registration Successful'});
            }).catch(done);
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        verifyUser));

    function verifyUser(req, email, password, done) {
        User.find({email: email}).then((rows) => {
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