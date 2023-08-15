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

let loadByShortPath = (req, res, next) => {
    Service.load({filter: {short_path: req.params.id}}, (err, result) => {
        if (err) {
            return next(err);
        } else if (!result || !result.length) {
            res.json({'status': 'Error', 'message': 'Invalid Customer'});
        } else {
            let id = result[0]._id;
            let url = (process.env.FRONTEND_URL || "http://localhost:9878/") + "?id=" + id;
            res.status(301).redirect(url);
        }
    });
}

let loadAll = (req, res, next) => {
    let data = req.body;
    Service.loadAll(data, (err, result) => {
        if (err) return next(err);
        res.json({'status': 'Success', 'message': result});
    });
}

let load = (req, res, next) => {
    let data = req.body;
    Service.load(data, (err, result) => {
        if (err) return next(err);
        res.json({'status': 'Success', 'message': result});
    });
}

module.exports = {
    add,
    update,
    loadById,
    loadByShortPath,
    load,
    loadAll,
}