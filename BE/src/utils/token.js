const jwt = require('jsonwebtoken');

const IS_PROD = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const refreshCookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' : 'lax',
  path: '/api/auth/refresh-token', // chỉ gửi đến đúng endpoint này
  maxAge: REFRESH_COOKIE_MAX_AGE,
};

const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES, // '30m'
  });

const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES, // '7d'
  });

/** Chỉ ghi refreshToken vào httpOnly cookie */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

/** Xoá refreshToken cookie khi logout */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', refreshCookieOptions);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
