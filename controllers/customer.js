let Service = require('../services/customer');

let add = (req, res, next) => {
    Service.add(req.body, (err, result) => {
        if (err) {
            return next(err);
        } else {
            res.json({'status': 'Success', 'message': result});
        }
    });
}

let update = (req, res, next) => {
    Service.update(req.body, (err, result) => {
        if (err) {
            return next(err);
        } else {
            res.json({'status': 'Success', 'message': result});
        }
    });
}

let loadById = (req, res, next) => {
    Service.load({filter: {_id: req.params.id}}, (err, result) => {
        if (err) {
            return next(err);
        } else if (!result || !result.length) {
            res.json({'status': 'Error', 'message': 'Invalid Customer'});
        } else {
            res.json({'status': 'Success', 'message': result[0]});
        }
    });
}

module.exports = {
    add,
    update,
    loadById,
}