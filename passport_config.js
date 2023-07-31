const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");
const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.find({_id: id}, {password: 0}).then((rows) => {
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

            user.save(function (err, user) {
                if (err) {
                    return done(err);
                } else {
                    return done(null, false, {status: 'Success', message: 'Registration Successful'});
                }
            });
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

    function passwordValidationCheck(password) {
        return new Promise((resolve, reject) => {
            let checkData = {passwordRegEx: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$",
                passwordRegExErrorMessage: "Password should be at least 8 character long and should contain digit, uppercase and lowercase",
                passwordMaxLength: 25,
                passwordMaxLengthErrorMessage: "Password length should be maximum of 25 characters long"};
            Promise.resolve().then(() => {
                // Password - Minimum eight characters, at least one uppercase letter, one lowercase letter and one number:
                // RegEx Example - "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"
                // At least one upper case English letter, (?=.*?[A-Z])
                // At least one lower case English letter, (?=.*?[a-z])
                // At least one digit, (?=.*?[0-9])
                // Minimum eight in length .{8,} (with the anchors)
                let passwordRegEx = checkData.passwordRegEx;

                //Error Message to send to Frontend if regex doesn't match
                let passwordErrorMessage = checkData.passwordRegExErrorMessage;

                let result = new RegExp(passwordRegEx).exec(password);
                if(!result) {
                    return Promise.reject(new Error(passwordErrorMessage));
                }
            }).then(() => {
                if(password.length > checkData.passwordMaxLength) {
                    return Promise.reject(new Error(checkData.passwordMaxLengthErrorMessage))
                }
                resolve();
            }).catch(reject);
        });
    }
};