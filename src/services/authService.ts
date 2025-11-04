// Mock auth service - will be replaced with real API calls
export const authService = {
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication
    if (email === 'admin@truco.com' && password === 'admin123') {
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: email,
          name: 'Admin User',
          role: 'admin'
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid credentials'
    };
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};
