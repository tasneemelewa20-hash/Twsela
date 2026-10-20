import { apiClient, isMockMode, simulateDelay } from './client';
import { Tenant } from '../types';
import { INITIAL_TENANTS } from './mockData';

const TENANTS_STORAGE_KEY = 'twsela_tenants_list';

function getStoredTenants(): Tenant[] {
  const stored = localStorage.getItem(TENANTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_TENANTS));
  return [...INITIAL_TENANTS];
}

function saveStoredTenants(tenants: Tenant[]): void {
  localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
}

export async function fetchTenants(): Promise<Tenant[]> {
  if (isMockMode()) {
    await simulateDelay(180);
    return getStoredTenants();
  }
  return apiClient<Tenant[]>('/tenants');
}

export async function createTenant(companyNameAr: string, companyName: string, planTier: 'BASIC' | 'PRO' | 'ENTERPRISE'): Promise<Tenant> {
  if (isMockMode()) {
    await simulateDelay(300);
    const tenants = getStoredTenants();
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const quotas: Record<string, number> = { BASIC: 100, PRO: 250, ENTERPRISE: 500 };

    const newTenant: Tenant = {
      id: tenants.length + 1,
      slug,
      companyName,
      companyNameAr,
      planTier,
      activeShipmentsMonth: 0,
      quotaShipmentsMonth: quotas[planTier] || 100,
      activeUsers: 1,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString().split('T')[0]
    };

    tenants.unshift(newTenant);
    saveStoredTenants(tenants);
    return newTenant;
  }

  return apiClient<Tenant>('/tenants', {
    method: 'POST',
    body: JSON.stringify({ companyNameAr, companyName, planTier })
  });
}
