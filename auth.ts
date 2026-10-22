import { apiClient, isMockMode, simulateDelay } from './client';
import { User, UserRole } from '../types';
import { DEMO_USERS } from './mockData';

export interface LoginCredentials {
  phoneOrEmail: string;
  password?: string;
  selectedRole?: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (isMockMode()) {
    await simulateDelay(250);
    // Determine user by selected role or phone
    const role = credentials.selectedRole || 'ADMIN';
    const user = DEMO_USERS[role] || DEMO_USERS.ADMIN;
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-${user.id}`;

    localStorage.setItem('twsela_token', token);
    localStorage.setItem('twsela_user', JSON.stringify(user));
    localStorage.setItem('twsela_tenant_id', user.tenantId);

    return { token, refreshToken, user };
  }

  const response = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: credentials.phoneOrEmail,
      password: credentials.password
    })
  });

  localStorage.setItem('twsela_token', response.token);
  localStorage.setItem('twsela_user', JSON.stringify(response.user));
  localStorage.setItem('twsela_tenant_id', response.user.tenantId);

  return response;
}

export async function logout(): Promise<void> {
  if (isMockMode()) {
    await simulateDelay(100);
  } else {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (_) {
      // Continue client cleanup even if backend fails
    }
  }

  localStorage.removeItem('twsela_token');
  localStorage.removeItem('twsela_user');
  localStorage.removeItem('twsela_tenant_id');
}

export async function getCurrentUser(): Promise<User | null> {
  const cached = localStorage.getItem('twsela_user');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {
      return null;
    }
  }
  return null;
}
