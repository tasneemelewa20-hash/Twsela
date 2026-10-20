// TWSELA (توصيلة) TypeScript Domain Definitions & DTOs

export type UserRole = 'OWNER' | 'ADMIN' | 'MERCHANT' | 'COURIER' | 'WAREHOUSE';

export interface User {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  tenantId: string;
  avatarInitials: string;
  avatarColor?: string;
  vehiclePlate?: string;
  zone?: string;
  warehouseId?: number;
  email?: string;
}

export type ShipmentStatus =
  | 'CREATED'                // تم الإنشاء
  | 'ASSIGNED_TO_WAREHOUSE' // محول للمستودع
  | 'RECEIVED_AT_WAREHOUSE' // تم الاستلام في المستودع
  | 'SORTED'                // تم الفرز والتخصيص
  | 'ASSIGNED_TO_COURIER'   // مسند لمندوب
  | 'OUT_FOR_DELIVERY'      // في الطريق للتسليم
  | 'DELIVERED'             // تم التسليم بنجاح
  | 'DELIVERY_FAILED'       // محاولة تسليم فاشلة
  | 'RETURN_REQUESTED'      // طلب استرجاع
  | 'RETURNED_TO_WAREHOUSE' // مرتجع للمستودع
  | 'CANCELLED';            // ملغي

export interface ShipmentEvent {
  id: number;
  status: ShipmentStatus;
  statusLabelAr: string;
  timestamp: string;
  location: string;
  actorName: string;
  notes?: string;
}

export interface ShipmentDTO {
  id: number;
  trackingNumber: string;
  senderMerchant: string;
  merchantId: number;
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;
  destinationZone: string;
  packageWeightKg: number;
  codAmountEgp: number;
  status: ShipmentStatus;
  serviceType: 'STANDARD_24H' | 'EXPRESS_48H' | 'SAME_DAY';
  courierId?: number;
  courierName?: string;
  warehouseId?: number;
  binLocation?: string;
  createdAt: string;
  updatedAt: string;
  timeline: ShipmentEvent[];
}

export interface DeliveryStop {
  stopNumber: number;
  shipment: ShipmentDTO;
  isCompleted: boolean;
  isCurrent: boolean;
  eta: string;
  distanceKm: number;
}

export interface ProofOfDeliveryRequest {
  shipmentId: number;
  podType: 'SIGNATURE' | 'PHOTO' | 'OTP';
  signatureData?: string; // Base64 data from signature canvas
  photoUrl?: string;
  otpCode?: string;
  codCollectedEgp: number;
  recipientNotes?: string;
}

export interface FailedAttemptRequest {
  shipmentId: number;
  reason: 'CUSTOMER_UNAVAILABLE' | 'NO_ANSWER' | 'REFUSED_COD' | 'WRONG_ADDRESS' | 'POSTPONED_BY_CUSTOMER' | 'OTHER';
  reasonLabelAr: string;
  notes: string;
  rescheduleDate?: string;
}

export interface WarehouseBin {
  key: string; // e.g. A1, A2, ..., F10
  aisle: string;
  binNumber: number;
  status: 'free' | 'used' | 'held' | 'broken';
  occupiedShipmentId?: string;
  merchantName?: string;
  weightKg?: number;
}

export interface Manifest {
  id: string;
  manifestNumber: string;
  vehiclePlate: string;
  courierId: number;
  courierName: string;
  totalShipments: number;
  loadedShipments: number;
  totalCodEgp: number;
  status: 'DRAFT' | 'LOADING' | 'DISPATCHED' | 'COMPLETED';
  shipmentIds: number[];
  createdAt: string;
}

export interface WalletTransaction {
  id: number;
  type: 'CREDIT_COD' | 'DEBIT_PAYOUT' | 'COMMISSION_FEE' | 'BONUS';
  typeLabelAr: string;
  amountEgp: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  timestamp: string;
  referenceCode: string;
}

export interface WalletSummary {
  currentBalanceEgp: number;
  pendingCodEgp: number;
  todayCollectedCodEgp: number;
  lifetimeEarningsEgp: number;
  transactions: WalletTransaction[];
}

export interface Tenant {
  id: number;
  slug: string;
  companyName: string;
  companyNameAr: string;
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  activeShipmentsMonth: number;
  quotaShipmentsMonth: number;
  activeUsers: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  joinedAt: string;
}

export interface CourierProfile {
  id: number;
  name: string;
  phone: string;
  zone: string;
  vehicleType: string;
  vehiclePlate: string;
  status: 'ACTIVE' | 'BREAK' | 'OFFLINE';
  todayDeliveries: number;
  todayCodCollectedEgp: number;
  averageRating: number;
  totalRatingsCount: number;
  successRatePercent: number;
}

export interface SystemServiceStatus {
  name: string;
  type: 'SPRING_API' | 'POSTGRES' | 'REDIS' | 'NGINX' | 'SMS_TWILIO' | 'PAYMENT_STRIPE';
  status: 'UP' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  details: string;
}

export interface AuditLogItem {
  id: number;
  time: string;
  action: string;
  actor: string;
  role: UserRole;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
}
