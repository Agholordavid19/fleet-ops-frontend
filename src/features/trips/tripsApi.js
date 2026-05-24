import { apiSlice } from '../api/apiSlice'

export const tripsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTrip: builder.mutation({
      query: (body) => ({ url: '/api/trip-requests', method: 'POST', body }),
      invalidatesTags: [{ type: 'Trips', id: 'LIST' }],
    }),
    getAllTrips: builder.query({
      query: () => '/api/trip-requests/all',
      providesTags: (result) =>
          result
              ? [
                ...result.map((trip) => ({ type: 'Trips', id: trip.id })),
                { type: 'Trips', id: 'LIST' },
              ]
              : [{ type: 'Trips', id: 'LIST' }],
    }),
    getTrips: builder.query({
      query: () => '/api/trip-requests',
      providesTags: (result) =>
          result
              ? [
                ...result.map((trip) => ({ type: 'Trips', id: trip.id })),
                { type: 'Trips', id: 'LIST' },
              ]
              : [{ type: 'Trips', id: 'LIST' }],
    }),
    getMyTrips: builder.query({
      query: () => '/api/trip-requests/my',
      providesTags: (result) =>
          result
              ? [
                ...result.map((trip) => ({ type: 'Trips', id: trip.id })),
                { type: 'Trips', id: 'LIST' },
              ]
              : [{ type: 'Trips', id: 'LIST' }],
    }),
    getMyApprovedTrips: builder.query({
      query: () => '/api/trip-requests/my/approved',
      providesTags: (result) =>
          result
              ? [
                ...result.map((trip) => ({ type: 'Trips', id: trip.id })),
                { type: 'Trips', id: 'LIST' },
              ]
              : [{ type: 'Trips', id: 'LIST' }],
    }),
    approveTrip: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trips', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
    rejectTrip: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/trip-requests/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Trips', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
    completeTrip: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/complete`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trips', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
    cancelTrip: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trips', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
    approveCancellation: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/approve-cancellation`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trips', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
    confirmCompletion: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/confirm-completion`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trips', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useCreateTripMutation,
  useGetAllTripsQuery,
  useGetTripsQuery,
  useGetMyTripsQuery,
  useGetMyApprovedTripsQuery,
  useApproveTripMutation,
  useRejectTripMutation,
  useCompleteTripMutation,
  useCancelTripMutation,
  useApproveCancellationMutation,
  useConfirmCompletionMutation,
} = tripsApi