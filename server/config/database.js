import mysql from 'mysql2/promise';
import { config } from './environment.js';

let pool = null;

/**
 * Initializes or returns the existing MySQL connection pool.
 * Lazy initialization prevents crashes during module loading or test execution when DB is offline.
 */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: 0,
      connectTimeout: 2000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

/**
 * Executes a parameterized SQL query using the connection pool.
 * Automatically prepares and releases resources.
 * Sanitizes errors to prevent database credential leaks.
 */
export async function query(sql, params = []) {
  try {
    const currentPool = getPool();
    const [rows] = await currentPool.execute(sql, params);
    return rows;
  } catch (error) {
    // Redact connection parameters and log only safe error messages
    const safeError = new Error(`Database Query Error: ${error.message}`);
    safeError.code = error.code;
    safeError.sqlState = error.sqlState;
    throw safeError;
  }
}

/**
 * Obtains a dedicated single connection from the pool for manual transactions.
 */
export async function getConnection() {
  try {
    const currentPool = getPool();
    return await currentPool.getConnection();
  } catch (error) {
    const safeError = new Error(`Database Connection Error: ${error.message}`);
    safeError.code = error.code;
    throw safeError;
  }
}

/**
 * Executes a health check against the database with a fast timeout fallback.
 * Returns connectivity status and ping latency without exposing credentials.
 */
export async function checkDatabaseHealth(timeoutMs = 1500) {
  const startTime = Date.now();
  try {
    const currentPool = getPool();
    const checkQuery = currentPool.query('SELECT 1 AS health_check');
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timed out')), timeoutMs)
    );

    const [result] = await Promise.race([checkQuery, timeout]);
    const latencyMs = Date.now() - startTime;
    return {
      connected: Array.isArray(result) && result[0]?.health_check === 1,
      latencyMs,
      status: 'operational',
    };
  } catch (error) {
    return {
      connected: false,
      status: 'degraded',
      message: 'Database connection currently unreachable or uninitialized',
    };
  }
}

/**
 * Closes the connection pool gracefully (used in tests or shutdown).
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.end();
    } catch (e) {
      // Ignore pool closing errors during cleanup
    }
    pool = null;
  }
}

export const db = {
  getPool,
  query,
  getConnection,
  checkDatabaseHealth,
  closePool,
};

export default db;
