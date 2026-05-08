🚗 FleetOps — Fleet Management System

FleetOps is a professional role-based fleet management dashboard designed to streamline vehicle lifecycle management, trip coordination, and maintenance workflows. It leverages an event-driven architecture to ensure real-time responsiveness and operational efficiency.

---

## 📌 Project Overview
FleetOps provides a centralized platform for organizations to bridge the gap between field operations and fleet administration. The system enforces strict **Role-Based Access Control (RBAC)** to ensure data integrity and process compliance.

### Key Stakeholders:
* **🛡️ Admins:** Global system configuration, user provisioning, and high-level reporting.
* **🚗 Fleet Managers:** Asset registration, trip approval workflows, and maintenance scheduling.
* **👤 Field Staff:** Vehicle availability lookup, trip requests, and mileage reporting.
* **🔧 Maintenance Teams:** Specialized views for resolving flagged vehicle issues and updating service logs.

---

## ⚙️ Tech Stack

### Frontend
* **React (Vite):** Fast, modern UI library and build tool.
* **Redux Toolkit + RTK Query:** Centralized state management and efficient data fetching with auto-caching.
* **Tailwind CSS:** Utility-first CSS framework for responsive, consistent styling.
* **Lucide React:** Iconography for a professional dashboard feel.
* **JWT Authentication:** Secure, stateless session management.

### Backend (System Architecture)
* **Spring Boot:** Powering the microservices ecosystem.
* **Apache Kafka:** Event-driven communication for decoupled service interaction.
* **PostgreSQL:** Relational database for the core fleet services.
* **Notification Service:** Stateless consumer for real-time Kafka-triggered alerts.

---

## 🔐 Features by Role

| Role | Responsibilities |
| :--- | :--- |
| **Admin** | User management, fleet utilization analytics, and system health monitoring. |
| **Fleet Manager** | Asset management, approving/rejecting trip requests, and assigning maintenance tasks. |
| **Field Staff** | Submitting trip requests, tracking status, and logging post-trip mileage. |
| **Maintenance** | Accessing a dedicated queue of maintenance flags and updating progress notes. |

---

## 🔄 Core Workflows

### 🚙 Trip Management
1.  **Availability Check:** Vehicles must be in `AVAILABLE` status to be requested.
2.  **Conflict Prevention:** The system prevents overlapping date requests for the same asset.
3.  **Asset Locking:** Upon approval, the vehicle status automatically transitions to `ASSIGNED`.

### 📊 Mileage & Automation
* **Threshold Monitoring:** Mileage logs are analyzed upon submission.
* **Automated Flagging:** If mileage exceeds maintenance thresholds, a Kafka event (`maintenance.flag.created`) is fired.
* **Asynchronous Processing:** The Notification Service picks up events to alert the relevant teams without blocking the main thread.

---

## 🧠 Architecture Highlights
* **RBAC:** Granular permission layers across all UI components and API routes.
* **Event-Driven:** Decoupled microservices using Kafka for high scalability.
* **Centralized State:** RTK Query simplifies complex API states and reduces boilerplate.
* **Protected Routes:** Higher-Order Components (HOCs) ensure users only access authorized modules.

---

## 📁 Project Structure

```bash
src/
├── apis/              # RTK Query API slices and base query config
├── components/        # Shared UI (Buttons, Modals, Tables, Loaders)
├── pages/             # Main screen components (Dashboard, Profile, etc.)
├── layouts/           # Wrapper components (Navbar, Sidebar, Footer)
├── utils/             # Business logic helpers and custom hooks
├── store/             # Redux store setup and slice registration
└── routes/            # React Router definitions with Role Validation

```
---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18+
* **npm or yarn**

### Installation
1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/fleet-ops.git](https://github.com/your-username/fleet-ops.git)
   cd fleet-ops
   ```
2 **Install dependencies**
```bash
  npm install
```
3. **Environment Configuration**
   Create a `.env` file in the root directory
   ```env
   VITE_APP_BASE_URL=http://localhost:8080
   ```
4 **Run the app **
  ```bash
  npm run dev
  ```
---

## 🧪 System Status Codes

| Category | Statuses |
| :--- | :--- |
| **Vehicle** | `AVAILABLE`, `ASSIGNED`, `MAINTENANCE` |
| **Trip** | `PENDING`, `APPROVED`, `REJECTED` |
| **Maintenance** | `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED` |

---

## 📈 Future Roadmap
- [ ] **Real-time Analytics:** Advanced charts for fleet fuel efficiency and cost-per-mile.
- [ ] **Mobile App:** React Native companion app for field staff.
- [ ] **WebSockets:** Live notification push via Socket.io or STOMP.
- [ ] **Audit Trail:** Detailed history logs for every asset and user action.

---

## 👨‍💻 Author
**Agholor David,  Samuel Gbenga Joseph**

