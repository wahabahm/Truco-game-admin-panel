import { API_CONFIG, STORAGE_KEYS } from '@/constants';
import { logger } from '@/utils/logger';
import type {
  User,
  Match,
  Tournament,
  Transaction,
  DashboardStats,
  UserGrowthData,
  WeeklyActivityData,
  RecentActivity,
  Alert,
  AlertSummary,
  EconomyStats,
  CreateMatchForm,
  CreateTournamentForm,
  CreateAlertForm,
  ApiResponse,
  UpdateUserData,
} from '@/types';

// API Base URL - Change this to your backend URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Helper function for API requests
const apiRequest = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Use AbortSignal if provided in options
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };
    
    // If signal is provided in options.body, we need to extract it
    // Instead, we'll pass it through options directly
    if (options.signal) {
      fetchOptions.signal = options.signal;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

    let data: T;
    try {
      data = await response.json();
    } catch (error) {
      logger.error('Failed to parse API response:', error);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      const errorMessage = (data as unknown as { message?: string })?.message || 'API request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    logger.error('API Error:', error);
    throw error;
  }
};

export const apiService = {
  // Users
  getUsers: async (search?: string, signal?: AbortSignal): Promise<User[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiRequest<{ users: User[] }>(`/users${params}`, {
      signal,
    });
    return response.users || [];
  },
  
  updateUser: async (id: string, data: UpdateUserData): Promise<ApiResponse<User>> => {
    const response = await apiRequest<ApiResponse<User>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  },

  updateUserCoins: async (userId: string, amount: number, operation: 'add' | 'remove'): Promise<ApiResponse<User>> => {
    const response = await apiRequest<ApiResponse<User>>(`/users/${userId}/coins`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, operation }),
    });
    return response;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'suspended'): Promise<ApiResponse<User>> => {
    const response = await apiRequest<ApiResponse<User>>(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response;
  },
  
  // Matches
  getMatches: async (status?: string): Promise<Match[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiRequest<{ matches: Match[] }>(`/matches${params}`);
    return response.matches || [];
  },
  
  createMatch: async (data: CreateMatchForm): Promise<ApiResponse<Match>> => {
    const response = await apiRequest<ApiResponse<Match>>('/matches', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.type,
        cost: typeof data.cost === 'number' ? data.cost : parseInt(String(data.cost), 10),
        prize: typeof data.prize === 'number' ? data.prize : parseInt(String(data.prize), 10),
        matchDate: data.matchDate || null,
      }),
    });
    return response;
  },

  joinMatch: async (matchId: string, userId: string): Promise<ApiResponse<Match>> => {
    const response = await apiRequest<ApiResponse<Match>>(`/matches/${matchId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response;
  },

  autoJoinMatch: async (): Promise<ApiResponse<Match>> => {
    const response = await apiRequest<ApiResponse<Match>>('/matches/auto-join', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  recordMatchResult: async (matchId: string, winnerId: string, loserId: string): Promise<ApiResponse<Match>> => {
    const response = await apiRequest<ApiResponse<Match>>(`/matches/${matchId}/result`, {
      method: 'POST',
      body: JSON.stringify({ winnerId, loserId }),
    });
    return response;
  },
  
  // Tournaments
  getTournaments: async (status?: string): Promise<Tournament[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiRequest<{ tournaments: Tournament[] }>(`/tournaments${params}`);
    return response.tournaments || [];
  },

  getTournament: async (id: string): Promise<Tournament> => {
    const response = await apiRequest<{ tournament: Tournament }>(`/tournaments/${id}`);
    return response.tournament;
  },
  
  createTournament: async (data: CreateTournamentForm): Promise<ApiResponse<Tournament>> => {
    const response = await apiRequest<ApiResponse<Tournament>>('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.type,
        maxPlayers: typeof data.maxPlayers === 'number' ? data.maxPlayers : parseInt(String(data.maxPlayers), 10),
        entryCost: typeof data.entryCost === 'number' ? data.entryCost : parseInt(String(data.entryCost), 10),
        prizePool: typeof data.prizePool === 'number' ? data.prizePool : parseInt(String(data.prizePool), 10),
        startDate: data.startDate || null,
      }),
    });
    return response;
  },

  joinTournament: async (tournamentId: string): Promise<ApiResponse<Tournament>> => {
    const response = await apiRequest<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/join`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  recordTournamentMatch: async (tournamentId: string, roundNumber: number, matchIndex: number, winnerId: string): Promise<ApiResponse<Tournament>> => {
    const response = await apiRequest<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/record-match`, {
      method: 'POST',
      body: JSON.stringify({
        roundNumber,
        matchIndex,
        winnerId,
      }),
    });
    return response;
  },

  cancelTournament: async (tournamentId: string, reason?: string): Promise<ApiResponse<Tournament>> => {
    const response = await apiRequest<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || '' }),
    });
    return response;
  },
  
  // Transactions
  getTransactions: async (userId?: string): Promise<Transaction[]> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiRequest<{ transactions: Transaction[] }>(`/transactions${params}`);
    return response.transactions || [];
  },
  
  // Dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest<{ stats: DashboardStats }>('/dashboard/stats');
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
  getEconomyStats: async (): Promise<EconomyStats> => {
    const response = await apiRequest<{ economy: EconomyStats }>('/dashboard/economy');
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
  getUserGrowthData: async (): Promise<UserGrowthData[]> => {
    const response = await apiRequest<{ data: UserGrowthData[] }>('/dashboard/user-growth');
    return response.data || [];
  },

  getWeeklyActivityData: async (): Promise<WeeklyActivityData[]> => {
    const response = await apiRequest<{ data: WeeklyActivityData[] }>('/dashboard/weekly-activity');
    return response.data || [];
  },

  getRecentActivity: async (limit?: number): Promise<RecentActivity[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiRequest<{ activities: RecentActivity[] }>(`/dashboard/recent-activity${params}`);
    return response.activities || [];
  },

  // Auth endpoints
  logout: async (): Promise<ApiResponse> => {
    const response = await apiRequest<ApiResponse>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  checkAdmin: async (): Promise<ApiResponse<{ isAdmin: boolean }>> => {
    const response = await apiRequest<ApiResponse<{ isAdmin: boolean }>>('/auth/check-admin');
    return response;
  },

  // Match endpoints
  getMatch: async (id: string): Promise<Match> => {
    const response = await apiRequest<{ match: Match }>(`/matches/${id}`);
    return response.match;
  },

  // User endpoints
  getUserStats: async (userId: string): Promise<Record<string, unknown>> => {
    const response = await apiRequest<{ stats: Record<string, unknown> }>(`/users/${userId}/stats`);
    return response.stats;
  },

  // Tournament endpoints
  getTournamentPlayers: async (tournamentId: string): Promise<{ players: User[] }> => {
    const response = await apiRequest<{ players: User[] }>(`/tournaments/${tournamentId}/players`);
    return response;
  },

  updateTournamentAwardPercentage: async (tournamentId: string, percentage: number): Promise<ApiResponse<Tournament>> => {
    const response = await apiRequest<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/update-award-percentage`, {
      method: 'POST',
      body: JSON.stringify({ percentage }),
    });
    return response;
  },

  // System status
  getSystemStatus: async (): Promise<Record<string, unknown>> => {
    const response = await apiRequest<{ status: Record<string, unknown> }>('/dashboard/system/status');
    return response.status;
  },

  // Alerts endpoints
  createAlert: async (data: CreateAlertForm): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>('/alerts/create', {
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

  getAlerts: async (status?: string, type?: string, severity?: string): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (severity) params.append('severity', severity);
    const queryString = params.toString();
    const response = await apiRequest<{ alerts: Alert[] }>(`/alerts${queryString ? `?${queryString}` : ''}`);
    return response.alerts || [];
  },

  getAlert: async (id: string): Promise<Alert> => {
    const response = await apiRequest<{ alert: Alert }>(`/alerts/${id}`);
    return response.alert;
  },

  acknowledgeAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>(`/alerts/${id}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  resolveAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>(`/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  dismissAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>(`/alerts/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  getAlertsSummary: async (): Promise<AlertSummary> => {
    const response = await apiRequest<{ summary: AlertSummary }>('/alerts/stats/summary');
    return response.summary || {} as AlertSummary;
  },

  bulkAcknowledgeAlerts: async (alertIds: string[]): Promise<ApiResponse> => {
    const response = await apiRequest<ApiResponse>('/alerts/bulk/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertIds }),
    });
    return response;
  },

  // Admin alerts endpoints
  getAdminAlertsDashboard: async (): Promise<Record<string, unknown>> => {
    const response = await apiRequest<{ dashboard: Record<string, unknown> }>('/admin/alerts/dashboard');
    return response.dashboard || {};
  },

  getAdminAlerts: async (status?: string, type?: string, severity?: string): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (severity) params.append('severity', severity);
    const queryString = params.toString();
    const response = await apiRequest<{ alerts: Alert[] }>(`/admin/alerts${queryString ? `?${queryString}` : ''}`);
    return response.alerts || [];
  },

  getAdminAlert: async (id: string): Promise<Alert> => {
    const response = await apiRequest<{ alert: Alert }>(`/admin/alerts/${id}`);
    return response.alert;
  },

  adminAcknowledgeAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>(`/admin/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  adminResolveAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>(`/admin/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  adminDismissAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiRequest<ApiResponse<Alert>>(`/admin/alerts/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  adminBulkAcknowledgeAlerts: async (alertIds: string[]): Promise<ApiResponse> => {
    const response = await apiRequest<ApiResponse>('/admin/alerts/bulk/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertIds }),
    });
    return response;
  },

  getAdminAlertsSummary: async (): Promise<AlertSummary> => {
    const response = await apiRequest<{ summary: AlertSummary }>('/admin/alerts/stats/summary');
    return response.summary || {} as AlertSummary;
  },
  
  // Admin logs (for future)
  getAdminLogs: async (): Promise<unknown[]> => {
    // TODO: Implement when admin logs API is ready
    return [];
  }
};
