# TWSELA (توصيلة) — Frontend Architecture & Design System

## 1. Executive Architecture Summary
TWSELA is an Arabic-first, multi-tenant enterprise logistics and courier management platform. The frontend is engineered as a high-performance Single Page Application (SPA) leveraging **React 18 / 19**, **TypeScript 5**, **Vite**, **Tailwind CSS**, and modern component-driven modularity.

The architecture strictly separates presentational components, business/domain logic, and data transport layers, enabling seamless switching between **Live API Mode** (connecting to the Spring Boot 3.3.3 backend) and **Mock Simulation Mode** (offline development, client demos, and graduation project evaluation).

---

## 2. Technology Stack & Decision Rationale

| Category | Technology | Rationale |
| :--- | :--- | :--- |
| **Core Framework** | React + TypeScript | Strict static type guarantees matching backend DTO schemas; industry standard for graduation project evaluation and enterprise SaaS. |
| **Build Tool & Bundler** | Vite | Sub-second HMR, optimized tree-shaking, fast ESM builds. |
| **Styling & Design System** | Tailwind CSS + Custom Design Tokens | Fast utility-first workflow; robust native RTL directionality support (`rtl:` variants); CSS custom properties mapped to TWSELA brand colors. |
| **Typography** | IBM Plex Sans Arabic + JetBrains Mono | Optimal Arabic readability across desktop and mobile screens; monospaced tabular numbers for tracking codes (`TW-9901`), timestamps, and financial figures. |
| **Icons** | Lucide React + Tabler Icons | Crisp SVG icons with RTL flip where semantic (e.g. arrows, navigation steps). |
| **Data Fetching & State** | Centralized API Client + React Context | Clean async hooks with caching, optimistic UI updates, debounced search, and clean loading/empty/error states. |
| **Form Management & Validation**| Controlled Forms with Schema Validation | Robust input masking for Egyptian phone numbers (`01XXXXXXXXX`), COD decimal currency, and required shipment fields. |

---

## 3. Directory Structure

```
frontend/
├── public/
│   ├── favicon.svg
│   └── locales/
├── src/
│   ├── api/
│   │   ├── client.ts             # Central Axios/Fetch HTTP wrapper with interceptors
│   │   ├── auth.ts               # Login, logout, refresh, password
│   │   ├── shipments.ts          # CRUD, bulk upload, tracking, labels
│   │   ├── couriers.ts           # Route, stops, PoD, earnings, GPS ping
│   │   ├── warehouse.ts          # Intake, bin allocation, dispatch manifest
│   │   ├── finance.ts            # Wallets, payouts, settlements, invoices
│   │   ├── owner.ts              # Multi-tenant oversight, subscriptions, quotas
│   │   ├── tracking.ts           # Public recipient tracking
│   │   └── mockData.ts           # Comprehensive seed fixtures matching Spring DTOs
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Sidebar, Topbar, Main content area
│   │   │   ├── Sidebar.tsx       # Role-aware navigation links
│   │   │   └── Topbar.tsx        # Search, language switch, notifications, user menu
│   │   ├── courier/
│   │   │   ├── SignatureCanvas.tsx # Digital touch/mouse PoD signature pad
│   │   │   ├── BarcodeScannerModal.tsx # Simulated/camera barcode reader
│   │   │   └── FailedAttemptModal.tsx
│   │   └── warehouse/
│   │       ├── BinMapGrid.tsx    # Interactive Aisle A-F x Bins 1-10 shelf view
│   │       └── ManifestDrawer.tsx
│   ├── context/
│   │   ├── AuthContext.tsx       # User session, JWT tokens, RBAC roles
│   │   └── ToastContext.tsx      # Global notification toast provider
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx     # Arabic login with demo quick-switch logins
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx# Operations, shipments, fleet, zones, finances
│   │   ├── merchant/
│   │   │   └── MerchantPortal.tsx# Self-service order creation, tracking, COD wallet
│   │   ├── courier/
│   │   │   └── CourierPortal.tsx # Mobile-first shift, stops, PoD, COD collection
│   │   ├── warehouse/
│   │   │   └── WarehousePortal.tsx # Intake, barcode scan, bin map, dispatch
│   │   ├── owner/
│   │   │   └── OwnerPortal.tsx   # Multi-tenancy, subscription tiers, platform stats
│   │   └── public/
│   │       └── PublicTrackingPage.tsx # Recipient order tracking with live timeline
│   ├── types/
│   │   └── index.ts              # Complete TypeScript interfaces matching Spring DTOs
│   ├── App.tsx                   # Role-based route switching & portal navigation
│   ├── main.tsx                  # React DOM mount point
│   └── index.css                 # Global CSS tokens, IBM Plex Sans Arabic import
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## 4. Visual Design System & Palette

The design reflects an elite, high-trust logistics enterprise:

- **Deep Navy** (`#07213d`, `#0c2d54`): Primary brand tone, header background, solid structure.
- **Electric Blue** (`#1358a5`, `#1a70d8`): Interactive actions, focused inputs, links.
- **Emerald Teal** (`#00c48c`, `#00a376`): Delivered status, successful intake, positive revenue, verified PoD.
- **Amber Gold** (`#f5a623`, `#f59e0b`): Pending actions, in-transit state, warehouse capacity warnings.
- **Crimson Danger** (`#e5373a`): Failed deliveries, SLA breaches, returned shipments, error banners.
- **Surfaces** (`#ffffff`, `#f7f8fb`, `#edf0f5`): Clean elevated cards with subtle 1px border (`rgba(10,45,80,0.09)`) and soft elevation shadows.

---

## 5. Arabic-First RTL Implementation

- Root document container specifies `dir="rtl"` and `lang="ar"`.
- Spacing follows logical start/end coordinates (margins and paddings dynamically aligned with RTL flow).
- Numbers and tracking codes use Arabic-Indic numerals or tabular Latin monospaced fonts (`JetBrains Mono`) to prevent layout flickering.
- Icon orientations: directional arrows (back/forward, chevrons) reverse dynamically according to RTL layout semantics.
