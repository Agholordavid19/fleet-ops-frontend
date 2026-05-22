import { apiSlice } from '../api/apiSlice'

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminActivityLogs: builder.query({
      query: ({ page = 0, size = 20, sortBy = 'occurredAt', direction = 'DESC' } = {}) =>
        `/api/admin/activity-logs?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
      providesTags: ['Activity'],
    }),
    getPlatformActivityLogs: builder.query({
      query: ({ page = 0, size = 20, sortBy = 'occurredAt', direction = 'DESC' } = {}) =>
        `/api/platform/activity-logs?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
      providesTags: ['Activity'],
    }),
  }),
})

export const {
  useGetAdminActivityLogsQuery,
  useGetPlatformActivityLogsQuery,
} = activityApi
