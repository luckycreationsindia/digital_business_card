const msg91 = require('msg91');

function send(flowId, mobile, data, next) {
    let sms = msg91.getSMS({authKey: process.env.MSG91_AUTH_KEY})
    sms.send(flowId, mobile, data).then((r) => {next(null, r)}).catch(next);
}

module.exports = {
    send
}