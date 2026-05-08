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
    tagTypes: ['Vehicles', 'Trips', 'Flags', 'Users', 'Reports'],
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
            query: (id) => `/vehicles/${id}/assignments`,
        }),
        createVehicle: builder.mutation({
            query: (body) => ({ url: '/vehicles', method: 'POST', body }),
            invalidatesTags: ['Vehicles'],
        }),

        // ── Trip Requests ─────────────────────────────────────
        getTripRequests: builder.query({
            query: () => '/trip-requests',
            providesTags: ['Trips'],
        }),
        createTripRequest: builder.mutation({
            query: (body) => ({ url: '/trip-requests', method: 'POST', body }),
            invalidatesTags: ['Trips'],
        }),
        approveTrip: builder.mutation({
            query: (id) => ({ url: `/trip-requests/${id}/approve`, method: 'PATCH' }),
            invalidatesTags: ['Trips'],
        }),
        rejectTrip: builder.mutation({
            query: (id) => ({ url: `/trip-requests/${id}/reject`, method: 'PATCH' }),
            invalidatesTags: ['Trips'],
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
} = fleetApi