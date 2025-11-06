// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Network error. Please check if backend is running.'
      };
    }
  },
  
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      
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
          console.error('Logout API error:', error);
        }
      }

      // Clear token from localStorage
      localStorage.removeItem('token');
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local storage
      localStorage.removeItem('token');
      return { success: true };
    }
  }
};
