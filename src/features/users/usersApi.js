import { apiSlice } from '../api/apiSlice'

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (body) => ({ url: '/api/company/users', method: 'POST', body }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
    getCompanyUsers: builder.query({
      query: () => '/api/company/users',
      providesTags: (result) =>
          result
              ? [
                ...result.map((user) => ({ type: 'Users', id: user.id })),
                { type: 'Users', id: 'LIST' },
              ]
              : [{ type: 'Users', id: 'LIST' }],
    }),
    getUserById: builder.query({
      query: (id) => `/api/company/users/${id}`,
      providesTags: (r, e, id) => [{ type: 'Users', id }],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({ url: `/api/company/users/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    reactivateUser: builder.mutation({
      query: (id) => ({ url: `/api/company/users/${id}/reactivate`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),
    resetUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/api/company/users/${id}/reset-password`,
        method: 'PATCH',
        body: { newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }],
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
    getAvailableCrew: builder.query({
      query: () => '/api/company/crew/available',
      providesTags: ['Crew'],
    }),
    getMileageLogs: builder.query({
      query: (vehicleId) => `/api/mileage-logs/vehicle/${vehicleId}`,
      providesTags: (r, e, vehicleId) => [{ type: 'MileageLogs', id: vehicleId }],
    }),
    logMileage: builder.mutation({
      query: (body) => ({ url: '/api/mileage-logs', method: 'POST', body }),
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: 'MileageLogs', id: vehicleId },
        { type: 'Vehicles', id: 'LIST' },
      ],
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
  useLazyGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadMyMediaMutation,
  useDeleteMyMediaMutation,
  useGetAvailableCrewQuery,
  useGetMileageLogsQuery,
  useLogMileageMutation,
} = usersApi