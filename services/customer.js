let Model = require('../models/customer');

let add = (data, next) => {
    let model = new Model(data);

    model.save((err, result) => {
        if (err) {
            if (err.code === 11000) {
                return next(new Error("Already Exist"));
            }
            next(err);
        } else {
            return next(null, result);
        }
    });
}

let update = (data, next) => {
    Model.findByIdAndUpdate(data._id, data, {new: true}, function (err, result) {
        if (err) {
            return next(err);
        } else {
            return next(null, result);
        }
    });
}

let load = (data, next) => {
    let filters = data.filter || {};
    let projection = data.projection || {};
    let options = data.options || {};
    Model.find(filters, projection, options, (err, result) => {
        if (err) {
            next(err);
        } else {
            next(null, result);
        }
    });
}

let remove = (id, next) => {
    Model.findByIdAndDelete(id).then((err, result) => {
        if (err) {
            next(err);
        } else {
            next(null, true);
        }
    }).catch(next);
}

module.exports = {
    add,
    update,
    load,
    remove
}