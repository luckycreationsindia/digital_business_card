const express = require('express');
const router = express.Router();
const Controller = require('../controllers/customer');

/* Load by ID. */
router.get('/:id', Controller.loadById);

/* Load by Short Path. */
router.get('/short/:id', Controller.loadByShortPath);

/* Load All. */
router.post('/loadAll', isAdmin, Controller.loadAll);

/* Load For Connect. */
router.post('/load', Controller.load);

/* Add New Customer */
router.post('/add', isAdmin, Controller.add);

/* Update Customer */
router.post('/update/:id', isAuth, Controller.update);

module.exports = router;
