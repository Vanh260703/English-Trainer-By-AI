const router = require('express').Router();
const { createSession, submitExercise, getHistory, getStats } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/',                  createSession);
router.post('/:id/submit',        submitExercise);
router.get('/',                   getHistory);
router.get('/stats',              getStats);

module.exports = router;
