import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './utils/useAuth.jsx'

import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import LoginScreen from './auth/Login.jsx'

// Admin
import UsersScreen from './pages/UsersScreenPage.jsx'
import ReportsScreen from './pages/ReportScreenPage.jsx'

// Fleet Manager
import VehiclesScreen from './pages/VehicleScreen.jsx'
import MaintenanceScreen from './pages/MaintenancePage.jsx'
import TripManagementScreen from './pages/TripManagementpage.jsx'

// Field Staff
import TripsScreen from './pages/TripPage.jsx'
import MileageScreen from './pages/MileagePage.jsx'

// Maintenance
import FlagsScreen from './pages/FlagScreenPage.jsx'


const roleHome = {
    ADMIN: '/admin/users',
    FLEET_MANAGER: '/fleet/vehicles',
    FIELD_STAFF: '/staff/trips',
    MAINTENANCE: '/maintenance/flags',
}

function HomeRedirect() {
    const { role, isAuthenticated } = useAuth()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <Navigate to={roleHome[role] ?? '/login'} replace />
}


function App() {
  return (
    <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#241B08',
                        color: '#F5ECD8',
                        border: '1px solid #4A3D1A',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#241B08' } },
                    error:   { iconTheme: { primary: '#ef4444', secondary: '#241B08' } },
                }}
            />
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/" element={<HomeRedirect />} />

                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    {/* Admin */}
                    <Route path="/admin/users"    element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersScreen /></ProtectedRoute>} />
                    <Route path="/admin/reports"  element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsScreen /></ProtectedRoute>} />

                    {/* Fleet Manager */}
                    <Route path="/fleet/vehicles"    element={<ProtectedRoute allowedRoles={['FLEET_MANAGER']}><VehiclesScreen /></ProtectedRoute>} />
                    <Route path="/fleet/maintenance" element={<ProtectedRoute allowedRoles={['FLEET_MANAGER']}><MaintenanceScreen /></ProtectedRoute>} />
                    <Route path="/fleet/trips"       element={<ProtectedRoute allowedRoles={['FLEET_MANAGER']}><TripManagementScreen /></ProtectedRoute>} />

                    {/* Field Staff */}
                    <Route path="/staff/trips"   element={<ProtectedRoute allowedRoles={['FIELD_STAFF']}><TripsScreen /></ProtectedRoute>} />
                    <Route path="/staff/mileage" element={<ProtectedRoute allowedRoles={['FIELD_STAFF']}><MileageScreen /></ProtectedRoute>} />

                    {/* Maintenance */}
                    <Route path="/maintenance/flags" element={<ProtectedRoute allowedRoles={['MAINTENANCE']}><FlagsScreen /></ProtectedRoute>} />
                </Route>

                {/* Unauthorized */}
                <Route path="/unauthorized" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
                        <div className="text-center">
                            <p className="text-4xl mb-3">🚫</p>
                            <p className="text-lg font-semibold text-gray-200">Access Denied</p>
                            <p className="text-sm mt-1">You don't have permission to view this page.</p>
                        </div>
                    </div>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
    </>
  )
}

export default App
