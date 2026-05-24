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
      providesTags: (result) =>
          result
              ? [
                ...result.map((crew) => ({ type: 'Crew', id: crew.id })),
                { type: 'Crew', id: 'LIST' },
              ]
              : [{ type: 'Crew', id: 'LIST' }],
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
      invalidatesTags: [{ type: 'Crew', id: 'LIST' }],
    }),
    deleteCrew: builder.mutation({
      query: (id) => ({ url: `/api/platform/crew/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Crew', id },
        { type: 'Crew', id: 'LIST' },
      ],
    }),
    getPlatformMaintenanceFlags: builder.query({
      query: () => '/api/platform/maintenance/flags',
      providesTags: (result) =>
          result
              ? [
                ...result.map((flag) => ({ type: 'Maintenance', id: flag.id })),
                { type: 'Maintenance', id: 'LIST' },
              ]
              : [{ type: 'Maintenance', id: 'LIST' }],
    }),
    assignCrewToFlag: builder.mutation({
      query: ({ id, crewId }) => ({
        url: `/api/platform/maintenance/flags/${id}/assign-crew`,
        method: 'PATCH',
        body: { crewId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Maintenance', id },
        { type: 'Maintenance', id: 'LIST' },
      ],
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