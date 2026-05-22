# 🚗 MpFleets — Fleet Management System

MpFleets is a professional role-based fleet management dashboard designed to streamline vehicle lifecycle management, trip coordination, and maintenance workflows. It leverages an event-driven architecture to ensure real-time responsiveness and operational efficiency.

---

## 📌 Project Overview

MpFleets provides a centralized platform for organizations to bridge the gap between field operations and fleet administration. The system enforces strict **Role-Based Access Control (RBAC)** to ensure data integrity and process compliance.

### Key Stakeholders

| Role | Description |
| :--- | :--- |
| **🛡️ Platform Admin** | Global system configuration, company provisioning, and cross-fleet oversight. |
| **🚗 Fleet Manager / Company Admin** | Asset registration, trip approval workflows, maintenance scheduling, and reporting. |
| **👤 Field Staff** | Vehicle availability lookup, trip requests, breakdown reporting, and mileage logging. |
| **🔧 Maintenance Crew** | Specialized queue for resolving flagged vehicle issues and updating service progress notes. |

---

## ⚙️ Tech Stack

### Frontend

| Technology | Purpose |
| :--- | :--- |
| **React 19 + Vite 8** | Fast, modern UI library and build tool |
| **Redux Toolkit + RTK Query** | Centralized state management and efficient data fetching with auto-caching |
| **redux-persist** | Persists auth state (token, role, user info) across page refreshes |
| **Tailwind CSS v4** | Utility-first CSS framework for responsive, consistent styling |
| **Radix UI** | Accessible, unstyled component primitives (dialogs, dropdowns, tabs, tooltips, etc.) |
| **Recharts** | Composable chart library powering fleet analytics visualizations |
| **Framer Motion** | Declarative animations for smooth UI transitions |
| **Lucide React** | Iconography for a professional dashboard feel |
| **React Hook Form** | Performant, flexible form state management |
| **JWT Authentication** | Secure, stateless session management via `Authorization: Bearer` headers |

### Backend (System Architecture)

| Technology | Purpose |
| :--- | :--- |
| **Spring Boot** | Powering the microservices ecosystem |
| **Apache Kafka** | Event-driven communication for decoupled service interaction |
| **PostgreSQL** | Relational database for the core fleet services |
| **Cloudinary** | Media storage and image upload for vehicle and user profiles |
| **Notification Service** | Stateless consumer for real-time Kafka-triggered alerts |

### Testing

| Technology | Purpose |
| :--- | :--- |
| **Vitest** | Fast, Vite-native unit and integration test runner |
| **Testing Library** | Component and user-interaction testing utilities |
| **MSW (Mock Service Worker)** | API mocking layer for isolated, realistic tests |

---

## 🔐 Features by Role

### 🛡️ Platform Admin
- Multi-company management and provisioning
- Cross-fleet maintenance and breakdown visibility
- Platform-wide activity log monitoring
- Maintenance crew oversight and detail views

### 🚗 Fleet Manager / Company Admin
- Vehicle registration, editing, and status management
- Trip request approval and rejection workflows
- Maintenance task assignment and progress tracking
- Breakdown incident management
- Mileage log review with automated threshold alerts
- Fleet utilisation and vehicle health reports
- User management within the company

### 👤 Field Staff
- Browse available vehicles in real time
- Submit trip requests with date range selection
- View and track own trip status
- Report vehicle breakdowns
- Log post-trip mileage

### 🔧 Maintenance Crew
- Dedicated maintenance flag queue
- Flag detail view with full history and progress notes
- Star-rating based performance feedback

---

## 🔄 Core Workflows

### 🚙 Trip Management
1. **Availability Check:** Vehicles must be in `AVAILABLE` status to be requested.
2. **Conflict Prevention:** The system prevents overlapping date requests for the same asset.
3. **Asset Locking:** Upon approval, the vehicle status automatically transitions to `ASSIGNED`.

### 📊 Mileage & Automation
- **Threshold Monitoring:** Mileage logs are analyzed upon submission.
- **Automated Flagging:** If mileage exceeds maintenance thresholds, a Kafka event (`maintenance.flag.created`) is fired.
- **Asynchronous Processing:** The Notification Service picks up events to alert the relevant teams without blocking the main thread.

### 🔔 Real-Time Feedback
- A global toast notification system (via `uiSlice` + `useToast`) surfaces success, error, and warning events across all user flows.
- Skeleton loaders provide perceived performance during data fetching.

---

## 🧠 Architecture Highlights

- **RBAC:** Granular permission layers enforced at the routing level via `PrivateRoute` and `RoleRoute` Higher-Order Components.
- **Event-Driven Backend:** Decoupled microservices using Kafka for high scalability.
- **Centralized State:** RTK Query manages all API states (loading, error, cache invalidation) with 16 registered tag types.
- **Persistent Sessions:** `redux-persist` keeps the auth slice in localStorage, restoring user sessions on reload without re-login.
- **Protected Routes:** Role-guard HOCs ensure users only access authorized modules; unmatched routes redirect to home.
- **Image Uploads:** Cloudinary integration via `CloudinaryUpload` component handles vehicle and profile images.

---

## 📁 Project Structure

```
src/
├── app/               # Redux store setup and redux-persist configuration
├── assets/            # SVG icons and static assets
├── components/
│   ├── charts/        # Recharts wrappers (ActivitySparkline, HealthDonut, UtilizationBar)
│   ├── layout/        # Structural wrappers (Sidebar, TopBar, PageWrapper)
│   └── ui/            # Atomic UI components (DataTable, Modal, Toast, StatusBadge, etc.)
├── features/          # RTK Query API slices and Redux state slices
│   ├── api/           # Base query config with JWT header injection
│   ├── auth/          # Auth API + authSlice (token, role, user identity)
│   ├── ui/            # UI state slice (sidebar, modals, toasts)
│   ├── vehicles/      # Vehicles API endpoints
│   ├── trips/         # Trip request API endpoints
│   ├── maintenance/   # Maintenance flags API endpoints
│   ├── breakdowns/    # Breakdown reporting API endpoints
│   ├── users/         # Users and crew API endpoints
│   ├── companies/     # Company management API endpoints
│   ├── reports/       # Utilisation and health reports API
│   ├── activity/      # Activity log API endpoints
│   └── platform/      # Platform admin API endpoints
├── hooks/             # Custom hooks (useAuth, useRole, useToast)
├── pages/
│   ├── admin/         # Fleet Manager / Company Admin screens (15 pages)
│   ├── platform/      # Platform Admin screens (8 pages)
│   ├── staff/         # Field Staff screens (7 pages)
│   ├── crew/          # Maintenance Crew screens (4 pages)
│   └── auth/          # Login and Register pages
├── routes/            # AppRouter, PrivateRoute, and RoleRoute guards
├── test/              # MSW handlers, test store, and renderWithProviders helper
└── utils/             # cn, formatters, roleHelpers, statusColors
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fleetops-main-frontend.git
   cd fleetops-main-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8082
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

### Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite (single run) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

---

## 🧪 System Status Codes

| Category | Statuses |
| :--- | :--- |
| **Vehicle** | `AVAILABLE`, `ASSIGNED`, `MAINTENANCE` |
| **Trip** | `PENDING`, `APPROVED`, `REJECTED` |
| **Maintenance** | `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED` |
| **Breakdown** | Tracked per vehicle with incident detail views |

---

## 📈 Future Roadmap

- [ ] **Real-time Analytics:** Advanced charts for fleet fuel efficiency and cost-per-mile.
- [ ] **Mobile App:** React Native companion app for field staff.
- [ ] **WebSockets:** Live notification push via Socket.io or STOMP.
- [ ] **Audit Trail:** Detailed history logs for every asset and user action.

---

## 👨‍💻 Authors

**Agholor David Ikechukwu ** | **Samuel Gbenga Joseph**