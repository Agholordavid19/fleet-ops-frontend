import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

// Public
const LandingPage = lazy(() => import('../pages/LandingPage'))

// Auth
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))

// Platform Admin
const PlatformDashboard = lazy(() => import('../pages/platform/PlatformDashboard'))
const CompaniesPage = lazy(() => import('../pages/platform/CompaniesPage'))
const CompanyDetailPage = lazy(() => import('../pages/platform/CompanyDetailPage'))
const CrewPage = lazy(() => import('../pages/platform/CrewPage'))
const CrewDetailPage = lazy(() => import('../pages/platform/CrewDetailPage'))
const PlatformBreakdownsPage = lazy(() => import('../pages/platform/PlatformBreakdownsPage'))
const PlatformMaintenancePage = lazy(() => import('../pages/platform/PlatformMaintenancePage'))
const PlatformActivityPage = lazy(() => import('../pages/platform/PlatformActivityPage'))

// Admin / Fleet Manager
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const CompanyProfilePage = lazy(() => import('../pages/admin/CompanyProfilePage'))
const UsersPage = lazy(() => import('../pages/admin/UsersPage'))
const VehiclesPage = lazy(() => import('../pages/admin/VehiclesPage'))
const VehicleDetailPage = lazy(() => import('../pages/admin/VehicleDetailPage'))
const TripsPage = lazy(() => import('../pages/admin/TripsPage'))
const MaintenancePage = lazy(() => import('../pages/admin/MaintenancePage'))
const MaintenanceDetailPage = lazy(() => import('../pages/admin/MaintenanceDetailPage'))
const BreakdownsPage = lazy(() => import('../pages/admin/BreakdownsPage'))
const MileagePage = lazy(() => import('../pages/admin/MileagePage'))
const UtilisationReportPage = lazy(() => import('../pages/admin/UtilisationReportPage'))
const HealthReportPage = lazy(() => import('../pages/admin/HealthReportPage'))
const AdminActivityPage = lazy(() => import('../pages/admin/AdminActivityPage'))
const AdminProfilePage = lazy(() => import('../pages/admin/AdminProfilePage'))

// Staff
const StaffDashboard = lazy(() => import('../pages/staff/StaffDashboard'))
const AvailableVehiclesPage = lazy(() => import('../pages/staff/AvailableVehiclesPage'))
const NewTripPage = lazy(() => import('../pages/staff/NewTripPage'))
const MyTripsPage = lazy(() => import('../pages/staff/MyTripsPage'))
const ReportBreakdownPage = lazy(() => import('../pages/staff/ReportBreakdownPage'))
const LogMileagePage = lazy(() => import('../pages/staff/LogMileagePage'))
const StaffProfilePage = lazy(() => import('../pages/staff/StaffProfilePage'))

// Crew
const CrewDashboard = lazy(() => import('../pages/crew/CrewDashboard'))
const MyFlagsPage = lazy(() => import('../pages/crew/MyFlagsPage'))
const FlagDetailPage = lazy(() => import('../pages/crew/FlagDetailPage'))
const CrewProfilePage = lazy(() => import('../pages/crew/CrewProfilePage'))

const PLATFORM = ['PLATFORM_ADMIN']
const ADMIN = ['COMPANY_ADMIN', 'FLEET_MANAGER']
const STAFF = ['FIELD_STAFF']
const CREW = ['MAINTENANCE_CREW']

export default function AppRouter() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 rounded-full border-2 border-stone-900 border-t-transparent animate-spin" />
      </div>
    }>
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
    </Suspense>
  )
}
