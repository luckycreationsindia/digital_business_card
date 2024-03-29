const passport = require("passport");

exports.signup = async (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (info) {
            return res.json(info);
        }
    })(req, res, next);
};

exports.signin = (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (info) {
            return res.json(info);
        }
        // req / res held in closure
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            delete user.password;
            return res.json({status: "Success", message: "Success"});
        });
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout(() => {
        req.session.destroy(()=>{
            res.json({status: "Success", message: "Success"});
        });
    });
};