const Model = require('../models/customer');
const bcrypt = require("bcryptjs");
const User = require("../models/user");

let add = (data, next) => {
    let model = new Model(data);

    model.save().then((result) => {
        if(data.password && data.first_name && data.email) {
            let hash = bcrypt.hashSync(data.password, 10);
            const user = new User({
                customer_id: result._id,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: hash,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
                role: 0,
                status: true
            });

            user.save().then((user) => {
                next(null, result);
            }).catch((err) => {
                console.error(err);
                next(null, result);
            });
        } else {
            return next(null, result);
        }
    }).catch((err) => {
        if (err.code === 11000) {
            return next(new Error("Already Exist"));
        }
        next(err);
    });
}

let update = async (data, next) => {
    let id = data._id;
    if(!data.isAdmin && id !== data.user.customer_id._id) {
        return next("Unauthorized Access");
    }

    let updateData = {};

    if(data.first_name) updateData['first_name'] = data.first_name;
    if(data.hasOwnProperty('last_name')) updateData['last_name'] = data.last_name;
    if(data.hasOwnProperty('contacts')) updateData['contacts'] = data.contacts;
    if(data.hasOwnProperty('company')) updateData['company'] = data.company;
    if(data.hasOwnProperty('jobTitle')) updateData['jobTitle'] = data.jobTitle;
    if(data.hasOwnProperty('profile')) updateData['profile'] = data.profile;
    if(data.hasOwnProperty('mainColor')) updateData['mainColor'] = data.mainColor;
    if(data.email && data.isAdmin) updateData['email'] = data.email;
    if(data.hasOwnProperty('website')) updateData['website'] = data.website;
    if(data.hasOwnProperty('gst')) updateData['gst'] = data.gst;
    if(data.hasOwnProperty('address')) updateData['address'] = data.address;
    if(data.hasOwnProperty('city')) updateData['city'] = data.city;
    if(data.hasOwnProperty('state')) updateData['state'] = data.state;
    if(data.hasOwnProperty('country')) updateData['country'] = data.country;
    if(data.hasOwnProperty('pincode')) updateData['pincode'] = data.pincode;
    if(data.hasOwnProperty('latitude')) updateData['latitude'] = data.latitude;
    if(data.hasOwnProperty('longitude')) updateData['longitude'] = data.longitude;
    if(data.hasOwnProperty('facebook')) updateData['facebook'] = data.facebook;
    if(data.hasOwnProperty('instagram')) updateData['instagram'] = data.instagram;
    if(data.hasOwnProperty('linkedin')) updateData['linkedin'] = data.linkedin;
    if(data.hasOwnProperty('github')) updateData['github'] = data.github;
    if(data.hasOwnProperty('whatsapp')) updateData['whatsapp'] = data.whatsapp;
    if(data.hasOwnProperty('twitter')) updateData['twitter'] = data.twitter;
    if(data.hasOwnProperty('upi')) updateData['upi'] = data.upi;
    if(data.hasOwnProperty('upiData')) updateData['upiData'] = data.upiData;
    if(data.hasOwnProperty('bankDetails')) updateData['bankDetails'] = data.bankDetails;
    if(data.hasOwnProperty('about')) updateData['about'] = data.about;
    if(data.hasOwnProperty('notes') && data.isAdmin) updateData['notes'] = data.notes;
    if(data.hasOwnProperty('short_path') && data.isAdmin) updateData['short_path'] = data.short_path;
    if(data.hasOwnProperty('sectors')) updateData['sectors'] = data.sectors;
    if(data.hasOwnProperty('tags')) updateData['tags'] = data.tags;
    if(data.hasOwnProperty('private')) updateData['private'] = data.private;
    if(data.hasOwnProperty('status') && data.isAdmin) updateData['status'] = data.status;

    Model.findByIdAndUpdate(id, updateData, {new: true}).then((result) => {
        let userUpdateData = {}
        let upsert = false;
        if(data.password && data.first_name && data.email) upsert = true;
        if(data.first_name) userUpdateData['first_name'] = data.first_name;
        if(data.hasOwnProperty('last_name')) userUpdateData['last_name'] = data.last_name;
        if(data.email && data.isAdmin) userUpdateData['email'] = data.email;
        if(data.hasOwnProperty('address')) userUpdateData['address'] = data.address;
        if(data.hasOwnProperty('city')) userUpdateData['city'] = data.city;
        if(data.hasOwnProperty('state')) userUpdateData['state'] = data.state;
        if(data.hasOwnProperty('country')) userUpdateData['country'] = data.country;
        if(data.hasOwnProperty('pincode')) userUpdateData['pincode'] = data.pincode;
        if(data.password) userUpdateData['password'] = bcrypt.hashSync(data.password, 10);

        User.updateOne({'customer_id': result._id}, {'$set': userUpdateData}, {upsert: upsert}).then((userResult) => {
            next(null, result);
        }).catch((err) => {
            console.error(err);
            next(null, result);
        });
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

    m.select(["-notes"]).lean().then((result) => {
        Model.countDocuments(filters).then((c) => {
            result.totalCount = c;
            next(null, result);
        }).catch(next);
    }).catch(next);
}

let remove = (id, next) => {
    Model.findByIdAndDelete(id).then((result) => {
        next(null, true);
    }).catch(next);
}

module.exports = {
    add,
    update,
    loadAll,
    load,
    remove
}