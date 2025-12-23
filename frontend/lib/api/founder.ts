/**
 * Founder API Client
 * عميل API للمؤسس ورئيس مجلس الإدارة
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Store founder token in localStorage
const FOUNDER_TOKEN_KEY = 'founder_access_token';
const FOUNDER_REFRESH_TOKEN_KEY = 'founder_refresh_token';
const FOUNDER_DATA_KEY = 'founder_data';

export interface FounderData {
  id: string;
  email: string;
  fullName: string;
  title: string;
  companyName: string;
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    founder: FounderData;
  };
}

/**
 * Login founder
 */
export async function loginFounder(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/founder/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'فشل تسجيل الدخول');
  }

  // Store tokens and founder data
  if (data.success && data.data) {
    localStorage.setItem(FOUNDER_TOKEN_KEY, data.data.accessToken);
    localStorage.setItem(FOUNDER_REFRESH_TOKEN_KEY, data.data.refreshToken);
    localStorage.setItem(FOUNDER_DATA_KEY, JSON.stringify(data.data.founder));
  }

  return data;
}

/**
 * Logout founder
 */
export async function logoutFounder(): Promise<void> {
  const refreshToken = localStorage.getItem(FOUNDER_REFRESH_TOKEN_KEY);

  try {
    await fetch(`${API_BASE}/founder/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (e) {
    // Ignore logout errors
  }

  // Clear stored data
  localStorage.removeItem(FOUNDER_TOKEN_KEY);
  localStorage.removeItem(FOUNDER_REFRESH_TOKEN_KEY);
  localStorage.removeItem(FOUNDER_DATA_KEY);
}

/**
 * Refresh founder token
 */
export async function refreshFounderToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(FOUNDER_REFRESH_TOKEN_KEY);

  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/founder/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem(FOUNDER_TOKEN_KEY, data.data.accessToken);
      localStorage.setItem(FOUNDER_REFRESH_TOKEN_KEY, data.data.refreshToken);
      return true;
    }
  } catch (e) {
    // Token refresh failed
  }

  // Clear invalid tokens
  localStorage.removeItem(FOUNDER_TOKEN_KEY);
  localStorage.removeItem(FOUNDER_REFRESH_TOKEN_KEY);
  localStorage.removeItem(FOUNDER_DATA_KEY);

  return false;
}

/**
 * Get stored founder data
 */
export function getFounderData(): FounderData | null {
  const data = localStorage.getItem(FOUNDER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Get founder access token
 */
export function getFounderToken(): string | null {
  return localStorage.getItem(FOUNDER_TOKEN_KEY);
}

/**
 * Check if founder is authenticated
 */
export function isFounderAuthenticated(): boolean {
  return !!getFounderToken();
}

/**
 * Get founder profile
 */
export async function getFounderProfile(): Promise<FounderData> {
  const token = getFounderToken();

  if (!token) {
    throw new Error('غير مسجل الدخول');
  }

  const res = await fetch(`${API_BASE}/founder/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      // Try to refresh token
      const refreshed = await refreshFounderToken();
      if (refreshed) {
        return getFounderProfile();
      }
    }
    throw new Error(data.message || 'فشل جلب البيانات');
  }

  return data.data;
}

/**
 * Get board statistics
 */
export async function getBoardStats(): Promise<any> {
  const token = getFounderToken();

  if (!token) {
    throw new Error('غير مسجل الدخول');
  }

  const res = await fetch(`${API_BASE}/founder/board-stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'فشل جلب الإحصائيات');
  }

  return data.data;
}

/**
 * Make authenticated request to founder API
 */
export async function founderFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getFounderToken();

  if (!token) {
    throw new Error('غير مسجل الدخول');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      // Try to refresh token
      const refreshed = await refreshFounderToken();
      if (refreshed) {
        return founderFetch(endpoint, options);
      }
      // Redirect to login
      window.location.href = '/founder/login';
    }
    throw new Error(data.message || data.error || 'حدث خطأ');
  }

  return data;
}
