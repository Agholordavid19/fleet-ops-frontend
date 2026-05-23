import { apiSlice } from '../api/apiSlice'

export const maintenanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMaintenanceFlag: builder.mutation({
      query: (body) => ({ url: '/api/maintenance/flags', method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    getMaintenanceFlags: builder.query({
      query: () => '/api/maintenance/flags',
      providesTags: ['Maintenance'],
      refetchOnMountOrArgChange: true,
    }),
    getMyMaintenanceFlags: builder.query({
      query: () => '/api/maintenance/flags/my',
      providesTags: ['Maintenance'],
      refetchOnMountOrArgChange: true,
    }),
    getMaintenanceFlagById: builder.query({
      query: (id) => `/api/maintenance/flags/${id}`,
      providesTags: (r, e, id) => [{ type: 'Maintenance', id }],
      refetchOnMountOrArgChange: true,
    }),
    getVehicleMaintenanceFlags: builder.query({
      query: (vehicleId) => `/api/maintenance/flags/vehicle/${vehicleId}`,
      providesTags: ['Maintenance'],
    }),
    submitQuotation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/maintenance/flags/${id}/quotation`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }, 'Maintenance'],
    }),
    reviseQuotation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/maintenance/flags/${id}/quotation/revise`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }, 'Maintenance'],
    }),
    approveQuote: builder.mutation({
      query: (id) => ({
        url: `/api/maintenance/flags/${id}/approve-quote`,
        method: 'PATCH',
      }),
      invalidatesTags: (r, e, id) => [{ type: 'Maintenance', id }, 'Maintenance'],
    }),
    rejectQuote: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/maintenance/flags/${id}/reject-quote`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }, 'Maintenance'],
    }),
    updateProgress: builder.mutation({
      query: ({ id, progressNotes }) => ({
        url: `/api/maintenance/flags/${id}/progress`,
        method: 'PATCH',
        body: { progressNotes },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }],
    }),
    markDone: builder.mutation({
      query: (id) => ({
        url: `/api/maintenance/flags/${id}/done`,
        method: 'PATCH',
      }),
      invalidatesTags: (r, e, id) => [{ type: 'Maintenance', id }, 'Maintenance'],
    }),
    resolveFlag: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/maintenance/flags/${id}/resolve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }, 'Maintenance', 'Vehicles'],
    }),
    submitRating: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/maintenance/flags/${id}/ratings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }],
    }),
    getFlagMessages: builder.query({
      query: (id) => `/api/maintenance/flags/${id}/messages`,
      providesTags: (r, e, id) => [{ type: 'MaintenanceMessages', id }],
      refetchOnMountOrArgChange: true,
    }),
    sendFlagMessage: builder.mutation({
      query: ({ id, message }) => ({
        url: `/api/maintenance/flags/${id}/messages`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'MaintenanceMessages', id }],
    }),
    assignCrewToFlag: builder.mutation({
      query: ({ id, crewId }) => ({
        url: `/api/maintenance/flags/${id}/assign`,
        method: 'PATCH',
        body: { crewId },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Maintenance', id }, 'Maintenance'],
    }),
  }),
})

export const {
  useCreateMaintenanceFlagMutation,
  useGetMaintenanceFlagsQuery,
  useGetMyMaintenanceFlagsQuery,
  useGetMaintenanceFlagByIdQuery,
  useGetVehicleMaintenanceFlagsQuery,
  useSubmitQuotationMutation,
  useReviseQuotationMutation,
  useApproveQuoteMutation,
  useRejectQuoteMutation,
  useUpdateProgressMutation,
  useMarkDoneMutation,
  useResolveFlagMutation,
  useSubmitRatingMutation,
  useGetFlagMessagesQuery,
  useSendFlagMessageMutation,
  useAssignCrewToFlagMutation,
} = maintenanceApi
