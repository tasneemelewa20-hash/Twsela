import { apiClient, isMockMode, simulateDelay } from './client';
import { ShipmentDTO, ShipmentStatus } from '../types';
import { INITIAL_SHIPMENTS } from './mockData';

// Persistent in-memory & localStorage mock store
const LOCAL_STORAGE_KEY = 'twsela_mock_shipments';

function getStoredShipments(): ShipmentDTO[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SHIPMENTS));
  return [...INITIAL_SHIPMENTS];
}

function saveStoredShipments(shipments: ShipmentDTO[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shipments));
}

export interface ShipmentFilterParams {
  status?: ShipmentStatus | 'ALL';
  search?: string;
  merchantId?: number;
  courierId?: number;
  zone?: string;
}

export async function fetchShipments(filters: ShipmentFilterParams = {}): Promise<ShipmentDTO[]> {
  if (isMockMode()) {
    await simulateDelay(180);
    let list = getStoredShipments();

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(s => s.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(s =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.recipientName.toLowerCase().includes(q) ||
        s.recipientPhone.includes(q) ||
        s.senderMerchant.toLowerCase().includes(q) ||
        s.destinationZone.toLowerCase().includes(q)
      );
    }
    if (filters.merchantId) {
      list = list.filter(s => s.merchantId === filters.merchantId);
    }
    if (filters.courierId) {
      list = list.filter(s => s.courierId === filters.courierId);
    }
    return list;
  }

  return apiClient<ShipmentDTO[]>('/shipments', {
    params: {
      status: filters.status !== 'ALL' ? filters.status : undefined,
      search: filters.search,
      merchantId: filters.merchantId,
      courierId: filters.courierId
    }
  });
}

export async function fetchShipmentById(id: number): Promise<ShipmentDTO> {
  if (isMockMode()) {
    await simulateDelay(120);
    const list = getStoredShipments();
    const item = list.find(s => s.id === id);
    if (!item) throw { status: 404, message: 'الشحنة غير موجودة' };
    return item;
  }
  return apiClient<ShipmentDTO>(`/shipments/${id}`);
}

export interface CreateShipmentPayload {
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;
  destinationZone: string;
  packageWeightKg: number;
  codAmountEgp: number;
  serviceType: 'STANDARD_24H' | 'EXPRESS_48H' | 'SAME_DAY';
  notes?: string;
}

export async function createShipment(payload: CreateShipmentPayload, merchantName = 'متجر الأناقة', merchantId = 3): Promise<ShipmentDTO> {
  if (isMockMode()) {
    await simulateDelay(350);
    const list = getStoredShipments();
    const newId = 9900 + list.length + 1;
    const trackingNumber = `TW-${newId}`;
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newShipment: ShipmentDTO = {
      id: newId,
      trackingNumber,
      senderMerchant: merchantName,
      merchantId,
      recipientName: payload.recipientName,
      recipientPhone: payload.recipientPhone,
      destinationAddress: payload.destinationAddress,
      destinationZone: payload.destinationZone,
      packageWeightKg: payload.packageWeightKg,
      codAmountEgp: payload.codAmountEgp,
      status: 'CREATED',
      serviceType: payload.serviceType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: 1,
          status: 'CREATED',
          statusLabelAr: 'تم إنشاء الشحنة بنجاح',
          timestamp: `اليوم ${nowTime}`,
          location: payload.destinationZone,
          actorName: merchantName,
          notes: payload.notes
        }
      ]
    };

    list.unshift(newShipment);
    saveStoredShipments(list);
    return newShipment;
  }

  return apiClient<ShipmentDTO>('/shipments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateShipmentStatus(
  id: number,
  status: ShipmentStatus,
  location: string,
  actorName: string,
  notes?: string
): Promise<ShipmentDTO> {
  if (isMockMode()) {
    await simulateDelay(200);
    const list = getStoredShipments();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw { status: 404, message: 'الشحنة غير موجودة' };

    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const shipment = { ...list[idx] };
    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();

    const statusLabels: Record<ShipmentStatus, string> = {
      CREATED: 'تم الإنشاء',
      ASSIGNED_TO_WAREHOUSE: 'تم التحويل للمستودع',
      RECEIVED_AT_WAREHOUSE: 'تم الاستلام في المستودع',
      SORTED: 'تم الفرز وتحديد الصينية',
      ASSIGNED_TO_COURIER: 'تم التعيين للمندوب',
      OUT_FOR_DELIVERY: 'في الطريق للتسليم',
      DELIVERED: 'تم التسليم بنجاح',
      DELIVERY_FAILED: 'محاولة تسليم فاشلة',
      RETURN_REQUESTED: 'تم طلب الإرجاع',
      RETURNED_TO_WAREHOUSE: 'أعيدت للمستودع',
      CANCELLED: 'تم الإلغاء'
    };

    shipment.timeline.push({
      id: shipment.timeline.length + 1,
      status,
      statusLabelAr: statusLabels[status] || status,
      timestamp: `اليوم ${nowTime}`,
      location,
      actorName,
      notes
    });

    list[idx] = shipment;
    saveStoredShipments(list);
    return shipment;
  }

  return apiClient<ShipmentDTO>(`/shipments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, location, notes })
  });
}
