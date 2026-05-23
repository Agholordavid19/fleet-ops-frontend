import { apiSlice } from '../api/apiSlice'

export const breakdownsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    reportBreakdown: builder.mutation({
      query: (body) => ({ url: '/api/breakdowns', method: 'POST', body }),
      invalidatesTags: ['Breakdowns'],
    }),
    getBreakdowns: builder.query({
      query: () => '/api/breakdowns',
      providesTags: ['Breakdowns'],
      refetchOnMountOrArgChange: true,
    }),
    getBreakdownById: builder.query({
      query: (id) => `/api/breakdowns/${id}`,
      providesTags: (r, e, id) => [{ type: 'Breakdowns', id }],
      refetchOnMountOrArgChange: true,
    }),
    dispatchReplacement: builder.mutation({
      query: ({ id, replacementVehicleId, staffId }) => ({
        url: `/api/breakdowns/${id}/dispatch-replacement`,
        method: 'PATCH',
        body: { replacementVehicleId, staffId },
      }),
      invalidatesTags: ['Breakdowns', 'Vehicles', 'Trips'],
    }),
    resolveBreakdown: builder.mutation({
      query: (id) => ({
        url: `/api/breakdowns/${id}/resolve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Breakdowns'],
    }),
    getPlatformBreakdowns: builder.query({
      query: () => '/api/platform/breakdowns',
      providesTags: ['Breakdowns'],
      refetchOnMountOrArgChange: true,
    }),
    dispatchCrew: builder.mutation({
      query: ({ id, crewId }) => ({
        url: `/api/platform/breakdowns/${id}/dispatch-crew`,
        method: 'PATCH',
        body: { crewId },
      }),
      invalidatesTags: ['Breakdowns'],
    }),
  }),
})

export const {
  useReportBreakdownMutation,
  useGetBreakdownsQuery,
  useGetBreakdownByIdQuery,
  useDispatchReplacementMutation,
  useResolveBreakdownMutation,
  useGetPlatformBreakdownsQuery,
  useDispatchCrewMutation,
} = breakdownsApi
