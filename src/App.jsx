import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './utils/useAuth.jsx'

import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import LoginScreen from './auth/Login.jsx'

// Admin
import UsersScreen from './pages/UsersScreenPage.jsx'
import ReportsScreen from './pages/ReportScreenPage.jsx'
import ActivityLogPage from './pages/ActivityLogPage.jsx'

// Fleet Manager
import VehiclesScreen from './pages/VehicleScreen.jsx'
import MaintenanceScreen from './pages/MaintenancePage.jsx'
import TripManagementScreen from './pages/TripManagementpage.jsx'

// Field Staff
import TripsScreen from './pages/TripPage.jsx'
import MileageScreen from './pages/MileagePage.jsx'
import HistoryScreen from './pages/HistoryScreen.jsx'

// Maintenance
import MaintenanceTeamFlagsPage from './pages/MaintenanceTeamFlagsPage.jsx'

// Profile
import ProfileScreen from './pages/ProfilePage.jsx'
import CompleteTripPage from "./pages/CompleteTripPage.jsx";

const roleHome = {
    ADMIN: '/admin/users',
    FLEET_MANAGER: '/fleet/vehicles',
    FIELD_STAFF: '/staff/trips',
    MAINTENANCE_TEAM: '/maintenance/flags',
}

function HomeRedirect() {
    const { role, isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Navigate to={roleHome[role] ?? '/login'} replace />
}

function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#1d1d1f',
                        border: '1px solid #e5e5e7',
                        fontSize: '13px',
                        fontFamily: 'Inter, sans-serif',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />

            <Routes>
                <Route path="/login" element={<LoginScreen />} />

                <Route path="/" element={<HomeRedirect />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Profile */}
                    <Route
                        path="/profile"
                        element={<ProfileScreen />}
                    />

                    {/* Admin */}
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UsersScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/reports"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ReportsScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/activity-logs"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ActivityLogPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fleet Manager + Admin */}
                    <Route
                        path="/fleet/vehicles"
                        element={
                            <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
                                <VehiclesScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/fleet/maintenance"
                        element={
                            <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
                                <MaintenanceScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/fleet/trips"
                        element={
                            <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
                                <TripManagementScreen />
                            </ProtectedRoute>
                        }
                    />

                    {/* Field Staff */}
                    <Route
                        path="/staff/trips"
                        element={
                            <ProtectedRoute allowedRoles={['FIELD_STAFF']}>
                                <TripsScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/staff/history"
                        element={
                            <ProtectedRoute allowedRoles={['FIELD_STAFF']}>
                                <HistoryScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/staff/mileage"
                        element={
                            <ProtectedRoute allowedRoles={['FIELD_STAFF']}>
                                <MileageScreen />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/staff/complete-trips"
                        element={
                            <ProtectedRoute allowedRoles={['FIELD_STAFF', 'FLEET_MANAGER', 'ADMIN']}>
                                <CompleteTripPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Maintenance Team */}
                    <Route
                        path="/maintenance/flags"
                        element={
                            <ProtectedRoute allowedRoles={['MAINTENANCE_TEAM']}>
                                <MaintenanceTeamFlagsPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Unauthorized */}
                <Route
                    path="/unauthorized"
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-950">
                            <div className="text-center bg-gray-900 rounded-2xl px-10 py-8 border border-gray-700/50 shadow-sm shadow-black/4">
                                <p className="text-[15px] font-semibold text-gray-200 mb-1.5 tracking-tight">
                                    Access Denied
                                </p>

                                <p className="text-[13px] text-gray-500">
                                    You don't have permission to view this page.
                                </p>
                            </div>
                        </div>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App