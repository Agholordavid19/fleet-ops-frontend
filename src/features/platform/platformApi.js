import { apiSlice } from '../api/apiSlice'

export const platformApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformDashboard: builder.query({
      query: () => '/api/platform/dashboard/summary',
      providesTags: ['PlatformDashboard'],
      refetchOnMountOrArgChange: true,
    }),
    getPlatformCrew: builder.query({
      query: () => '/api/platform/crew',
      providesTags: ['Crew'],
    }),
    getPlatformCrewById: builder.query({
      query: (id) => `/api/platform/crew/${id}`,
      providesTags: (r, e, id) => [{ type: 'Crew', id }],
    }),
    getCrewPerformance: builder.query({
      query: (id) => `/api/platform/crew/${id}/performance`,
      providesTags: (r, e, id) => [{ type: 'CrewPerformance', id }],
    }),
    createCrew: builder.mutation({
      query: (body) => ({ url: '/api/platform/crew', method: 'POST', body }),
      invalidatesTags: ['Crew'],
    }),
    deleteCrew: builder.mutation({
      query: (id) => ({ url: `/api/platform/crew/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Crew'],
    }),
    getPlatformMaintenanceFlags: builder.query({
      query: () => '/api/platform/maintenance/flags',
      providesTags: ['Maintenance'],
      refetchOnMountOrArgChange: true,
    }),
    assignCrewToFlag: builder.mutation({
      query: ({ id, crewId }) => ({
        url: `/api/platform/maintenance/flags/${id}/assign-crew`,
        method: 'PATCH',
        body: { crewId },
      }),
      invalidatesTags: ['Maintenance'],
    }),
  }),
})

export const {
  useGetPlatformDashboardQuery,
  useGetPlatformCrewQuery,
  useGetPlatformCrewByIdQuery,
  useGetCrewPerformanceQuery,
  useCreateCrewMutation,
  useDeleteCrewMutation,
  useGetPlatformMaintenanceFlagsQuery,
  useAssignCrewToFlagMutation,
} = platformApi
