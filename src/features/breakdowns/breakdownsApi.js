import { apiSlice } from '../api/apiSlice'

export const breakdownsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    reportBreakdown: builder.mutation({
      query: (body) => ({ url: '/api/breakdowns', method: 'POST', body }),
      invalidatesTags: [{ type: 'Breakdowns', id: 'LIST' }],
    }),
    getBreakdowns: builder.query({
      query: () => '/api/breakdowns',
      providesTags: (result) =>
          result
              ? [
                ...result.map((b) => ({ type: 'Breakdowns', id: b.id })),
                { type: 'Breakdowns', id: 'LIST' },
              ]
              : [{ type: 'Breakdowns', id: 'LIST' }],
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
      invalidatesTags: (result, error, { id }) => [
        { type: 'Breakdowns', id },
        { type: 'Breakdowns', id: 'LIST' },
        { type: 'Vehicles', id: 'LIST' },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
    resolveBreakdown: builder.mutation({
      query: (id) => ({
        url: `/api/breakdowns/${id}/resolve`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Breakdowns', id },
        { type: 'Breakdowns', id: 'LIST' },
      ],
    }),
    getPlatformBreakdowns: builder.query({
      query: () => '/api/platform/breakdowns',
      providesTags: (result) =>
          result
              ? [
                ...result.map((b) => ({ type: 'Breakdowns', id: b.id })),
                { type: 'Breakdowns', id: 'LIST' },
              ]
              : [{ type: 'Breakdowns', id: 'LIST' }],
      refetchOnMountOrArgChange: true,
    }),
    dispatchCrew: builder.mutation({
      query: ({ id, crewId }) => ({
        url: `/api/platform/breakdowns/${id}/dispatch-crew`,
        method: 'PATCH',
        body: { crewId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Breakdowns', id },
        { type: 'Breakdowns', id: 'LIST' },
      ],
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