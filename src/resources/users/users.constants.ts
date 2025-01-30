export const NOT_UNIQUE_USER_DB_ERROR = `duplicate key value violates unique constraint "users_email_unique_idx"`;
export const USERS_SESSIONS_REDIS_PREFIX = 'users_sessions';
export const USERS_SESSIONS_REDIS_EXPIRING_PERIOD_IN_SEC = 12 * 3_600;
export const COOKIES_USER_SESSION_TOKEN_NAME = 'x-session-token';
export const INITIAL_USERS_BALANCE = 100;
