import { apiSlice } from '../api/apiSlice'

export const tripsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTrip: builder.mutation({
      query: (body) => ({ url: '/api/trip-requests', method: 'POST', body }),
      invalidatesTags: ['Trips'],
    }),
    getAllTrips: builder.query({
      query: () => '/api/trip-requests/all',
      providesTags: ['Trips'],
    }),
    getTrips: builder.query({
      query: () => '/api/trip-requests',
      providesTags: ['Trips'],
    }),
    getMyTrips: builder.query({
      query: () => '/api/trip-requests/my',
      providesTags: ['Trips'],
      refetchOnMountOrArgChange: true,
    }),
    getMyApprovedTrips: builder.query({
      query: () => '/api/trip-requests/my/approved',
      providesTags: ['Trips'],
      refetchOnMountOrArgChange: true,
    }),
    approveTrip: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Trips'],
    }),
    rejectTrip: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/trip-requests/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Trips'],
    }),
    completeTrip: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/complete`, method: 'PATCH' }),
      invalidatesTags: ['Trips'],
    }),
    cancelTrip: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Trips'],
    }),
    approveCancellation: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/approve-cancellation`, method: 'PATCH' }),
      invalidatesTags: ['Trips'],
    }),
    confirmCompletion: builder.mutation({
      query: (id) => ({ url: `/api/trip-requests/${id}/confirm-completion`, method: 'PATCH' }),
      invalidatesTags: ['Trips'],
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
