// Central HTTP API Client with Live/Mock dual-mode support

export const DATA_MODE = (import.meta.env.VITE_DATA_MODE || 'mock').toLowerCase() as 'mock' | 'live';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function isMockMode(): boolean {
  return DATA_MODE === 'mock';
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  details?: Record<string, string>;
}

// Simulated network delay for mock mode to provide realistic UI responsiveness
export async function simulateDelay(ms: number = 220): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiClient<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('twsela_token');
  const tenantId = localStorage.getItem('twsela_tenant_id') || 'twsela-main';

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (tenantId) {
    headers.set('X-Tenant-ID', tenantId);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem('twsela_token');
      localStorage.removeItem('twsela_user');
      window.dispatchEvent(new CustomEvent('twsela_auth_expired'));
      throw { status: 401, message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً' } as ApiError;
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (_) {
        errorData = { message: response.statusText || 'حدث خطأ غير متوقع في الخادم' };
      }
      throw {
        status: response.status,
        message: errorData.message || `خطأ ${response.status}`,
        details: errorData
      } as ApiError;
    }

    // Check for empty body (e.g. 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw { status: 408, message: 'انتهت مهلة انتظار استجابة الخادم (Timeout)' } as ApiError;
    }
    throw err;
  }
}
