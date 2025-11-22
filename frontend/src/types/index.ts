// User Types
export interface WalletDto {
  balance: number;
}

export interface StatsDto {
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface UserDto {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar: string; // Non-nullable to match C# structure
  emailVerified: boolean;
  status?: 'active' | 'suspended'; // User account status
  wallet: WalletDto;
  stats: StatsDto;
  createdAt: string;
}

// Match Types
export interface MatchDto {
  _id: string;
  tournament: TournamentDto | null;
  players: UserDto[];
  status: string;
  winner: UserDto | null;
  finishedAt: string | null;
  createdAt: string;
}

// Tournament Types
export interface TournamentDto {
  _id: string;
  name: string;
  description: string;
  type?: string;
  entryFee: number;
  maxPlayers: number;
  status: string;
  players: UserDto[];
  champion: UserDto | null;
  startDate: string | null;
  endDate: string | null;
  tournamentAwardPercentage: number;
  prizePool: number;
  matches: MatchDto[];
  prizeDistributed: boolean;
}

// Transaction Types
export interface TransactionMetaDto {
  [key: string]: any;
}

export interface TransactionDto {
  _id: string;
  user: UserDto;
  type: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  meta: TransactionMetaDto;
  createdAt: string;
}

// Alert Types
export interface AlertMetadataDto {
  rawJson?: string;
  [key: string]: any;
}

export interface AlertDto {
  _id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  player: UserDto | null;
  match: MatchDto | null;
  tournament: TournamentDto | null;
  metadata: AlertMetadataDto;
  status: 'pending' | 'acknowledged' | 'resolved';
  acknowledgedBy: UserDto | null;
  acknowledgedAt: string | null;
  resolvedBy: UserDto | null;
  resolvedAt: string | null;
  resolution: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface EmailBodyRequest {
  email: string;
}

export interface OTPRequest {
  otp: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface RegisterResponse {
  _id: string;
  username: string;
  email: string;
  message: string;
  AuthToken: string;
}

export interface EnterTournamentResponse {
  ok: boolean;
  coins: number;
}

export interface CreateTournamentMatchResponse {
  ok: boolean;
  match: MatchDto;
}

export interface CreateTournamentMatchRequest {
  participants: string[];
  entryFee: number;
  gameType: string;
}

export interface AdminCheckResponse {
  ok: boolean;
  role: string;
}

export interface FinalizeChampionRequest {
  championId: string;
}

export interface FinalizeMatchRequest {
  matchId: string;
  winnerId: string;
}

export interface CreateTournamentRequestAdmin {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxPlayers: number;
  entryFee: number;
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

// Dashboard Types (keeping for backward compatibility if needed)
export interface DashboardStats {
  totalUsers: number;
  totalCoins: number;
  coinsIssued?: number;
  coinsUsedInTournaments?: number;
  coinsUsedInMatches?: number;
}

// Form Types (for admin panel)
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

export interface UpdateUserData {
  username?: string;
  email?: string;
  status?: 'active' | 'suspended';
}

// Type aliases for backward compatibility
export type User = UserDto;
export type Match = MatchDto;
export type Tournament = TournamentDto;
export type Transaction = TransactionDto;

