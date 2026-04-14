const router  = require('express').Router();
const passport = require('passport');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
} = require('../controllers/authController');
const { handleOAuthCallback } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ─── Email / Password ──────────────────────────────────────────
router.post('/register',      register);
router.post('/login',         login);
router.post('/logout',        protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/me',             protect, getMe);

// ─── Google OAuth ──────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/redirect/google',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=google_failed`,
  }),
  handleOAuthCallback
);

// ─── Facebook OAuth ────────────────────────────────────────────
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);
router.get('/redirect/facebook',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=facebook_failed`,
  }),
  handleOAuthCallback
);

module.exports = router;
