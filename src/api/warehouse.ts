import { apiClient, isMockMode, simulateDelay } from './client';
import { WarehouseBin, Manifest } from '../types';
import { INITIAL_BINS, INITIAL_MANIFESTS } from './mockData';
import { updateShipmentStatus, fetchShipments } from './shipments';

const BINS_STORAGE_KEY = 'twsela_warehouse_bins';
const MANIFESTS_STORAGE_KEY = 'twsela_warehouse_manifests';

function getStoredBins(): WarehouseBin[] {
  const stored = localStorage.getItem(BINS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  localStorage.setItem(BINS_STORAGE_KEY, JSON.stringify(INITIAL_BINS));
  return [...INITIAL_BINS];
}

function saveStoredBins(bins: WarehouseBin[]): void {
  localStorage.setItem(BINS_STORAGE_KEY, JSON.stringify(bins));
}

function getStoredManifests(): Manifest[] {
  const stored = localStorage.getItem(MANIFESTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  localStorage.setItem(MANIFESTS_STORAGE_KEY, JSON.stringify(INITIAL_MANIFESTS));
  return [...INITIAL_MANIFESTS];
}

function saveStoredManifests(manifests: Manifest[]): void {
  localStorage.setItem(MANIFESTS_STORAGE_KEY, JSON.stringify(manifests));
}

export async function fetchWarehouseBins(): Promise<WarehouseBin[]> {
  if (isMockMode()) {
    await simulateDelay(150);
    return getStoredBins();
  }
  return apiClient<WarehouseBin[]>('/warehouses/1/bins');
}

export async function assignBinToPackage(packageCode: string, binKey: string, measuredWeightKg?: number): Promise<{ success: boolean; bin: WarehouseBin }> {
  if (isMockMode()) {
    await simulateDelay(280);
    const bins = getStoredBins();
    const binIdx = bins.findIndex(b => b.key === binKey);
    if (binIdx === -1) throw { status: 404, message: 'الصينية غير موجودة' };

    bins[binIdx].status = 'used';
    bins[binIdx].occupiedShipmentId = packageCode;
    bins[binIdx].weightKg = measuredWeightKg || 1.0;
    saveStoredBins(bins);

    // Also update shipment status if matching
    const allShipments = await fetchShipments();
    const target = allShipments.find(s => s.trackingNumber.toUpperCase() === packageCode.toUpperCase());
    if (target) {
      await updateShipmentStatus(
        target.id,
        'SORTED',
        `صينية التخزين ${binKey}`,
        'أحمد الطيب (المستودع)',
        `تم الاستلام والفرز في الصينية ${binKey}`
      );
    }

    return { success: true, bin: bins[binIdx] };
  }

  return apiClient('/shipments/warehouse/receive', {
    method: 'POST',
    body: JSON.stringify({ barcode: packageCode, binLocation: binKey, measuredWeight: measuredWeightKg })
  });
}

export async function fetchManifests(): Promise<Manifest[]> {
  if (isMockMode()) {
    await simulateDelay(180);
    return getStoredManifests();
  }
  return apiClient<Manifest[]>('/manifests');
}

export async function dispatchManifest(manifestId: string): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await simulateDelay(300);
    const manifests = getStoredManifests();
    const idx = manifests.findIndex(m => m.id === manifestId);
    if (idx !== -1) {
      manifests[idx].status = 'DISPATCHED';
      manifests[idx].loadedShipments = manifests[idx].totalShipments;
      saveStoredManifests(manifests);
    }
    return { success: true, message: `تم إطلاق وتأكيد مغادرة بيان الشحن ${manifestId} بنجاح` };
  }

  return apiClient(`/manifests/${manifestId}/dispatch`, { method: 'POST' });
}
