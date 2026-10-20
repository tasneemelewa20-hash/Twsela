import { apiClient, isMockMode, simulateDelay } from './client';
import { ShipmentDTO } from '../types';
import { fetchShipments } from './shipments';

export async function trackPublicShipment(trackingNumber: string): Promise<ShipmentDTO> {
  const cleanCode = trackingNumber.trim().toUpperCase();

  if (isMockMode()) {
    await simulateDelay(220);
    const shipments = await fetchShipments();
    const found = shipments.find(s => s.trackingNumber.toUpperCase() === cleanCode);
    if (!found) {
      throw { status: 404, message: `لم يتم العثور على أي شحنة برقم التتبع: ${cleanCode}` };
    }
    return found;
  }

  return apiClient<ShipmentDTO>(`/public/tracking/${cleanCode}`);
}
