const express = require('express');
const router = express.Router();

const infonode_controller = require('../controllers/infonode.controller');


// a simple test url to check that all of our files are communicating correctly.
router.get('/test', infonode_controller.test);

router.post('/create', infonode_controller.infonode_create);

router.get('/:id', infonode_controller.infonode_details);

router.put('/:id/update', infonode_controller.infonode_update);

router.delete('/:id/delete', infonode_controller.infonode_delete);

module.exports = router;
