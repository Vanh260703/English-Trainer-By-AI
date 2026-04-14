const router      = require('express').Router();
const ctrl        = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat',             protect, ctrl.chat);
router.post('/grammar-check',    protect, ctrl.grammarCheck);
router.post('/exercise',         protect, ctrl.generateExercise);
router.post('/vocabulary',       protect, ctrl.vocabulary);
router.post('/writing-feedback', protect, ctrl.writingFeedback);

module.exports = router;
