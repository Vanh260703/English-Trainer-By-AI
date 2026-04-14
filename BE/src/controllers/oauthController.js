const { signAccessToken, signRefreshToken, setRefreshTokenCookie } = require('../utils/token');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Shared handler cho Google và Facebook callback.
 * accessToken trả về qua URL fragment (#) để FE đọc từ window.location.hash.
 * refreshToken vẫn set vào httpOnly cookie.
 */
exports.handleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    // Fragment (#) không được gửi lên server → an toàn hơn query param
    res.redirect(`${CLIENT_URL}#token=${accessToken}`);
  } catch {
    res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
  }
};
