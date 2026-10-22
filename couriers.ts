import { apiClient, isMockMode, simulateDelay } from './client';
import { DeliveryStop, ProofOfDeliveryRequest, FailedAttemptRequest, CourierProfile } from '../types';
import { COURIER_STOPS, INITIAL_COURIERS } from './mockData';
import { updateShipmentStatus } from './shipments';

const STOPS_STORAGE_KEY = 'twsela_courier_stops';

function getStoredStops(): DeliveryStop[] {
  const stored = localStorage.getItem(STOPS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  localStorage.setItem(STOPS_STORAGE_KEY, JSON.stringify(COURIER_STOPS));
  return [...COURIER_STOPS];
}

function saveStoredStops(stops: DeliveryStop[]): void {
  localStorage.setItem(STOPS_STORAGE_KEY, JSON.stringify(stops));
}

export async function fetchCourierRoute(courierId = 4): Promise<DeliveryStop[]> {
  if (isMockMode()) {
    await simulateDelay(200);
    return getStoredStops();
  }
  return apiClient<DeliveryStop[]>(`/routes/${courierId}`);
}

export async function submitProofOfDelivery(req: ProofOfDeliveryRequest, courierName = 'خالد منصور'): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await simulateDelay(350);
    const stops = getStoredStops();
    const currentStopIdx = stops.findIndex(s => s.shipment.id === req.shipmentId);

    if (currentStopIdx !== -1) {
      stops[currentStopIdx].isCompleted = true;
      stops[currentStopIdx].isCurrent = false;
      stops[currentStopIdx].shipment.status = 'DELIVERED';

      // Move next stop to current
      const nextStop = stops.find(s => !s.isCompleted);
      if (nextStop) {
        nextStop.isCurrent = true;
      }
      saveStoredStops(stops);
    }

    // Update global shipment registry
    await updateShipmentStatus(
      req.shipmentId,
      'DELIVERED',
      'عنوان المستلم',
      courierName,
      `تم التحصيل: ${req.codCollectedEgp} EGP | نوع الإثبات: ${req.podType}${req.recipientNotes ? ' | ' + req.recipientNotes : ''}`
    );

    return { success: true, message: 'تم تسجيل التسليم بنجاح وإثبات التسليم (PoD)' };
  }

  return apiClient('/delivery/' + req.shipmentId + '/proof', {
    method: 'POST',
    body: JSON.stringify(req)
  });
}

export async function reportFailedAttempt(req: FailedAttemptRequest, courierName = 'خالد منصور'): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await simulateDelay(300);
    const stops = getStoredStops();
    const currentStopIdx = stops.findIndex(s => s.shipment.id === req.shipmentId);

    if (currentStopIdx !== -1) {
      stops[currentStopIdx].isCurrent = false;
      stops[currentStopIdx].shipment.status = 'DELIVERY_FAILED';

      const nextStop = stops.find(s => !s.isCompleted && s.shipment.id !== req.shipmentId);
      if (nextStop) {
        nextStop.isCurrent = true;
      }
      saveStoredStops(stops);
    }

    await updateShipmentStatus(
      req.shipmentId,
      'DELIVERY_FAILED',
      'موقع التسليم',
      courierName,
      `محاولة فاشلة: ${req.reasonLabelAr} | ملاحظات: ${req.notes}`
    );

    return { success: true, message: 'تم تسجيل المحاولة الفاشلة وتحديث حالة الشحنة' };
  }

  return apiClient('/delivery/' + req.shipmentId + '/attempt', {
    method: 'POST',
    body: JSON.stringify(req)
  });
}

export async function handoverCodToCashier(amount: number, cashierName: string): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await simulateDelay(250);
    return {
      success: true,
      message: `تم تسليم مبلغ ${amount} EGP للمحاسب (${cashierName}) وتسوية العهدة بنجاح`
    };
  }

  return apiClient('/financial/settlements/cashier-handover', {
    method: 'POST',
    body: JSON.stringify({ amount, cashierName })
  });
}

export async function fetchCouriersList(): Promise<CourierProfile[]> {
  if (isMockMode()) {
    await simulateDelay(150);
    return INITIAL_COURIERS;
  }
  return apiClient<CourierProfile[]>('/couriers');
}
