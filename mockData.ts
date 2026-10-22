// TWSELA (توصيلة) Mock Data & Fixtures
import { User, ShipmentDTO, DeliveryStop, WarehouseBin, Manifest, WalletSummary, Tenant, CourierProfile, SystemServiceStatus, AuditLogItem } from '../types';

export const DEMO_USERS: Record<string, User> = {
  OWNER: {
    id: 1,
    name: 'أحمد العمري',
    phone: '01000000001',
    role: 'OWNER',
    tenantId: 'twsela-platform',
    avatarInitials: 'AO',
    avatarColor: '#07213d',
    email: 'owner@twsela.com'
  },
  ADMIN: {
    id: 2,
    name: 'عمر الشريف',
    phone: '01000000002',
    role: 'ADMIN',
    tenantId: 'twsela-main',
    avatarInitials: 'OS',
    avatarColor: '#1358a5',
    email: 'admin@twsela.com'
  },
  MERCHANT: {
    id: 3,
    name: 'سارة طارق',
    phone: '01000000003',
    role: 'MERCHANT',
    tenantId: 'elegance-store',
    avatarInitials: 'ST',
    avatarColor: '#00a376',
    email: 'merchant@elegancestore.com'
  },
  COURIER: {
    id: 4,
    name: 'خالد منصور',
    phone: '01001234567',
    role: 'COURIER',
    tenantId: 'twsela-main',
    avatarInitials: 'KM',
    avatarColor: '#1a70d8',
    vehiclePlate: 'أ ب ج 1234',
    zone: 'المعادي',
    email: 'khaled.courier@twsela.com'
  },
  WAREHOUSE: {
    id: 5,
    name: 'أحمد الطيب',
    phone: '01000000005',
    role: 'WAREHOUSE',
    tenantId: 'twsela-main',
    avatarInitials: 'AT',
    avatarColor: '#7c3aed',
    warehouseId: 1,
    email: 'warehouse.hub01@twsela.com'
  }
};

export const INITIAL_SHIPMENTS: ShipmentDTO[] = [
  {
    id: 9901,
    trackingNumber: 'TW-9901',
    senderMerchant: 'متجر الأناقة',
    merchantId: 3,
    recipientName: 'محمد رضا',
    recipientPhone: '01012345678',
    destinationAddress: 'شارع النصر، عمارة 14، المعادي',
    destinationZone: 'المعادي',
    packageWeightKg: 1.2,
    codAmountEgp: 350,
    status: 'DELIVERED',
    serviceType: 'STANDARD_24H',
    courierId: 4,
    courierName: 'خالد منصور',
    warehouseId: 1,
    binLocation: 'A3',
    createdAt: '2025-05-18T08:15:00Z',
    updatedAt: '2025-05-18T10:34:00Z',
    timeline: [
      { id: 1, status: 'CREATED', statusLabelAr: 'تم إنشاء الشحنة', timestamp: '08:15', location: 'متجر الأناقة', actorName: 'سارة طارق' },
      { id: 2, status: 'RECEIVED_AT_WAREHOUSE', statusLabelAr: 'استلام في المستودع', timestamp: '09:00', location: 'Hub 01 القاهرة', actorName: 'أحمد الطيب' },
      { id: 3, status: 'OUT_FOR_DELIVERY', statusLabelAr: 'في الطريق للتسليم', timestamp: '09:30', location: 'المعادي', actorName: 'خالد منصور' },
      { id: 4, status: 'DELIVERED', statusLabelAr: 'تم التسليم بنجاح', timestamp: '10:34', location: 'شارع النصر، المعادي', actorName: 'خالد منصور', notes: 'تم تحصيل 350 EGP والتوقيع رقمياً' }
    ]
  },
  {
    id: 9902,
    trackingNumber: 'TW-9902',
    senderMerchant: 'تك ستور',
    merchantId: 4,
    recipientName: 'سارة خليل',
    recipientPhone: '01001234567',
    destinationAddress: 'شارع عبد الحميد بدوي، عمارة 12، مصر الجديدة',
    destinationZone: 'مصر الجديدة',
    packageWeightKg: 0.8,
    codAmountEgp: 250,
    status: 'OUT_FOR_DELIVERY',
    serviceType: 'EXPRESS_48H',
    courierId: 4,
    courierName: 'خالد منصور',
    warehouseId: 1,
    binLocation: 'A4',
    createdAt: '2025-05-18T08:30:00Z',
    updatedAt: '2025-05-18T09:40:00Z',
    timeline: [
      { id: 1, status: 'CREATED', statusLabelAr: 'تم إنشاء الشحنة', timestamp: '08:30', location: 'تك ستور', actorName: 'إدارة المتجر' },
      { id: 2, status: 'RECEIVED_AT_WAREHOUSE', statusLabelAr: 'استلام في المستودع', timestamp: '09:10', location: 'Hub 01 القاهرة', actorName: 'أحمد الطيب' },
      { id: 3, status: 'OUT_FOR_DELIVERY', statusLabelAr: 'في الطريق للتسليم', timestamp: '09:40', location: 'مصر الجديدة', actorName: 'خالد منصور', notes: 'الوقفة الحالية للمندوب' }
    ]
  },
  {
    id: 9903,
    trackingNumber: 'TW-9903',
    senderMerchant: 'بوتيك ريم',
    merchantId: 5,
    recipientName: 'علي حسن',
    recipientPhone: '01234567890',
    destinationAddress: 'شارع فيصل، محطة المساحة، الجيزة',
    destinationZone: 'الجيزة',
    packageWeightKg: 2.1,
    codAmountEgp: 420,
    status: 'SORTED',
    serviceType: 'STANDARD_24H',
    warehouseId: 1,
    binLocation: 'B5',
    createdAt: '2025-05-17T18:30:00Z',
    updatedAt: '2025-05-18T08:45:00Z',
    timeline: [
      { id: 1, status: 'CREATED', statusLabelAr: 'تم إنشاء الشحنة', timestamp: 'أمس 18:30', location: 'بوتيك ريم', actorName: 'ريم أحمد' },
      { id: 2, status: 'RECEIVED_AT_WAREHOUSE', statusLabelAr: 'استلام في المستودع', timestamp: '08:45', location: 'Hub 01 القاهرة', actorName: 'أحمد الطيب' },
      { id: 3, status: 'SORTED', statusLabelAr: 'تم الفرز وتحديد الصينية', timestamp: '09:00', location: 'صينية B5', actorName: 'أحمد الطيب' }
    ]
  },
  {
    id: 9904,
    trackingNumber: 'TW-9904',
    senderMerchant: 'فريش ماركت',
    merchantId: 6,
    recipientName: 'نورا أحمد',
    recipientPhone: '01112345600',
    destinationAddress: 'شارع المشاية السفلية، المنصورة، الدقهلية',
    destinationZone: 'الدقهلية',
    packageWeightKg: 3.5,
    codAmountEgp: 0,
    status: 'RETURNED_TO_WAREHOUSE',
    serviceType: 'STANDARD_24H',
    courierId: 7,
    courierName: 'هاني سعيد',
    warehouseId: 1,
    createdAt: '2025-05-17T14:00:00Z',
    updatedAt: '2025-05-18T09:15:00Z',
    timeline: [
      { id: 1, status: 'CREATED', statusLabelAr: 'تم الإنشاء', timestamp: 'أمس 14:00', location: 'فريش ماركت', actorName: 'محمود فهمي' },
      { id: 2, status: 'DELIVERY_FAILED', statusLabelAr: 'فشل التسليم — العميل رفض الاستلام', timestamp: 'أمس 19:00', location: 'المنصورة', actorName: 'هاني سعيد' },
      { id: 3, status: 'RETURNED_TO_WAREHOUSE', statusLabelAr: 'أعيدت للمستودع', timestamp: '09:15', location: 'Hub 01 القاهرة', actorName: 'أحمد الطيب' }
    ]
  },
  {
    id: 9905,
    trackingNumber: 'TW-9905',
    senderMerchant: 'متجر الأناقة',
    merchantId: 3,
    recipientName: 'تامر سمير',
    recipientPhone: '01098765432',
    destinationAddress: 'ش الشهيد أحمد شوقي، الزقازيق، الشرقية',
    destinationZone: 'الشرقية',
    packageWeightKg: 1.9,
    codAmountEgp: 650,
    status: 'OUT_FOR_DELIVERY',
    serviceType: 'STANDARD_24H',
    courierId: 8,
    courierName: 'يوسف إبراهيم',
    warehouseId: 1,
    createdAt: '2025-05-18T07:20:00Z',
    updatedAt: '2025-05-18T09:40:00Z',
    timeline: [
      { id: 1, status: 'CREATED', statusLabelAr: 'تم الإنشاء', timestamp: '07:20', location: 'متجر الأناقة', actorName: 'سارة طارق' },
      { id: 2, status: 'OUT_FOR_DELIVERY', statusLabelAr: 'في الطريق مع المندوب', timestamp: '09:40', location: 'الشرقية', actorName: 'يوسف إبراهيم' }
    ]
  },
  {
    id: 9906,
    trackingNumber: 'TW-9906',
    senderMerchant: 'Digital Hub',
    merchantId: 7,
    recipientName: 'هناء فوزي',
    recipientPhone: '01512345678',
    destinationAddress: 'ش عبد السلام عارف، بني سويف',
    destinationZone: 'بني سويف',
    packageWeightKg: 0.6,
    codAmountEgp: 290,
    status: 'DELIVERED',
    serviceType: 'STANDARD_24H',
    courierId: 4,
    courierName: 'خالد منصور',
    warehouseId: 1,
    binLocation: 'C2',
    createdAt: '2025-05-18T08:00:00Z',
    updatedAt: '2025-05-18T10:18:00Z',
    timeline: [
      { id: 1, status: 'CREATED', statusLabelAr: 'تم الإنشاء', timestamp: '08:00', location: 'Digital Hub', actorName: 'عصام كمال' },
      { id: 2, status: 'DELIVERED', statusLabelAr: 'تم التسليم بنجاح', timestamp: '10:18', location: 'بني سويف', actorName: 'خالد منصور' }
    ]
  }
];

export const COURIER_STOPS: DeliveryStop[] = [
  {
    stopNumber: 1,
    shipment: INITIAL_SHIPMENTS[0],
    isCompleted: true,
    isCurrent: false,
    eta: '10:34',
    distanceKm: 4.2
  },
  {
    stopNumber: 2,
    shipment: INITIAL_SHIPMENTS[1],
    isCompleted: false,
    isCurrent: true,
    eta: 'الآن (11:45)',
    distanceKm: 8.5
  },
  {
    stopNumber: 3,
    shipment: {
      ...INITIAL_SHIPMENTS[2],
      id: 9907,
      trackingNumber: 'TW-9907',
      recipientName: 'أيمن جلال',
      destinationAddress: 'ش الهرم الرئيسي، بجوار كايرو مول',
      codAmountEgp: 180,
      status: 'ASSIGNED_TO_COURIER'
    },
    isCompleted: false,
    isCurrent: false,
    eta: '12:30',
    distanceKm: 12.0
  },
  {
    stopNumber: 4,
    shipment: {
      ...INITIAL_SHIPMENTS[0],
      id: 9908,
      trackingNumber: 'TW-9908',
      recipientName: 'مروة عبد المنعم',
      destinationAddress: 'ميدان التحرير، وسط البلد، القاهرة',
      codAmountEgp: 390,
      status: 'ASSIGNED_TO_COURIER'
    },
    isCompleted: false,
    isCurrent: false,
    eta: '13:15',
    distanceKm: 7.1
  },
  {
    stopNumber: 5,
    shipment: {
      ...INITIAL_SHIPMENTS[1],
      id: 9909,
      trackingNumber: 'TW-9909',
      recipientName: 'كريم سامح',
      destinationAddress: 'ش عباس العقاد، مدينة نصر',
      codAmountEgp: 520,
      status: 'ASSIGNED_TO_COURIER'
    },
    isCompleted: false,
    isCurrent: false,
    eta: '14:00',
    distanceKm: 11.4
  }
];

export const INITIAL_BINS: WarehouseBin[] = (() => {
  const aisles = ['A', 'B', 'C', 'D', 'E', 'F'];
  const bins: WarehouseBin[] = [];
  aisles.forEach(aisle => {
    for (let i = 1; i <= 10; i++) {
      const key = `${aisle}${i}`;
      let status: 'free' | 'used' | 'held' | 'broken' = 'free';
      let occupiedShipmentId: string | undefined = undefined;
      let merchantName: string | undefined = undefined;
      let weightKg: number | undefined = undefined;

      if (key === 'A3') { status = 'used'; occupiedShipmentId = 'TW-9901'; merchantName = 'متجر الأناقة'; weightKg = 1.2; }
      else if (key === 'A4') { status = 'free'; }
      else if (key === 'B5') { status = 'used'; occupiedShipmentId = 'TW-9903'; merchantName = 'بوتيك ريم'; weightKg = 2.1; }
      else if (key === 'C2') { status = 'used'; occupiedShipmentId = 'TW-9906'; merchantName = 'متجر الأناقة'; weightKg = 0.6; }
      else if (key === 'D1') { status = 'broken'; }
      else if (key === 'D4') { status = 'held'; occupiedShipmentId = 'TW-7690'; merchantName = 'تك ستور'; }
      else if (Math.random() < 0.3) {
        status = 'used';
        occupiedShipmentId = `TW-77${Math.floor(10 + Math.random() * 80)}`;
        merchantName = 'تاجر معتمد';
        weightKg = Number((0.5 + Math.random() * 3).toFixed(1));
      }
      bins.push({ key, aisle, binNumber: i, status, occupiedShipmentId, merchantName, weightKg });
    }
  });
  return bins;
})();

export const INITIAL_MANIFESTS: Manifest[] = [
  {
    id: 'MF-001',
    manifestNumber: 'MF-2025-0518-001',
    vehiclePlate: 'VAN-01 (دايو ماتيز)',
    courierId: 4,
    courierName: 'خالد منصور',
    totalShipments: 15,
    loadedShipments: 15,
    totalCodEgp: 2840,
    status: 'DISPATCHED',
    shipmentIds: [9901, 9902, 9906],
    createdAt: '2025-05-18T08:00:00Z'
  },
  {
    id: 'MF-002',
    manifestNumber: 'MF-2025-0518-002',
    vehiclePlate: 'VAN-02 (هيونداي H1)',
    courierId: 8,
    courierName: 'يوسف إبراهيم',
    totalShipments: 12,
    loadedShipments: 12,
    totalCodEgp: 3150,
    status: 'DISPATCHED',
    shipmentIds: [9905],
    createdAt: '2025-05-18T08:30:00Z'
  },
  {
    id: 'MF-003',
    manifestNumber: 'MF-2025-0518-003',
    vehiclePlate: 'VAN-03 (كيا بيكانتو)',
    courierId: 7,
    courierName: 'هاني سعيد',
    totalShipments: 23,
    loadedShipments: 9,
    totalCodEgp: 4620,
    status: 'LOADING',
    shipmentIds: [9903, 9904],
    createdAt: '2025-05-18T09:15:00Z'
  }
];

export const INITIAL_WALLET: WalletSummary = {
  currentBalanceEgp: 12400,
  pendingCodEgp: 3850,
  todayCollectedCodEgp: 350,
  lifetimeEarningsEgp: 84320,
  transactions: [
    {
      id: 1,
      type: 'CREDIT_COD',
      typeLabelAr: 'تحصيل دفع عند الاستلام',
      amountEgp: 350,
      description: 'تسليم ناجح للشحنة TW-9901 — محمد رضا',
      status: 'COMPLETED',
      timestamp: 'اليوم 10:34',
      referenceCode: 'TX-8821'
    },
    {
      id: 2,
      type: 'DEBIT_PAYOUT',
      typeLabelAr: 'طلب سحب بنكي',
      amountEgp: -5000,
      description: 'تحويل إلى بنك مصر ···4521',
      status: 'PENDING',
      timestamp: 'اليوم 09:55',
      referenceCode: 'WD-4412'
    },
    {
      id: 3,
      type: 'CREDIT_COD',
      typeLabelAr: 'تحصيل دفع عند الاستلام',
      amountEgp: 290,
      description: 'تسليم الشحنة TW-9906 — هناء فوزي',
      status: 'COMPLETED',
      timestamp: 'اليوم 10:18',
      referenceCode: 'TX-8819'
    },
    {
      id: 4,
      type: 'COMMISSION_FEE',
      typeLabelAr: 'عمولة توصيل المنصة',
      amountEgp: -35,
      description: 'عمولة الشحن للشحنة TW-9901',
      status: 'COMPLETED',
      timestamp: 'اليوم 10:35',
      referenceCode: 'CM-1029'
    }
  ]
};

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 1,
    slug: 'elegance-store',
    companyName: 'Elegance Fashion Store',
    companyNameAr: 'متجر الأناقة',
    planTier: 'ENTERPRISE',
    activeShipmentsMonth: 248,
    quotaShipmentsMonth: 500,
    activeUsers: 8,
    status: 'ACTIVE',
    joinedAt: '2024-01-15'
  },
  {
    id: 2,
    slug: 'tech-store',
    companyName: 'Tech Store Egypt',
    companyNameAr: 'تك ستور',
    planTier: 'PRO',
    activeShipmentsMonth: 134,
    quotaShipmentsMonth: 250,
    activeUsers: 4,
    status: 'ACTIVE',
    joinedAt: '2024-03-20'
  },
  {
    id: 3,
    slug: 'reem-boutique',
    companyName: 'Reem Boutique',
    companyNameAr: 'بوتيك ريم',
    planTier: 'BASIC',
    activeShipmentsMonth: 67,
    quotaShipmentsMonth: 100,
    activeUsers: 2,
    status: 'ACTIVE',
    joinedAt: '2024-06-10'
  },
  {
    id: 4,
    slug: 'fresh-market',
    companyName: 'Fresh Market',
    companyNameAr: 'فريش ماركت',
    planTier: 'BASIC',
    activeShipmentsMonth: 43,
    quotaShipmentsMonth: 100,
    activeUsers: 3,
    status: 'ACTIVE',
    joinedAt: '2024-08-01'
  },
  {
    id: 5,
    slug: 'elite-store',
    companyName: 'Elite Store Luxury',
    companyNameAr: 'إيليت ستور',
    planTier: 'PRO',
    activeShipmentsMonth: 0,
    quotaShipmentsMonth: 250,
    activeUsers: 1,
    status: 'PENDING',
    joinedAt: '2025-05-18'
  }
];

export const INITIAL_COURIERS: CourierProfile[] = [
  {
    id: 4,
    name: 'خالد منصور',
    phone: '01001234567',
    zone: 'المعادي',
    vehicleType: 'دايو ماتيز',
    vehiclePlate: 'أ ب ج 1234',
    status: 'ACTIVE',
    todayDeliveries: 38,
    todayCodCollectedEgp: 4200,
    averageRating: 4.9,
    totalRatingsCount: 38,
    successRatePercent: 98.2
  },
  {
    id: 8,
    name: 'يوسف إبراهيم',
    phone: '01123456789',
    zone: 'الجيزة',
    vehicleType: 'هيونداي H1',
    vehiclePlate: 'س ص ع 5678',
    status: 'ACTIVE',
    todayDeliveries: 31,
    todayCodCollectedEgp: 3150,
    averageRating: 4.7,
    totalRatingsCount: 29,
    successRatePercent: 96.5
  },
  {
    id: 7,
    name: 'هاني سعيد',
    phone: '01234567891',
    zone: 'الهرم',
    vehicleType: 'كيا بيكانتو',
    vehiclePlate: 'د ر ز 9012',
    status: 'BREAK',
    todayDeliveries: 27,
    todayCodCollectedEgp: 2800,
    averageRating: 4.5,
    totalRatingsCount: 22,
    successRatePercent: 94.0
  },
  {
    id: 9,
    name: 'رامي فوزي',
    phone: '01512345678',
    zone: 'مدينة نصر',
    vehicleType: 'تويوتا كورولا',
    vehiclePlate: 'ق ف ك 3456',
    status: 'OFFLINE',
    todayDeliveries: 0,
    todayCodCollectedEgp: 0,
    averageRating: 4.8,
    totalRatingsCount: 45,
    successRatePercent: 97.8
  }
];

export const SYSTEM_SERVICES: SystemServiceStatus[] = [
  { name: 'Spring Boot REST API (v3.3.3)', type: 'SPRING_API', status: 'UP', latencyMs: 24, details: 'JDK 17 LTS / Tomcat 10.1' },
  { name: 'PostgreSQL Primary Database', type: 'POSTGRES', status: 'UP', latencyMs: 12, details: '176 tables / 3NF Normalization' },
  { name: 'Redis Cache & Session Store', type: 'REDIS', status: 'UP', latencyMs: 2, details: 'Cache Hit Rate 94.2%' },
  { name: 'Nginx Reverse Proxy & SSL', type: 'NGINX', status: 'UP', latencyMs: 4, details: 'TLS 1.3 / HTTP/2' },
  { name: 'Twilio SMS & OTP Service', type: 'SMS_TWILIO', status: 'UP', latencyMs: 140, details: 'Gateway Operational' },
  { name: 'Payment Gateways (Paymob/Stripe)', type: 'PAYMENT_STRIPE', status: 'UP', latencyMs: 210, details: 'Live Webhooks Active' }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 1, time: '10:34', action: 'تسليم الشحنة TW-9901 وتأكيد PoD', actor: 'خالد منصور', role: 'COURIER', ipAddress: '197.35.42.12', status: 'SUCCESS' },
  { id: 2, time: '10:18', action: 'تسليم الشحنة TW-9906 بنجاح', actor: 'خالد منصور', role: 'COURIER', ipAddress: '197.35.42.12', status: 'SUCCESS' },
  { id: 3, time: '09:55', action: 'طلب سحب رصيد 5,000 EGP', actor: 'سارة طارق', role: 'MERCHANT', ipAddress: '156.204.18.9', status: 'SUCCESS' },
  { id: 4, time: '09:40', action: 'تسجيل محاولة تسليم فاشلة TW-9890', actor: 'هاني سعيد', role: 'COURIER', ipAddress: '197.35.42.18', status: 'WARNING' },
  { id: 5, time: '09:12', action: 'تسجيل دخول لوحة التحكم (Admin Login)', actor: 'عمر الشريف', role: 'ADMIN', ipAddress: '41.234.90.15', status: 'SUCCESS' },
  { id: 6, time: '08:50', action: 'بدء وردية السائقين وتوزيع المسارات', actor: 'عمر الشريف', role: 'ADMIN', ipAddress: '41.234.90.15', status: 'SUCCESS' }
];
