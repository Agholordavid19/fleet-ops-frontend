import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'
import { apiSlice } from '../features/api/apiSlice'

// Plain store without redux-persist, suitable for test environments.
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(apiSlice.middleware),
    preloadedState,
  })
}

// Authenticated FIELD_STAFF state used by most staff-portal tests.
export const STAFF_AUTH = {
  auth: {
    token: 'test-token',
    userId: 'user-1',
    name: 'Alice Staff',
    email: 'alice@fleet.com',
    role: 'FIELD_STAFF',
    userType: 'FIELD_STAFF',
    companyId: 'company-1',
    isAuthenticated: true,
    profilePictureUrl: null,
    profilePictureId: null,
  },
}

export const ADMIN_AUTH = {
  auth: {
    token: 'test-token',
    userId: 'admin-1',
    name: 'Bob Admin',
    email: 'bob@fleet.com',
    role: 'FLEET_MANAGER',
    userType: 'FLEET_MANAGER',
    companyId: 'company-1',
    isAuthenticated: true,
    profilePictureUrl: null,
    profilePictureId: null,
  },
}
