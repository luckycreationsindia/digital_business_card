const express = require('express');
const router = express.Router();
const Controller = require('../controllers/customer');

/* Load by ID. */
router.get('/:id', Controller.loadById);

/* Add New Customer */
router.post('/add', isAdmin, Controller.add);

/* Update Customer */
router.post('/update', isAdmin, Controller.update);

module.exports = router;
