const express = require('express');
const router = express.Router();
const Controller = require('../controllers/customer');

/* Load by ID. */
router.get('/:id', Controller.loadById);

/* Load All. */
router.post('/loadAll', isAdmin, Controller.loadAll);

/* Add New Customer */
router.post('/add', isAdmin, Controller.add);

/* Update Customer */
router.post('/update/:id', isAdmin, Controller.update);

module.exports = router;
