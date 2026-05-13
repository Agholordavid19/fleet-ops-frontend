import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const fleetApi = createApi({
    reducerPath: 'fleetApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token
            if (token) headers.set('Authorization', `Bearer ${token}`)
            return headers
        },
    }),
    tagTypes: ['Vehicles', 'Trips', 'Flags', 'Users', 'Reports', 'Profile', 'ActivityLogs'],
    endpoints: (builder) => ({

        // ── Auth ──────────────────────────────────────────────
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({ url: '/auth/logout', method: 'POST' }),
        }),

        // ── Vehicles ──────────────────────────────────────────
        getVehicles: builder.query({
            query: () => '/vehicles',
            providesTags: ['Vehicles'],
        }),
        getVehicle: builder.query({
            query: (id) => `/vehicles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Vehicles', id }],
        }),
        getVehicleAssignments: builder.query({
            query: (id) => `/assignments/vehicle/${id}`,
        }),
        createVehicle: builder.mutation({
            query: (body) => ({ url: '/vehicles', method: 'POST', body }),
            invalidatesTags: ['Vehicles'],
        }),
        getAvailableVehicles: builder.query({
            query: () => '/vehicles/available',
            providesTags: ['Vehicles'],
        }),

        // ── Trip Requests ─────────────────────────────────────
        getTripRequests: builder.query({
            query: () => '/trip-requests',
            providesTags: ['Trips'],
        }),
        createTripRequest: builder.mutation({
            query: (body) => ({ url: '/trip-requests', method: 'POST', body }),
            invalidatesTags: ['Trips', 'Vehicles'],
        }),
        getMyTripRequests: builder.query({
            query: () => '/trip-requests/my',
            providesTags: ['Trips'],
        }),
        approveTrip: builder.mutation({
            query: (id) => ({ url: `/trip-requests/${id}/approve`, method: 'PATCH' }),
            invalidatesTags: ['Trips', 'Vehicles'],
        }),
        rejectTrip: builder.mutation({
            query: (id) => ({ url: `/trip-requests/${id}/reject`, method: 'PATCH' }),
            invalidatesTags: ['Trips', 'Vehicles'],
        }),

        // ── Mileage Logs ──────────────────────────────────────
        createMileageLog: builder.mutation({
            query: (body) => ({ url: '/mileage-logs', method: 'POST', body }),
            invalidatesTags: ['Vehicles'],
        }),

        // ── Maintenance Flags ─────────────────────────────────
        getMaintenanceFlags: builder.query({
            query: () => '/maintenance-flags',
            providesTags: ['Flags'],
        }),
        assignFlag: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/maintenance-flags/${id}/assign`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Flags'],
        }),
        updateFlagProgress: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/maintenance-flags/${id}/progress`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Flags'],
        }),
        resolveFlag: builder.mutation({
            query: (id) => ({
                url: `/maintenance-flags/${id}/resolve`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Flags'],
        }),

        // ── Admin ─────────────────────────────────────────────
        getUsers: builder.query({
            query: () => '/admin/users',
            providesTags: ['Users'],
        }),
        createUser: builder.mutation({
            query: (body) => ({ url: '/admin/users', method: 'POST', body }),
            invalidatesTags: ['Users'],
        }),
        getUtilisationReport: builder.query({
            query: () => '/admin/reports/utilisation',
            providesTags: ['Reports'],
        }),
        getVehicleHealthReport: builder.query({
            query: () => '/admin/reports/vehicle-health',
            providesTags: ['Reports'],
        }),

        // ── Profile ───────────────────────────────────────────
        getMyProfile: builder.query({
            query: () => '/users/me',
            providesTags: ['Profile'],
        }),
        updateMyProfile: builder.mutation({
            query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
            invalidatesTags: ['Profile'],
        }),
        setMyProfileMedia: builder.mutation({
            query: (body) => ({ url: '/users/me/media', method: 'PATCH', body }),
            invalidatesTags: ['Profile'],
        }),
        removeMyProfileMedia: builder.mutation({
            query: () => ({ url: '/users/me/media', method: 'DELETE' }),
            invalidatesTags: ['Profile'],
        }),

        changePassword: builder.mutation({
            query: (body) => ({
                url: '/auth/change-password',
                method: 'PATCH',
                body,
            }),
        }),
        getActivityLogs: builder.query({
            query: ({ plateNumber, date } = {}) => {
                const params = {}

                if (plateNumber) params.plateNumber = plateNumber
                if (date) params.date = date

                return {
                    url: '/admin/activity-logs',
                    params,
                }
            },
            providesTags: ['ActivityLogs'],
        }),
        deactivateUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/deactivate`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Users'],
        }),
        reactivateUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/reactivate`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Users'],
        }),
        getMyMaintenanceFlags: builder.query({
            query: () => '/maintenance-flags/my',
            providesTags: ['Flags'],
        }),

        markFlagDone: builder.mutation({
            query: (id) => ({
                url: `/maintenance-flags/${id}/done`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Flags'],
        }),

        approveFlag: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/maintenance-flags/${id}/approve`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Flags', 'Vehicles'],
        }),
        addVehicleMedia: builder.mutation({
            query: ({ id, media }) => ({
                url: `/vehicles/${id}/media`,
                method: 'POST',
                body: media,
            }),
            invalidatesTags: ['Vehicles'],
        }),
        removeVehicleMedia: builder.mutation({
            query: ({ id, mediaId }) => ({
                url: `/vehicles/${id}/media/${mediaId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicles'],
        }),
        getAllTripRequests: builder.query({
            query: () => '/trip-requests/all',
            providesTags: ['Trips'],
        }),

        getMyApprovedTripRequests: builder.query({
            query: () => '/trip-requests/my/approved',
            providesTags: ['Trips'],
        }),

        completeTrip: builder.mutation({
            query: ({ id, ...body }) => {
                const hasBody = Object.keys(body).length > 0

                return {
                    url: `/trip-requests/${id}/complete`,
                    method: 'PATCH',
                    ...(hasBody ? { body } : {}),
                }
            },
            invalidatesTags: ['Trips', 'Vehicles'],
        }),
        getMileageLogsByVehicle: builder.query({
            query: (vehicleId) => `/mileage-logs/vehicle/${vehicleId}`,
            providesTags: ['Vehicles'],
        }),
        getUserById: builder.query({
            query: (id) => `/admin/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'Users', id }],
        }),

        resetUserPassword: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/admin/users/${id}/reset-password`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Users'],
        }),

        setUserMedia: builder.mutation({
            query: ({ id, media }) => ({
                url: `/admin/users/${id}/media`,
                method: 'PATCH',
                body: media,
            }),
            invalidatesTags: ['Users'],
        }),

        removeUserMedia: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/media`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
        updateVehicleMilestoneInterval: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/vehicles/${id}/milestone-interval`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Vehicles'],
        }),
        getMaintenanceMessages: builder.query({
            query: (flagId) => `/maintenance-flags/${flagId}/messages`,
            providesTags: (result, error, flagId) => [{ type: 'Flags', id: `messages-${flagId}` }],
        }),

        sendMaintenanceMessage: builder.mutation({
            query: ({ flagId, ...body }) => ({
                url: `/maintenance-flags/${flagId}/messages`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { flagId }) => [
                { type: 'Flags', id: `messages-${flagId}` },
            ],
        }),

    }),
})

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetVehiclesQuery,
    useGetVehicleQuery,
    useGetVehicleAssignmentsQuery,
    useCreateVehicleMutation,
    useGetTripRequestsQuery,
    useCreateTripRequestMutation,
    useApproveTripMutation,
    useRejectTripMutation,
    useCreateMileageLogMutation,
    useGetMaintenanceFlagsQuery,
    useAssignFlagMutation,
    useUpdateFlagProgressMutation,
    useResolveFlagMutation,
    useGetUsersQuery,
    useCreateUserMutation,
    useGetUtilisationReportQuery,
    useGetVehicleHealthReportQuery,
    useGetAvailableVehiclesQuery,
    useGetMyTripRequestsQuery,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useSetMyProfileMediaMutation,
    useRemoveMyProfileMediaMutation,
    useChangePasswordMutation,
    useGetActivityLogsQuery,
    useDeactivateUserMutation,
    useReactivateUserMutation,
    useGetMyMaintenanceFlagsQuery,
    useMarkFlagDoneMutation,
    useApproveFlagMutation,
    useAddVehicleMediaMutation,
    useRemoveVehicleMediaMutation,
    useGetAllTripRequestsQuery,
    useGetMyApprovedTripRequestsQuery,
    useCompleteTripMutation,
    useGetMileageLogsByVehicleQuery,
    useGetUserByIdQuery,
    useResetUserPasswordMutation,
    useSetUserMediaMutation,
    useRemoveUserMediaMutation,
    useUpdateVehicleMilestoneIntervalMutation,
    useGetMaintenanceMessagesQuery,
    useSendMaintenanceMessageMutation,
} = fleetApi
