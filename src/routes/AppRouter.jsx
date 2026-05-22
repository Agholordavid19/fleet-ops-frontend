import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

// Public
import LandingPage from '../pages/LandingPage'

// Auth
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Platform Admin
import PlatformDashboard from '../pages/platform/PlatformDashboard'
import CompaniesPage from '../pages/platform/CompaniesPage'
import CompanyDetailPage from '../pages/platform/CompanyDetailPage'
import CrewPage from '../pages/platform/CrewPage'
import CrewDetailPage from '../pages/platform/CrewDetailPage'
import PlatformBreakdownsPage from '../pages/platform/PlatformBreakdownsPage'
import PlatformMaintenancePage from '../pages/platform/PlatformMaintenancePage'
import PlatformActivityPage from '../pages/platform/PlatformActivityPage'

// Admin / Fleet Manager
import AdminDashboard from '../pages/admin/AdminDashboard'
import CompanyProfilePage from '../pages/admin/CompanyProfilePage'
import UsersPage from '../pages/admin/UsersPage'
import VehiclesPage from '../pages/admin/VehiclesPage'
import VehicleDetailPage from '../pages/admin/VehicleDetailPage'
import TripsPage from '../pages/admin/TripsPage'
import MaintenancePage from '../pages/admin/MaintenancePage'
import MaintenanceDetailPage from '../pages/admin/MaintenanceDetailPage'
import BreakdownsPage from '../pages/admin/BreakdownsPage'
import MileagePage from '../pages/admin/MileagePage'
import UtilisationReportPage from '../pages/admin/UtilisationReportPage'
import HealthReportPage from '../pages/admin/HealthReportPage'
import AdminActivityPage from '../pages/admin/AdminActivityPage'
import AdminProfilePage from '../pages/admin/AdminProfilePage'

// Staff
import StaffDashboard from '../pages/staff/StaffDashboard'
import AvailableVehiclesPage from '../pages/staff/AvailableVehiclesPage'
import NewTripPage from '../pages/staff/NewTripPage'
import MyTripsPage from '../pages/staff/MyTripsPage'
import ReportBreakdownPage from '../pages/staff/ReportBreakdownPage'
import LogMileagePage from '../pages/staff/LogMileagePage'
import StaffProfilePage from '../pages/staff/StaffProfilePage'

// Crew
import CrewDashboard from '../pages/crew/CrewDashboard'
import MyFlagsPage from '../pages/crew/MyFlagsPage'
import FlagDetailPage from '../pages/crew/FlagDetailPage'
import CrewProfilePage from '../pages/crew/CrewProfilePage'

const PLATFORM = ['PLATFORM_ADMIN']
const ADMIN = ['COMPANY_ADMIN', 'FLEET_MANAGER']
const STAFF = ['FIELD_STAFF']
const CREW = ['MAINTENANCE_CREW']

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Platform Admin */}
      <Route path="/platform/dashboard" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><PlatformDashboard /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/companies" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><CompaniesPage /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/companies/:id" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><CompanyDetailPage /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/crew" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><CrewPage /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/crew/:id" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><CrewDetailPage /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/breakdowns" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><PlatformBreakdownsPage /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/maintenance" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><PlatformMaintenancePage /></RoleRoute></PrivateRoute>} />
      <Route path="/platform/activity-logs" element={<PrivateRoute><RoleRoute allowed={PLATFORM}><PlatformActivityPage /></RoleRoute></PrivateRoute>} />

      {/* Admin / Fleet Manager */}
      <Route path="/admin/dashboard" element={<PrivateRoute><RoleRoute allowed={ADMIN}><AdminDashboard /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/company" element={<PrivateRoute><RoleRoute allowed={ADMIN}><CompanyProfilePage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute><RoleRoute allowed={ADMIN}><UsersPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/vehicles" element={<PrivateRoute><RoleRoute allowed={ADMIN}><VehiclesPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/vehicles/:id" element={<PrivateRoute><RoleRoute allowed={ADMIN}><VehicleDetailPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/trips" element={<PrivateRoute><RoleRoute allowed={ADMIN}><TripsPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/maintenance" element={<PrivateRoute><RoleRoute allowed={ADMIN}><MaintenancePage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/maintenance/:id" element={<PrivateRoute><RoleRoute allowed={ADMIN}><MaintenanceDetailPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/breakdowns" element={<PrivateRoute><RoleRoute allowed={ADMIN}><BreakdownsPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/mileage/:vehicleId" element={<PrivateRoute><RoleRoute allowed={ADMIN}><MileagePage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/reports/utilisation" element={<PrivateRoute><RoleRoute allowed={ADMIN}><UtilisationReportPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/reports/vehicle-health" element={<PrivateRoute><RoleRoute allowed={ADMIN}><HealthReportPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/activity-logs" element={<PrivateRoute><RoleRoute allowed={ADMIN}><AdminActivityPage /></RoleRoute></PrivateRoute>} />
      <Route path="/admin/profile" element={<PrivateRoute><RoleRoute allowed={ADMIN}><AdminProfilePage /></RoleRoute></PrivateRoute>} />

      {/* Field Staff */}
      <Route path="/staff/dashboard" element={<PrivateRoute><RoleRoute allowed={STAFF}><StaffDashboard /></RoleRoute></PrivateRoute>} />
      <Route path="/staff/vehicles/available" element={<PrivateRoute><RoleRoute allowed={STAFF}><AvailableVehiclesPage /></RoleRoute></PrivateRoute>} />
      <Route path="/staff/trips/new" element={<PrivateRoute><RoleRoute allowed={STAFF}><NewTripPage /></RoleRoute></PrivateRoute>} />
      <Route path="/staff/trips/my" element={<PrivateRoute><RoleRoute allowed={STAFF}><MyTripsPage /></RoleRoute></PrivateRoute>} />
      <Route path="/staff/breakdowns/report" element={<PrivateRoute><RoleRoute allowed={STAFF}><ReportBreakdownPage /></RoleRoute></PrivateRoute>} />
      <Route path="/staff/mileage/log" element={<PrivateRoute><RoleRoute allowed={STAFF}><LogMileagePage /></RoleRoute></PrivateRoute>} />
      <Route path="/staff/profile" element={<PrivateRoute><RoleRoute allowed={STAFF}><StaffProfilePage /></RoleRoute></PrivateRoute>} />

      {/* Maintenance Crew */}
      <Route path="/crew/dashboard" element={<PrivateRoute><RoleRoute allowed={CREW}><CrewDashboard /></RoleRoute></PrivateRoute>} />
      <Route path="/crew/flags" element={<PrivateRoute><RoleRoute allowed={CREW}><MyFlagsPage /></RoleRoute></PrivateRoute>} />
      <Route path="/crew/flags/:id" element={<PrivateRoute><RoleRoute allowed={CREW}><FlagDetailPage /></RoleRoute></PrivateRoute>} />
      <Route path="/crew/profile" element={<PrivateRoute><RoleRoute allowed={CREW}><CrewProfilePage /></RoleRoute></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
