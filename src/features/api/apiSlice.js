import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  keepUnusedDataFor: 60,
  tagTypes: [
    'Auth', 'Companies', 'Vehicles', 'Trips', 'Maintenance', 'Breakdowns',
    'Users', 'Platform', 'Reports', 'Activity', 'Crew', 'MileageLogs',
    'MaintenanceMessages', 'VehicleHealth', 'PlatformDashboard',
    'CompanyProfile', 'UserProfile', 'CrewPerformance',
  ],
  endpoints: () => ({}),
})
