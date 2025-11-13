export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://truco-backend-production.up.railway.app/api',
  TIMEOUT: 30000,
} as const;

export const DEFAULT_ADMIN = import.meta.env.PROD ? undefined : {
  EMAIL: 'admin@truco.com',
  PASSWORD: 'admin123',
} as const;

export const USER_ROLES = {
  PLAYER: 'player',
  ADMIN: 'admin',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export const MATCH_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

export const MATCH_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TOURNAMENT_STATUS = {
  REGISTRATION: 'registration',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TOURNAMENT_MAX_PLAYERS = {
  FOUR: 4,
  EIGHT: 8,
} as const;

export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
  SYSTEM: 'system',
} as const;

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

export const TRANSACTION_TYPES = {
  MATCH_ENTRY: 'match_entry',
  MATCH_WIN: 'match_win',
  MATCH_LOSS: 'match_loss',
  TOURNAMENT_ENTRY: 'tournament_entry',
  TOURNAMENT_WIN: 'tournament_win',
  ADMIN_ADD: 'admin_add',
  ADMIN_REMOVE: 'admin_remove',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check if backend is running.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  UPDATE_SUCCESS: 'Updated successfully!',
  CREATE_SUCCESS: 'Created successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const CHART_COLORS = {
  PRIMARY: 'hsl(var(--primary))',
  ACCENT: 'hsl(var(--accent))',
  SUCCESS: 'hsl(var(--success))',
  WARNING: 'hsl(var(--warning))',
  ERROR: 'hsl(var(--destructive))',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DATE_TIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;


