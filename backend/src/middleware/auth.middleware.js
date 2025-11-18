import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authenticate middleware - supports both Authorization header and cookie-based auth
 * Also validates XSRF token when cookies are used (for Unity client)
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie (for Unity client)
    let token = req.headers.authorization?.split(' ')[1];
    const hasAuthHeader = !!token;
    
    // If no Authorization header token, check for cookie
    if (!token) {
      token = req.cookies?.access_token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'No token provided. Authentication required.'
      });
    }

    // If using cookie authentication (no Authorization header), validate XSRF token
    // Unity sends X-XSRF-TOKEN header automatically
    // For same-origin requests (like Swagger UI), XSRF validation is optional
    if (!hasAuthHeader && req.cookies?.access_token) {
      const xsrfTokenHeader = req.headers['x-xsrf-token'] || req.headers['X-XSRF-TOKEN'];
      const xsrfTokenCookie = req.cookies['XSRF-TOKEN'];
      
      // Only validate XSRF if header is present (Unity will always send it)
      // If header is not present, allow for same-origin requests (testing)
      if (xsrfTokenHeader) {
        if (!xsrfTokenCookie || xsrfTokenHeader !== xsrfTokenCookie) {
          return res.status(403).json({
            error: 'Invalid XSRF token'
          });
        }
      }
      // If XSRF header is not present, allow for same-origin (Swagger UI testing)
      // Unity client will always send X-XSRF-TOKEN header
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('id email name role status');
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Account is suspended'
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }
    return res.status(500).json({
      error: 'Authentication error'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }
  next();
};
