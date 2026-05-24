import { apiSlice } from '../api/apiSlice'

export const vehiclesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query({
      query: () => '/api/vehicles',
      providesTags: (result) =>
          result
              ? [
                ...result.map((vehicle) => ({ type: 'Vehicles', id: vehicle.id })),
                { type: 'Vehicles', id: 'LIST' },
              ]
              : [{ type: 'Vehicles', id: 'LIST' }],
    }),
    getAvailableVehicles: builder.query({
      query: () => '/api/vehicles/available',
      providesTags: (result) =>
          result
              ? [
                ...result.map((vehicle) => ({ type: 'Vehicles', id: vehicle.id })),
                { type: 'Vehicles', id: 'LIST' },
              ]
              : [{ type: 'Vehicles', id: 'LIST' }],
    }),
    getVehicleById: builder.query({
      query: (id) => `/api/vehicles/${id}`,
      providesTags: (r, e, id) => [{ type: 'Vehicles', id }],
    }),
    getVehicleHealth: builder.query({
      query: (id) => `/api/vehicles/${id}/health`,
      providesTags: (r, e, id) => [{ type: 'VehicleHealth', id }],
      refetchOnMountOrArgChange: true,
    }),
    createVehicle: builder.mutation({
      query: (body) => ({ url: '/api/vehicles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Vehicles', id: 'LIST' }],
    }),
    updateMilestoneInterval: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/vehicles/${id}/milestone-interval`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Vehicles', id }],
    }),
    uploadVehicleMedia: builder.mutation({
      query: ({ id, url, publicId }) => ({
        url: `/api/vehicles/${id}/media`,
        method: 'POST',
        body: { imageUrl: url, imageId: publicId },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Vehicles', id }],
    }),
    bulkUploadVehicleMedia: builder.mutation({
      query: ({ id, media }) => ({
        url: `/api/vehicles/${id}/media/bulk`,
        method: 'POST',
        body: media.map(({ url, publicId }) => ({ imageUrl: url, imageId: publicId })),
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Vehicles', id }],
    }),
    deleteVehicleMedia: builder.mutation({
      query: ({ id, mediaId }) => ({
        url: `/api/vehicles/${id}/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Vehicles', id }],
    }),
  }),
})

export const {
  useGetVehiclesQuery,
  useGetAvailableVehiclesQuery,
  useGetVehicleByIdQuery,
  useGetVehicleHealthQuery,
  useCreateVehicleMutation,
  useUpdateMilestoneIntervalMutation,
  useUploadVehicleMediaMutation,
  useBulkUploadVehicleMediaMutation,
  useDeleteVehicleMediaMutation,
} = vehiclesApi