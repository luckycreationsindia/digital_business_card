const Model = require('../models/customer');

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

let loadAll = (data, next) => {
    let filters = data.filter || {};
    let projection = data.projection || {};
    let options = data.options || {};
    Model.find(filters, projection, options).then((result) => {
        next(null, result);
    }).catch(next);
}

let load = (data, next) => {
    const limit = data['limit'] ? parseInt(data['limit']) : 10;
    let page = data['page'] ? parseInt(data['page']) : 1;
    if (page < 1) {
        page = 1
    }
    const skip = (page - 1) * limit;

    let filters = data.filter || {};
    let projection = data.projection || {};
    let options = data.options || {};
    filters.status = true;
    filters.private = false;
    let m =  Model.find(filters, projection, options);
    m = m.skip(skip).limit(limit)

    m.lean().then((result) => {
        Model.countDocuments(filters).then((c) => {
            result.totalCount = c;
            next(null, result);
        }).catch(next);
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
    loadAll,
    load,
    remove
}