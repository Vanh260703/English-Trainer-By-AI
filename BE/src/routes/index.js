const router = require('express').Router();

router.use('/auth',     require('./auth'));
router.use('/ai',       require('./ai'));
router.use('/sessions', require('./sessions'));

// TODO: thêm routes khác ở đây
// router.use('/lessons', require('./lessons'));

module.exports = router;
