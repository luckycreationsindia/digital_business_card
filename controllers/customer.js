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
    let data = req.body;
    data._id = req.params.id;
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

let loadAll = (req, res, next) => {
    Service.load({}, (err, result) => {
        if (err) return next(err);
        res.json({'status': 'Success', 'message': result});
    });
}

module.exports = {
    add,
    update,
    loadById,
    loadAll
}