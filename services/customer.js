let Model = require('../models/customer');

let add = (data, next) => {
    let model = new Model(data);

    model.save().then((result) => {
        return next(null, result);
    }).catch((err) => {
        if (err.code === 11000) {
            return next(new Error("Already Exist"));
        }
        next(err);
    });
}

let update = (data, next) => {
    Model.findByIdAndUpdate(data._id, data, {new: true}).then((result) => {
        return next(null, result);
    }).catch(next);
}

let load = (data, next) => {
    let filters = data.filter || {};
    let projection = data.projection || {};
    let options = data.options || {};
    Model.find(filters, projection, options).then((result) => {
        next(null, result);
    }).catch(next);
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