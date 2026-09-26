import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// In production, enforce that JWT_SECRET is explicitly set to a strong custom secret
const rawJwtSecret = process.env.JWT_SECRET;
if (isProduction && (!rawJwtSecret || rawJwtSecret === 'dev_secret_ms_tutorials_temporary_do_not_use_in_prod')) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET must be explicitly set to a strong secret in production.');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ms_tutorials_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },
  auth: {
    jwtSecret: rawJwtSecret || 'dev_secret_ms_tutorials_temporary_do_not_use_in_prod',
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiresInDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '7', 10),
    refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'ms_refresh_token',
    maxFailedLoginAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10),
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10),
    cookieSecure: process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : isProduction,
    cookieSameSite: process.env.COOKIE_SAMESITE || 'strict',
  },
};
