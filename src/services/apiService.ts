// API Base URL - Change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const apiService = {
  // Users
  getUsers: async (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiRequest(`/users${params}`);
    return response.users || [];
  },
  
  updateUser: async (id: string, data: any) => {
    const response = await apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  },

  updateUserCoins: async (userId: string, amount: number, operation: 'add' | 'remove') => {
    const response = await apiRequest(`/users/${userId}/coins`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, operation }),
    });
    return response;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'suspended') => {
    const response = await apiRequest(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response;
  },
  
  // Matches
  getMatches: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await apiRequest(`/matches${params}`);
    return response.matches || [];
  },
  
  createMatch: async (data: any) => {
    const response = await apiRequest('/matches', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.type,
        cost: parseInt(data.cost),
        prize: parseInt(data.prize),
        matchDate: data.matchDate || null,
      }),
    });
    return response;
  },

  joinMatch: async (matchId: string, userId: string) => {
    const response = await apiRequest(`/matches/${matchId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response;
  },

  autoJoinMatch: async () => {
    const response = await apiRequest('/matches/auto-join', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  recordMatchResult: async (matchId: string, winnerId: string, loserId: string) => {
    const response = await apiRequest(`/matches/${matchId}/result`, {
      method: 'POST',
      body: JSON.stringify({ winnerId, loserId }),
    });
    return response;
  },
  
  // Tournaments
  getTournaments: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await apiRequest(`/tournaments${params}`);
    return response.tournaments || [];
  },

  getTournament: async (id: string) => {
    const response = await apiRequest(`/tournaments/${id}`);
    return response.tournament;
  },
  
  createTournament: async (data: any) => {
    const response = await apiRequest('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.type,
        maxPlayers: parseInt(data.maxPlayers),
        entryCost: parseInt(data.entryCost),
        prizePool: parseInt(data.prizePool),
        startDate: data.startDate || null,
      }),
    });
    return response;
  },

  joinTournament: async (tournamentId: string) => {
    const response = await apiRequest(`/tournaments/${tournamentId}/join`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  recordTournamentMatch: async (tournamentId: string, roundNumber: number, matchIndex: number, winnerId: string) => {
    const response = await apiRequest(`/tournaments/${tournamentId}/record-match`, {
      method: 'POST',
      body: JSON.stringify({
        roundNumber,
        matchIndex,
        winnerId,
      }),
    });
    return response;
  },

  cancelTournament: async (tournamentId: string, reason?: string) => {
    const response = await apiRequest(`/tournaments/${tournamentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || '' }),
    });
    return response;
  },
  
  // Transactions
  getTransactions: async (userId?: string) => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiRequest(`/transactions${params}`);
    return response.transactions || [];
  },
  
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await apiRequest('/dashboard/stats');
    return response.stats || {
      totalUsers: 0,
      totalCoins: 0,
      activePlayers: 0,
      ongoingMatches: 0,
      ongoingTournaments: 0,
      completedMatches: 0,
      completedTournaments: 0
    };
  },
  
  // Economy stats
  getEconomyStats: async () => {
    const response = await apiRequest('/dashboard/economy');
    return response.economy || {
      totalCoinsInCirculation: 0,
      totalCoinsIssued: 0,
      coinsUsedInTournaments: 0,
      coinsUsedInMatches: 0,
      prizesDistributed: 0,
      totalCoinsUsed: 0
    };
  },
  
  // Dashboard charts
  getUserGrowthData: async () => {
    const response = await apiRequest('/dashboard/user-growth');
    return response.data || [];
  },

  getWeeklyActivityData: async () => {
    const response = await apiRequest('/dashboard/weekly-activity');
    return response.data || [];
  },

  getRecentActivity: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiRequest(`/dashboard/recent-activity${params}`);
    return response.activities || [];
  },

  // Auth endpoints
  logout: async () => {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  checkAdmin: async () => {
    const response = await apiRequest('/auth/check-admin');
    return response;
  },

  // Match endpoints
  getMatch: async (id: string) => {
    const response = await apiRequest(`/matches/${id}`);
    return response.match;
  },

  // User endpoints
  getUserStats: async (userId: string) => {
    const response = await apiRequest(`/users/${userId}/stats`);
    return response.stats;
  },

  // Tournament endpoints
  getTournamentPlayers: async (tournamentId: string) => {
    const response = await apiRequest(`/tournaments/${tournamentId}/players`);
    return response;
  },

  updateTournamentAwardPercentage: async (tournamentId: string, percentage: number) => {
    const response = await apiRequest(`/tournaments/${tournamentId}/update-award-percentage`, {
      method: 'POST',
      body: JSON.stringify({ percentage }),
    });
    return response;
  },

  // System status
  getSystemStatus: async () => {
    const response = await apiRequest('/dashboard/system/status');
    return response.status;
  },

  // Alerts endpoints
  createAlert: async (data: any) => {
    const response = await apiRequest('/alerts/create', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        severity: data.severity || 'medium',
        relatedMatchId: data.relatedMatchId || null,
        relatedTournamentId: data.relatedTournamentId || null,
        relatedUserId: data.relatedUserId || null,
        metadata: data.metadata || {}
      }),
    });
    return response;
  },

  getAlerts: async (status?: string, type?: string, severity?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (severity) params.append('severity', severity);
    const queryString = params.toString();
    const response = await apiRequest(`/alerts${queryString ? `?${queryString}` : ''}`);
    return response.alerts || [];
  },

  getAlert: async (id: string) => {
    const response = await apiRequest(`/alerts/${id}`);
    return response.alert;
  },

  acknowledgeAlert: async (id: string) => {
    const response = await apiRequest(`/alerts/${id}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  resolveAlert: async (id: string) => {
    const response = await apiRequest(`/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  dismissAlert: async (id: string) => {
    const response = await apiRequest(`/alerts/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  getAlertsSummary: async () => {
    const response = await apiRequest('/alerts/stats/summary');
    return response.summary || {};
  },

  bulkAcknowledgeAlerts: async (alertIds: string[]) => {
    const response = await apiRequest('/alerts/bulk/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertIds }),
    });
    return response;
  },

  // Admin alerts endpoints
  getAdminAlertsDashboard: async () => {
    const response = await apiRequest('/admin/alerts/dashboard');
    return response.dashboard || {};
  },

  getAdminAlerts: async (status?: string, type?: string, severity?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (severity) params.append('severity', severity);
    const queryString = params.toString();
    const response = await apiRequest(`/admin/alerts${queryString ? `?${queryString}` : ''}`);
    return response.alerts || [];
  },

  getAdminAlert: async (id: string) => {
    const response = await apiRequest(`/admin/alerts/${id}`);
    return response.alert;
  },

  adminAcknowledgeAlert: async (id: string) => {
    const response = await apiRequest(`/admin/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  adminResolveAlert: async (id: string) => {
    const response = await apiRequest(`/admin/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  adminDismissAlert: async (id: string) => {
    const response = await apiRequest(`/admin/alerts/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  adminBulkAcknowledgeAlerts: async (alertIds: string[]) => {
    const response = await apiRequest('/admin/alerts/bulk/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertIds }),
    });
    return response;
  },

  getAdminAlertsSummary: async () => {
    const response = await apiRequest('/admin/alerts/stats/summary');
    return response.summary || {};
  },
  
  // Admin logs (for future)
  getAdminLogs: async () => {
    // TODO: Implement when admin logs API is ready
    return [];
  }
};
