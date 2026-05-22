import { apiSlice } from '../api/apiSlice'

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (body) => ({ url: '/api/company/users', method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    getCompanyUsers: builder.query({
      query: () => '/api/company/users',
      providesTags: ['Users'],
    }),
    getUserById: builder.query({
      query: (id) => `/api/company/users/${id}`,
      providesTags: (r, e, id) => [{ type: 'Users', id }],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({ url: `/api/company/users/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: ['Users'],
    }),
    reactivateUser: builder.mutation({
      query: (id) => ({ url: `/api/company/users/${id}/reactivate`, method: 'PATCH' }),
      invalidatesTags: ['Users'],
    }),
    resetUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/api/company/users/${id}/reset-password`,
        method: 'PATCH',
        body: { newPassword },
      }),
    }),
    uploadUserMedia: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/users/${id}/media`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Users', id }],
    }),
    deleteUserMedia: builder.mutation({
      query: (id) => ({ url: `/api/admin/users/${id}/media`, method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Users', id }],
    }),
    getMyProfile: builder.query({
      query: () => '/api/users/me',
      providesTags: ['UserProfile'],
    }),
    updateMyProfile: builder.mutation({
      query: (body) => ({ url: '/api/users/me', method: 'PATCH', body }),
      invalidatesTags: ['UserProfile'],
    }),
    uploadMyMedia: builder.mutation({
      query: (body) => ({ url: '/api/users/me/media', method: 'PATCH', body }),
      invalidatesTags: ['UserProfile'],
    }),
    deleteMyMedia: builder.mutation({
      query: () => ({ url: '/api/users/me/media', method: 'DELETE' }),
      invalidatesTags: ['UserProfile'],
    }),
    getMileageLogs: builder.query({
      query: (vehicleId) => `/api/mileage-logs/vehicle/${vehicleId}`,
      providesTags: (r, e, vehicleId) => [{ type: 'MileageLogs', id: vehicleId }],
    }),
    logMileage: builder.mutation({
      query: (body) => ({ url: '/api/mileage-logs', method: 'POST', body }),
      invalidatesTags: ['MileageLogs', 'Vehicles'],
    }),
  }),
})

export const {
  useCreateUserMutation,
  useGetCompanyUsersQuery,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useResetUserPasswordMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadMyMediaMutation,
  useDeleteMyMediaMutation,
  useGetMileageLogsQuery,
  useLogMileageMutation,
} = usersApi
