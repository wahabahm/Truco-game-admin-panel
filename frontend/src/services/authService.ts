import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import { logger } from '@/utils/logger';

// API Base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }

      return {
        success: true,
        token: data.token,
        user: data.user
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  },
  
  logout: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      // Call logout API if token exists
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          // Continue with logout even if API call fails
          logger.warn('Logout API error:', error);
        }
      }

      // Clear token from localStorage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return { success: true };
    } catch (error) {
      logger.error('Logout error:', error);
      // Still clear local storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return { success: true };
    }
  },

  verifyEmail: async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Email verification failed'
        };
      }

      return {
        success: true,
        message: data.message || 'Email verified successfully'
      };
    } catch (error) {
      logger.error('Verify email error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Failed to resend verification email'
        };
      }

      return {
        success: true,
        message: data.message || 'Verification email sent successfully',
        token: data.token, // Only in development
        verificationLink: data.verificationLink // Only in development
      };
    } catch (error) {
      logger.error('Resend verification error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  },

  sendOTP: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Failed to send OTP'
        };
      }

      return {
        success: true,
        message: data.message || 'OTP sent successfully'
      };
    } catch (error) {
      logger.error('Send OTP error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'OTP verification failed'
        };
      }

      return {
        success: true,
        message: data.message || 'OTP verified successfully',
        user: data.user
      };
    } catch (error) {
      logger.error('Verify OTP error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Registration failed'
        };
      }

      return {
        success: true,
        message: data.message || 'Registration successful',
        user: {
          id: data._id,
          username: data.username,
          email: data.email
        },
        token: data.AuthToken
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
      };
    }
  }
};
