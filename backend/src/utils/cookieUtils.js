/**
 * Utility functions for handling authentication cookies for Unity client integration
 */

/**
 * Set authentication cookies (access_token, refresh_token, XSRF-TOKEN)
 * @param {Object} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {string} xsrfToken - XSRF token
 */
export const setAuthCookies = (res, accessToken, refreshToken, xsrfToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Only use secure cookies in production (HTTPS)
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  // Set access_token cookie
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000 // 1 hour for access token
  });

  // Set refresh_token cookie
  res.cookie('refresh_token', refreshToken, cookieOptions);

  // Set XSRF-TOKEN cookie (not httpOnly so Unity client can read it)
  res.cookie('XSRF-TOKEN', xsrfToken, {
    ...cookieOptions,
    httpOnly: false, // Unity needs to read this
    sameSite: 'lax'
  });
};

/**
 * Generate a random XSRF token
 * @returns {string} Random XSRF token
 */
export const generateXsrfToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
export const clearAuthCookies = (res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('XSRF-TOKEN');
};

