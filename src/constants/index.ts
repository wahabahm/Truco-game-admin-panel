// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD 
    ? 'https://truco-game-admin-panel-production.up.railway.app/api'
    : 'http://localhost:3000/api'),
  TIMEOUT: 30000, // 30 seconds
} as const;

// Note: Default admin credentials should NOT be hardcoded in production
// These are only for development/testing purposes
// In production, change the default admin password immediately after first deployment
// Remove this constant or make it undefined in production builds
export const DEFAULT_ADMIN = import.meta.env.PROD ? undefined : {
  EMAIL: 'admin@truco.com',
  PASSWORD: 'admin123',
} as const;

// User Roles
export const USER_ROLES = {
  PLAYER: 'player',
  ADMIN: 'admin',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

// Match Types
export const MATCH_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

// Match Status
export const MATCH_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Tournament Status
export const TOURNAMENT_STATUS = {
  REGISTRATION: 'registration',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Tournament Max Players
export const TOURNAMENT_MAX_PLAYERS = {
  FOUR: 4,
  EIGHT: 8,
} as const;

// Alert Types
export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
  SYSTEM: 'system',
} as const;

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Alert Status
export const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  MATCH_ENTRY: 'match_entry',
  MATCH_WIN: 'match_win',
  MATCH_LOSS: 'match_loss',
  TOURNAMENT_ENTRY: 'tournament_entry',
  TOURNAMENT_WIN: 'tournament_win',
  ADMIN_ADD: 'admin_add',
  ADMIN_REMOVE: 'admin_remove',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check if backend is running.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  UPDATE_SUCCESS: 'Updated successfully!',
  CREATE_SUCCESS: 'Created successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: 'hsl(var(--primary))',
  ACCENT: 'hsl(var(--accent))',
  SUCCESS: 'hsl(var(--success))',
  WARNING: 'hsl(var(--warning))',
  ERROR: 'hsl(var(--destructive))',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DATE_TIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;


