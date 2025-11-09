// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'player' | 'admin';
  status: 'active' | 'suspended';
  coins: number;
  wins: number;
  losses: number;
  createdAt: string;
}

// Match Types
export interface Match {
  id: string;
  name: string;
  type: 'public' | 'private';
  cost: number;
  prize: number;
  matchDate: string | null;
  status: 'active' | 'completed' | 'cancelled';
  players: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  player1Name: string | null;
  player2Name: string | null;
  winnerName: string | null;
  createdAt: string;
  completedAt: string | null;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  type: 'public' | 'private';
  maxPlayers: 4 | 8;
  entryCost: number;
  prizePool: number;
  awardPercentage?: number;
  status: 'registration' | 'active' | 'completed' | 'cancelled';
  players: string[];
  participants?: Array<{ id: string; name: string }>;
  participantCount?: number;
  bracket?: TournamentBracket;
  champion?: string;
  championName?: string;
  winnerId?: string;
  winnerName?: string;
  startDate: string | null;
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface TournamentBracket {
  rounds: TournamentRound[];
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  matchIndex: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  player1Name?: string | null;
  player2Name?: string | null;
  winnerName?: string | null;
  status: 'pending' | 'completed';
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: 'match_entry' | 'match_win' | 'match_loss' | 'tournament_entry' | 'tournament_win' | 'admin_add' | 'admin_remove';
  amount: number;
  description: string;
  matchId?: string | null;
  tournamentId?: string | null;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalCoins: number;
  activePlayers: number;
  ongoingMatches: number;
  ongoingTournaments: number;
  completedMatches: number;
  completedTournaments: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
  matches: number;
  tournaments: number;
}

export interface WeeklyActivityData {
  day: string;
  active: number;
  matches: number;
}

export interface RecentActivity {
  id: string;
  type: 'match' | 'tournament' | 'user' | 'transaction';
  action: string;
  user: string;
  time: string;
  status: string;
}

// Alert Types
export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdBy?: string;
  createdByName?: string;
  relatedMatchId?: string | null;
  relatedTournamentId?: string | null;
  relatedUserId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlertSummary {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string; param: string }>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ msg: string; param: string }>;
}

// Form Types
export interface CreateMatchForm {
  name: string;
  type: 'public' | 'private';
  cost: number | string;
  prize: number | string;
  matchDate: string | null;
}

export interface CreateTournamentForm {
  name: string;
  type: 'public' | 'private';
  maxPlayers: 4 | 8 | string | number;
  entryCost: number | string;
  prizePool: number | string;
  startDate: string | null;
}

export interface CreateAlertForm {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedMatchId?: string | null;
  relatedTournamentId?: string | null;
  relatedUserId?: string | null;
  metadata?: Record<string, unknown>;
}

// User Update Types
export interface UpdateUserData {
  name?: string;
  email?: string;
  status?: 'active' | 'suspended';
}

export interface UpdateUserCoinsData {
  amount: number;
  operation: 'add' | 'remove';
}

// Economy Stats
export interface EconomyStats {
  totalCoinsInCirculation: number;
  totalCoinsIssued: number;
  coinsUsedInTournaments: number;
  coinsUsedInMatches: number;
  prizesDistributed: number;
  totalCoinsUsed: number;
}

