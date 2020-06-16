const express = require('express');
var throttle = require("express-throttle");

const router = express.Router();
const controller = require('../controllers/profileController')


router.get('/', throttle({ "rate": "1/s", "burst": 5 }), controller.get);
//router.get('/:id', controller.getById);
//router.post('/', controller.post);
//router.put('/:id', controller.put);
//router.delete('/:id', controller.delete);

module.exports = router;