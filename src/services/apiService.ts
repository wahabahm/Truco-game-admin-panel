// Mock API service - will connect to real backend later
export const apiService = {
  // Users
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },
  
  updateUser: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, user: { id, ...data } };
  },
  
  // Matches
  getMatches: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMatches;
  },
  
  createMatch: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, match: { id: Date.now().toString(), ...data } };
  },
  
  // Tournaments
  getTournaments: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTournaments;
  },
  
  createTournament: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, tournament: { id: Date.now().toString(), ...data } };
  },
  
  // Transactions
  getTransactions: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;
  },
  
  // Dashboard stats
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      totalUsers: 1523,
      totalCoins: 45230,
      activePlayers: 142,
      ongoingMatches: 23,
      ongoingTournaments: 5,
      completedMatches: 3421,
      completedTournaments: 89
    };
  },
  
  // Admin logs
  getAdminLogs: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAdminLogs;
  }
};

// Mock data
const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@example.com', coins: 1500, status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com', coins: 2300, status: 'active', createdAt: '2024-01-20' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', coins: 890, status: 'suspended', createdAt: '2024-02-01' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@example.com', coins: 3200, status: 'active', createdAt: '2024-02-10' },
  { id: '5', name: 'Carlos Lima', email: 'carlos@example.com', coins: 450, status: 'active', createdAt: '2024-02-15' },
];

const mockMatches = [
  { id: '1', name: 'Championship Match', type: 'public', cost: 100, prize: 180, status: 'active', createdAt: '2024-03-01', players: 2 },
  { id: '2', name: 'Private Match 1', type: 'private', cost: 50, prize: 90, status: 'completed', createdAt: '2024-03-02', players: 2 },
  { id: '3', name: 'Quick Match', type: 'public', cost: 20, prize: 36, status: 'active', createdAt: '2024-03-03', players: 2 },
  { id: '4', name: 'Elite Match', type: 'public', cost: 500, prize: 900, status: 'active', createdAt: '2024-03-04', players: 2 },
];

const mockTournaments = [
  { id: '1', name: 'Spring Championship', type: 'public', entryCost: 500, prizePool: 10000, status: 'ongoing', participants: 32, startDate: '2024-03-10' },
  { id: '2', name: 'Weekend Cup', type: 'public', entryCost: 100, prizePool: 1500, status: 'completed', participants: 16, startDate: '2024-03-05' },
  { id: '3', name: 'Private Tournament', type: 'private', entryCost: 200, prizePool: 3000, status: 'ongoing', participants: 16, startDate: '2024-03-08' },
];

const mockTransactions = [
  { id: '1', userId: '1', type: 'match_entry', amount: -100, description: 'Championship Match entry', timestamp: '2024-03-10 14:30' },
  { id: '2', userId: '2', type: 'match_win', amount: 180, description: 'Championship Match prize', timestamp: '2024-03-10 15:00' },
  { id: '3', userId: '3', type: 'tournament_entry', amount: -500, description: 'Spring Championship entry', timestamp: '2024-03-10 10:00' },
  { id: '4', userId: '4', type: 'coin_purchase', amount: 1000, description: 'Coin package purchase', timestamp: '2024-03-09 18:20' },
  { id: '5', userId: '5', type: 'match_entry', amount: -50, description: 'Quick Match entry', timestamp: '2024-03-10 16:45' },
];

const mockAdminLogs = [
  { id: '1', admin: 'Admin User', action: 'Created tournament "Spring Championship"', timestamp: '2024-03-10 09:00' },
  { id: '2', admin: 'Admin User', action: 'Suspended user Pedro Costa', timestamp: '2024-03-09 14:30' },
  { id: '3', admin: 'Admin User', action: 'Force-closed match "Elite Match"', timestamp: '2024-03-08 16:00' },
  { id: '4', admin: 'Admin User', action: 'Adjusted prize for tournament "Weekend Cup"', timestamp: '2024-03-07 11:20' },
];
