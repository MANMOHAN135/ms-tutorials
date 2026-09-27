/**
 * MS Tutorials — Frontend Authentication Service (Phase 5.10B)
 * 
 * Interacts with locked Phase 5.2 & 5.3 backend endpoints:
 *   POST /api/auth/login
 *   POST /api/auth/refresh
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 * 
 * Security Invariants:
 *   - Access tokens are held STRICTLY in module memory (never in localStorage or sessionStorage).
 *   - Refresh tokens are transmitted strictly via secure HttpOnly cookies (credentials: 'include').
 *   - Never expose credentials or secrets to client logging or storage.
 */

let inMemoryAccessToken = null;

export const authService = {
  /**
   * Retrieves active in-memory access token.
   * @returns {string|null}
   */
  getAccessToken() {
    return inMemoryAccessToken;
  },

  /**
   * Updates in-memory access token.
   * @param {string|null} token
   */
  setAccessToken(token) {
    inMemoryAccessToken = token;
  },

  /**
   * Clears in-memory access token.
   */
  clearAccessToken() {
    inMemoryAccessToken = null;
  },

  /**
   * Authenticates user against POST /api/auth/login.
   * Role is locked to 'student' for the Student Portal.
   * 
   * @param {Object} credentials
   * @param {string} [credentials.role='student']
   * @param {string} credentials.identifier - Admission No or Email
   * @param {string} credentials.password
   * @returns {Promise<{ user: Object, accessToken: string }>}
   */
  async login({ role = 'student', identifier, password }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        role,
        identifier: identifier ? identifier.trim() : '',
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || 'Authentication failed. Please verify your credentials.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    inMemoryAccessToken = data.accessToken || null;
    return data;
  },

  /**
   * Exchanges HttpOnly refresh cookie for a fresh access token.
   * @returns {Promise<{ accessToken: string }>}
   */
  async refresh() {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      inMemoryAccessToken = null;
      const errorMsg = data.error || 'Session expired or refresh token invalid.';
      const err = new Error(errorMsg);
      err.status = res.status;
      throw err;
    }

    inMemoryAccessToken = data.accessToken || null;
    return data;
  },

  /**
   * Revokes refresh token in database, clears HttpOnly cookie, and wipes in-memory token.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (err) {
      // Ignore network transport failures during logout to guarantee client teardown
    } finally {
      inMemoryAccessToken = null;
    }
    return { success: true };
  },

  /**
   * Fetches verified identity from GET /api/auth/me using in-memory access token.
   * @param {string} [customToken=null]
   * @returns {Promise<{ user: { id: string, role: string, identifier: string, name: string } }>}
   */
  async getMe(customToken = null) {
    const token = customToken || inMemoryAccessToken;
    if (!token) {
      const err = new Error('No active access token.');
      err.status = 401;
      throw err;
    }

    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || 'Failed to retrieve authenticated identity.';
      const err = new Error(errorMsg);
      err.status = res.status;
      throw err;
    }

    return data;
  },

  /**
   * Authenticated fetch wrapper.
   * Automatically attaches Authorization: Bearer <token>.
   * Intercepts 401 responses and attempts a single silent token refresh.
   * 
   * @param {string} url
   * @param {RequestInit} [options={}]
   * @returns {Promise<Response>}
   */
  async authFetch(url, options = {}) {
    let token = inMemoryAccessToken;

    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Reactive 401 refresh interceptor
    if (res.status === 401) {
      try {
        const refreshData = await this.refresh();
        const newToken = refreshData.accessToken;

        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };

        res = await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: 'include',
        });
      } catch (refreshErr) {
        inMemoryAccessToken = null;
        return res;
      }
    }

    return res;
  },
};

export default authService;
