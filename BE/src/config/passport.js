const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

/**
 * Tìm user theo OAuth provider.
 * Nếu chưa có → tạo mới.
 * Nếu email đã tồn tại nhưng chưa link → link provider vào account cũ.
 */
const findOrCreateOAuthUser = async ({ providerField, providerId, email, name, avatar }) => {
  // 1. Tìm theo provider ID
  let user = await User.findOne({ [providerField]: providerId });
  if (user) return user;

  // 2. Tìm theo email (account đã đăng ký bằng email/password trước đó)
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user[providerField] = providerId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
      return user;
    }
  }

  // 3. Tạo user mới
  return User.create({
    name,
    email,
    avatar,
    [providerField]: providerId,
  });
};

// ─── Google Strategy ───────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser({
          providerField: 'googleId',
          providerId:    profile.id,
          email:         profile.emails?.[0]?.value,
          name:          profile.displayName,
          avatar:        profile.photos?.[0]?.value,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// ─── Facebook Strategy ─────────────────────────────────────────
passport.use(
  new FacebookStrategy(
    {
      clientID:      process.env.FACEBOOK_CLIENT_ID,
      clientSecret:  process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL:   process.env.FACEBOOK_REDIRECT_URL,
      profileFields: ['id', 'displayName', 'email', 'photos'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser({
          providerField: 'facebookId',
          providerId:    profile.id,
          email:         profile.emails?.[0]?.value,
          name:          profile.displayName,
          avatar:        profile.photos?.[0]?.value,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
