const Model = require('../models/customer');
const FirebaseDynamicLinks = require('firebase-dynamic-links').FirebaseDynamicLinks;

const firebaseDynamicLinks = new FirebaseDynamicLinks(process.env.FIREBASE_WEB_API_KEY);

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

let getLink = (data, next) => {
    Model.findOne({'_id': data._id}).then((result) => {
        if(result.dynamic_link) return next(null, result['dynamic_link']);
        firebaseDynamicLinks.createLink({
            dynamicLinkInfo: {
                domainUriPrefix: process.env.DYNAMIC_DOMAIN_URI_PREFIX,
                link: process.env.FRONTEND_URL + "?id=" + result._id.toString(),
                suffix: {"option": "SHORT"}
            }
        }).then(function (result) {
            Model.findByIdAndUpdate(data._id, {'dynamic_link': result.shortLink}, {new: true}).then((result) => {
                return next(null, result['dynamic_link']);
            }).catch(next);
        }).catch(next)
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
    let filters = data.filter || {};
    let projection = data.projection || {};
    let options = data.options || {};
    filters.status = true;
    filters.private = false;
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
    getLink,
    loadAll,
    load,
    remove
}