const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: String,
    contacts: [{type: String}],
    company: String,
    jobTitle: String,
    profile: String,
    mainColor: String,
    email: String,
    website: String,
    address: String,
    city: {type: String, default: "Bangalore"},
    state: {type: String, default: "Karnataka"},
    country: {type: String, default: "India"},
    pincode: Number,
    latitude: Number,
    longitude: Number,
    facebook: String,
    instagram: String,
    linkedin: String,
    github: String,
    whatsapp: String,
    twitter: String,
    upi: String,
    upiData: {type: Schema.Types.Map},
    bankDetails: String,
    about: String,
    notes: String,
    status: {type: Boolean, default: false},
}, {timestamps: true, collection: 'customers', toJSON: {virtuals: true}, toObject: {virtuals: true}});

CustomerSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

CustomerSchema.virtual('displayName').get(function() {
    return getDisplayName(this);
});

function getDisplayName(x) {
    let name = x.first_name;
    if (name) {
        if (x.last_name) {
            name += " " + x.last_name;
        }
    } else {
        name = x.email;
    }
    return name;
}

module.exports = mongoose.model('Customer', CustomerSchema, "customers");