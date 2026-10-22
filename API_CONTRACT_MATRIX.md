# TWSELA (توصيلة) — Verified API Contract Inventory & Matrix

This document provides the definitive API contract inventory for TWSELA Courier Management Platform, compiled from the graduation project specification (\Twsela documentation final version(4).docx\), system reports, and reference prototypes.

## Status Legend
- **IMPLEMENTED (Verified in backend source)**: Active backend code confirmed.
- **DOCUMENTED ONLY (Specified in project documentation)**: Specified in project architecture doc with controllers, paths, methods, DTOs, and error codes; backend source repo to be supplied by backend team.
- **MISSING**: Required by frontend operational workflows but awaiting backend implementation.
- **MOCK IMPLEMENTED**: Fully simulated in frontend \src/api/mockData.ts\ and \src/api/*\ with realistic fixtures for offline/demo operation.

---

## 1. Authentication & Security (\AuthController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Login** | Public | POST | \/api/auth/login\ | None | \LoginRequest { username/phone, password }\ | \AuthResponse { token, refreshToken, user: { id, name, role, tenantId, phone } }\ | N/A | 400 Bad Request, 401 Bad Credentials, 403 Disabled | \AuthController.login\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Logout** | All | POST | \/api/auth/logout\ | Bearer JWT | None | \MessageResponse { message: 'Logged out successfully' }\ | N/A | 401 Unauthorized | \AuthController.logout\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Refresh Token** | All | POST | \/api/auth/refresh\ | Refresh Token | \RefreshTokenRequest { refreshToken }\ | \TokenRefreshResponse { token, refreshToken }\ | N/A | 401 Invalid Refresh Token | \AuthController.refresh\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Change Password** | All | POST | \/api/auth/change-password\ | Bearer JWT | \ChangePasswordRequest { currentPassword, newPassword }\ | \MessageResponse { message }\ | N/A | 400 Validation, 401 Unauthorized | \AuthController.changePassword\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 2. Shipment Management (\ShipmentController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **List Shipments** | Owner, Admin, Merchant | GET | \/api/shipments\ | Bearer JWT, X-Tenant-ID | Query Params: \page, size, status, search, merchantId, zoneId, dateFrom, dateTo\ | \Page<ShipmentDTO> { content: ShipmentDTO[], totalElements, totalPages, number, size }\ | \page=0, size=10, sort=createdAt,desc\ | 401, 403 Forbidden | \ShipmentController.getShipments\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Create Shipment** | Merchant, Admin | POST | \/api/shipments\ | Bearer JWT, X-Tenant-ID | \CreateShipmentRequest { recipientName, recipientPhone, destinationAddress, zoneId, codAmount, packageWeight, serviceType, notes }\ | \ShipmentDTO { id, trackingNumber, status, codAmount, barcodeUrl, labelUrl, createdAt }\ | N/A | 400 Validation, 402 Quota Exceeded, 403 Forbidden | \ShipmentController.createShipment\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Get Shipment By ID** | Owner, Admin, Merchant, Courier | GET | \/api/shipments/{id}\ | Bearer JWT | Path: \id\ | \ShipmentDetailDTO { ...ShipmentDTO, timeline: ShipmentEvent[], courier, merchant, recipient }\ | N/A | 404 Shipment Not Found | \ShipmentController.getShipmentById\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Bulk Shipment Upload** | Merchant, Admin | POST | \/api/shipments/bulk\ | Bearer JWT | Multipart/Form-Data (\ile: .xlsx/.csv\) | \BulkUploadResponse { totalRows, importedCount, failedCount, errors: [] }\ | N/A | 400 Invalid CSV/XLSX schema | \ShipmentController.bulkUpload\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Download Bulk Template** | Merchant, Admin | GET | \/api/shipments/bulk/template\ | Bearer JWT | None | Excel File Stream (\	wsela_bulk_template.xlsx\) | N/A | 500 Stream Error | \ShipmentController.getTemplate\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Get Barcode SVG/PNG** | All | GET | \/api/shipments/{id}/barcode\ | Bearer JWT | Path: \id\ | Image stream (image/png or svg) | N/A | 404 Not Found | \ShipmentController.getBarcode\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Generate Shipping Label** | Admin, Merchant, Courier | GET | \/api/shipments/{id}/label\ | Bearer JWT | Path: \id\ | PDF Stream (application/pdf, Arabic iText7) | N/A | 404 Not Found | \ShipmentController.getLabelPdf\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Request Return** | Merchant, Admin | POST | \/api/shipments/{id}/return-request\ | Bearer JWT | \ReturnRequestDTO { reason, returnWarehouseId }\ | \ShipmentDTO (status: RETURN_REQUESTED)\ | N/A | 400 Bad Status, 404 | \ShipmentController.requestReturn\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 3. Warehouse Operations (\ShipmentController\ / \PlatformOpsController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Warehouse Intake / Receive** | Warehouse, Admin | POST | \/api/shipments/warehouse/receive\ | Bearer JWT | \WarehouseIntakeRequest { barcode/trackingNumber, warehouseId, binLocation, measuredWeight }\ | \ShipmentDTO (status: RECEIVED_AT_WAREHOUSE, binLocation)\ | N/A | 404 Unknown Barcode, 409 Bin Occupied | \ShipmentController.receiveAtWarehouse\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Warehouse Dispatch to Courier** | Warehouse, Admin | POST | \/api/shipments/warehouse/dispatch/{courierId}\ | Bearer JWT | \DispatchManifestRequest { shipmentIds: number[], manifestCode, vehiclePlate }\ | \ManifestDTO { manifestNumber, courierId, totalShipments, status: 'DISPATCHED' }\ | N/A | 400 Shipments not ready, 404 Courier | \ShipmentController.dispatchToCourier\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Get Warehouse Inventory & Bins**| Warehouse, Admin | GET | \/api/warehouses/{id}/inventory\ | Bearer JWT | Query: \isle, status, page, size\ | \WarehouseInventoryResponse { warehouseId, totalCapacity, usedBins, bins: BinDTO[] }\ | \page=0, size=50\ | 404 Warehouse Not Found | \MasterDataController.getInventory\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 4. Courier Delivery & Last-Mile (\DeliveryExperienceController\ & \LiveTrackingController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Get Courier Assigned Route** | Courier | GET | \/api/routes/{courierId}\ | Bearer JWT | Path: \courierId\ | \RouteDTO { courierId, date, stops: DeliveryStopDTO[], totalDistanceKm, estimatedHours }\ | N/A | 404 No Active Route | \SmartAssignmentController.getRoute\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Optimize Route** | Courier, Admin | POST | \/api/routes/optimize/{courierId}\ | Bearer JWT | Path: \courierId\ | \RouteDTO { reorderedStops, optimizedDistanceKm }\ | N/A | 400 Routing Engine Error | \SmartAssignmentController.optimizeRoute\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Record Delivery Attempt (Fail)** | Courier | POST | \/api/delivery/{shipmentId}/attempt\ | Bearer JWT | \FailedAttemptRequest { failureReason, nextAttemptScheduledAt, notes, courierLat, courierLng }\ | \DeliveryAttemptResponse { attemptNumber, status: 'DELIVERY_FAILED', nextScheduledAt }\ | N/A | 400 Max attempts exceeded | \DeliveryExperienceController.recordAttempt\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Submit Proof of Delivery (PoD)**| Courier | POST | \/api/delivery/{shipmentId}/proof\ | Bearer JWT | \PoDRequest { podType: 'SIGNATURE'\|'PHOTO'\|'OTP', signatureData, photoUrl, otpCode, codCollectedAmount, recipientNotes }\ | \PoDResponse { shipmentId, status: 'DELIVERED', collectedCod, timestamp }\ | N/A | 400 Invalid OTP, 400 COD mismatch | \DeliveryExperienceController.submitProof\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Ping Courier Location (GPS)** | Courier | POST | \/api/couriers/location\ | Bearer JWT | \CourierLocationPing { latitude, longitude, heading, speed, timestamp, activeShipmentId }\ | \AckResponse { status: 'OK' }\ | N/A | 401 Unauthorized | \LiveTrackingController.updateLocation\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Courier Earnings & Shifts** | Courier | GET | \/api/financial/payouts/courier/summary\ | Bearer JWT | Query: \period: 'TODAY'\|'WEEK'\|'MONTH'\ | \CourierEarningsSummary { todayEarnings, deliveredCount, codCollected, ratingsAverage, history }\ | N/A | 401 Unauthorized | \FinancialController.getCourierEarnings\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 5. Smart Assignment & Dispatch (\SmartAssignmentController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Suggest Best Courier** | Admin | GET | \/api/assignment/suggest/{shipmentId}\ | Bearer JWT | Path: \shipmentId\ | \SuggestionResponse { topCouriers: { courierId, name, score, distanceKm, activeCount }[] }\ | N/A | 404 Shipment Not Found | \SmartAssignmentController.suggestCourier\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Full Courier Score Matrix** | Admin | GET | \/api/assignment/score/{shipmentId}\ | Bearer JWT | Path: \shipmentId\ | \ScoreBreakdownDTO { courierScores: [] }\ | N/A | 404 | \SmartAssignmentController.getScores\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Update Assignment Scoring Rules**| Admin | PUT | \/api/assignment/rules\ | Bearer JWT | \RuleUpdateRequest { ruleKey: string, ruleValue: number }\ | \RulesDTO\ | N/A | 400 Invalid Rule Weight | \SmartAssignmentController.updateRules\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 6. Financial Management, Wallets & Settlements (\FinancialController\ / \SettlementController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Get Wallet Balance** | Merchant, Courier, Admin | GET | \/api/wallet/balance\ | Bearer JWT | None | \WalletDTO { currentBalance, pendingCod, lifetimeEarnings, currency: 'EGP' }\ | N/A | 401 | \FinancialController.getBalance\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Wallet Transactions** | Merchant, Courier | GET | \/api/wallet/transactions\ | Bearer JWT | Query: \page, size, type, dateFrom, dateTo\ | \Page<TransactionDTO> { content: TransactionDTO[], totalElements }\ | \page=0, size=15\ | 401 | \FinancialController.getTransactions\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Request Payout / Withdraw** | Merchant, Courier | POST | \/api/wallet/withdraw\ | Bearer JWT | \WithdrawRequest { amount, bankName, accountNumber, iban, notes }\ | \WithdrawResponse { payoutId, status: 'PENDING_APPROVAL', amount }\ | N/A | 400 Insufficient Balance | \FinancialController.requestWithdrawal\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Generate Settlement Batch** | Admin | POST | \/api/settlements/generate\ | Bearer JWT | \SettlementGenerateRequest { period: 'DAILY'\|'WEEKLY'\|'MONTHLY', startDate, endDate }\ | \SettlementBatchDTO { id, batchCode, totalAmount, count, status: 'GENERATED' }\ | N/A | 400 Date Mismatch | \SettlementController.generateBatch\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **List Settlements** | Admin, Owner | GET | \/api/settlements\ | Bearer JWT | Query: \status, page, size\ | \Page<SettlementBatchDTO>\ | \page=0, size=20\ | 403 Forbidden | \SettlementController.listBatches\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Get Settlement Items** | Admin | GET | \/api/settlements/{id}/items\ | Bearer JWT | Path: \id\ | \SettlementItemDTO[] { shipmentId, codAmount, courierFee, netAmount }\ | N/A | 404 Batch Not Found | \SettlementController.getItems\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 7. Multi-Tenancy & Subscriptions (\TenantController\ / \TenantQuotaController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **List Tenants** | Owner | GET | \/api/tenants\ | Bearer JWT | Query: \status, page, size\ | \Page<TenantDTO> { content: TenantDTO[] }\ | \page=0, size=20\ | 403 Forbidden | \TenantController.listTenants\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Create Tenant** | Owner | POST | \/api/tenants\ | Bearer JWT | \CreateTenantRequest { name, companyName, phone, planTier, maxUsers, maxShipmentsMonthly }\ | \TenantDTO { id, slug, active, apiKey }\ | N/A | 400 Name Exists | \TenantController.createTenant\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Update Branding** | Owner, Admin | POST | \/api/tenants/{id}/branding\ | Bearer JWT | \TenantBrandingRequest { logoUrl, primaryColor, accentColor, companyNameAr }\ | \TenantDTO\ | N/A | 404 Tenant Not Found | \TenantBrandingController.updateBranding\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Set Quotas** | Owner | POST | \/api/tenants/{id}/quotas\ | Bearer JWT | \TenantQuotaRequest { maxShipments, maxUsers, maxStorageMb }\ | \QuotaDTO\ | N/A | 404 | \TenantQuotaController.setQuotas\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **List Subscription Plans** | All | GET | \/api/subscriptions/plans\ | None / Bearer | None | \PlanResponse[] { name: 'Starter'\|'Growth'\|'Enterprise', priceEgp, shipmentLimit, features: [] }\ | N/A | 200 OK | \SubscriptionController.getPlans\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 8. Public Tracking (\RecipientController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Track Shipment** | Public | GET | \/api/public/tracking/{trackingNumber}\ | None (Public) | Path: \	rackingNumber\ | \TrackingResponseDTO { trackingNumber, status, recipientCity, estimatedDeliveryDate, timeline: TrackingEventDTO[] }\ | N/A | 404 Tracking Number Not Found | \RecipientController.trackShipment\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Public Tracking ETA** | Public | GET | \/api/public/tracking/{trackingNumber}/eta\ | None (Public) | Path: \	rackingNumber\ | \EtaResponse { estimatedArrivalWindow, currentStatusDescription }\ | N/A | 404 Not Found | \RecipientController.getEta\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## 9. Observability, System Health & Audit (\HealthController\ / \AuditController\)

| Feature | Role | Method | Endpoint | Auth | Request DTO / Schema | Response DTO / Schema | Pagination | Errors | Controller Source | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Spring Actuator Health** | Public / Admin | GET | \/actuator/health\ | Optional | None | \HealthDTO { status: 'UP', components: { db: { status: 'UP' }, redis: { status: 'UP' }, diskSpace: { status: 'UP' } } }\ | N/A | 503 If Service Down | \HealthController.health\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **System Health Report** | Admin, Owner | GET | \/api/system-health\ | Bearer JWT | None | \SystemHealthCheckDTO { uptime, activeDbConnections, redisLatencyMs, memoryUsedMb, pendingQueues }\ | N/A | 403 Forbidden | \HealthController.getDetailedHealth\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |
| **Audit Logs** | Admin, Owner | GET | \/api/audit\ | Bearer JWT | Query: \page, size, action, actorId, dateFrom, dateTo\ | \Page<AuditLogDTO> { content: AuditLogDTO[] }\ | \page=0, size=20\ | 403 Forbidden | \AuditController.getAuditLogs\ | DOCUMENTED ONLY / MOCK IMPLEMENTED |

---

## Summary of Integration Notes for Backend Team
1. **API Base Path**: All REST endpoints are rooted at \/api\ except Spring Boot Actuator endpoints at \/actuator\.
2. **Authentication Header**: \Authorization: Bearer <jwt-token>\.
3. **Tenant Context**: \X-Tenant-ID: <tenant-slug-or-id>\ is transmitted on all tenant-scoped requests.
4. **CORS Configuration**: The backend must allow origins for the frontend development server (default \http://localhost:5173\) and production domains, allowing \Authorization\, \X-Tenant-ID\, and \Content-Type\ headers.