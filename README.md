# TWSELA (توصيلة) — Production Frontend Application

Arabic-first, multi-tenant courier and logistics management enterprise SaaS platform frontend, built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested with v25.9.0)
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Generates the optimized production build in `frontend/dist/`.

---

## ⚙️ Environment Configuration (`.env`)

Copy `.env.example` to `.env`:

```bash
# REST API Base URL (Spring Boot backend)
VITE_API_BASE_URL=http://localhost:8080/api

# Actuator Health Check
VITE_ACTUATOR_URL=http://localhost:8080/actuator

# Data Mode: 'mock' (standalone/demo) or 'live' (connected to Spring Boot)
VITE_DATA_MODE=mock

# App Title & Default Tenant Identifier
VITE_APP_TITLE=Twsela Courier Platform
VITE_DEFAULT_TENANT=twsela-main
```

### Modes Explained
- **MOCK MODE (`VITE_DATA_MODE=mock`)**: Default mode for graduation project presentations, offline evaluation, and standalone testing. Uses realistic seed fixtures, simulated network latency, and persistent in-browser storage.
- **LIVE MODE (`VITE_DATA_MODE=live`)**: Connects directly to the Spring Boot REST API at `VITE_API_BASE_URL` with JWT bearer tokens and `X-Tenant-ID` headers.

---

## 👥 Supported Roles & Quick Demo Login

The login screen provides 1-click quick login buttons for all 5 platform roles:

| Role | Demo User | Key Responsibilities |
| :--- | :--- | :--- |
| **Admin** | عمر الشريف | Operations oversight, all shipments, courier assignments, wallet approvals, system health. |
| **Merchant** | سارة طارق (متجر الأناقة) | Create shipments, bulk Excel upload, track orders, COD wallet balance, payout requests. |
| **Courier** | خالد منصور (المعادي) | Mobile-first shift view, GPS route stops, digital signature PoD canvas, failed delivery logger, COD cash handover. |
| **Warehouse** | أحمد الطيب (Hub 01 القاهرة) | Package intake, barcode scanner, interactive 60-bin map (Aisles A-F), shipping manifest generation, vehicle loading. |
| **Owner** | أحمد العمري | Multi-tenant company oversight, SaaS subscription tiers ($99, $299, Custom), platform quotas. |
| **Public** | Any Recipient | Public shipment tracking by tracking number (`TW-9901`, `TW-9902`) with chronological timeline. |

---

## 📁 Project Architecture & Directory Layout

```
frontend/
├── public/                 # Favicon, assets
├── src/
│   ├── api/                # Dual-mode API client and services
│   │   ├── client.ts       # Central HTTP client with JWT interceptors
│   │   ├── auth.ts         # Login, logout, session management
│   │   ├── shipments.ts    # Shipments CRUD and lifecycle transitions
│   │   ├── couriers.ts     # Route stops, digital PoD, failure logging
│   │   ├── warehouse.ts    # Intake, bin allocation, manifests, dispatch
│   │   ├── finance.ts      # Wallets, COD reconciliation, payouts
│   │   ├── owner.ts        # Tenants, quotas, subscriptions
│   │   ├── tracking.ts     # Public recipient tracking
│   │   └── mockData.ts     # Realistic Spring Boot DTO seed fixtures
│   ├── components/
│   │   ├── common/         # Badge, KpiCard, Modal, EmptyState, Toast
│   │   ├── layout/         # AppShell, Sidebar, Topbar
│   │   ├── courier/        # HTML5 SignatureCanvas for PoD
│   │   └── warehouse/      # Interactive 60-bin shelf map (BinMapGrid)
│   ├── context/            # AuthContext (RBAC) & ToastContext
│   ├── pages/              # Portal pages for Admin, Merchant, Courier, Warehouse, Owner, Public
│   ├── types/              # Strict TypeScript domain interfaces
│   ├── App.tsx             # Role-based SPA router
│   ├── main.tsx            # React root mount
│   └── index.css           # Tailwind + Arabic RTL typography
```

---

## 📚 Team Documentation Index

For detailed architectural and integration documentation, refer to the `docs/` folder:
- **[API Contract Matrix](../docs/API_CONTRACT_MATRIX.md)**: Verified Spring Boot controllers, endpoints, DTOs, and HTTP methods.
- **[Frontend Architecture](../docs/FRONTEND_ARCHITECTURE.md)**: Visual design system, palette, typography, and state management.
- **[Backend Integration Guide](../docs/INTEGRATION_GUIDE.md)**: Spring Boot CORS, JWT claims, headers, and error formats.
- **[Feature Implementation Matrix](../docs/FEATURE_STATUS.md)**: Readiness checklist across all 5 roles.
- **[Test & Quality Verification Report](../docs/TEST_REPORT.md)**: Build metrics and verified test scenarios.
