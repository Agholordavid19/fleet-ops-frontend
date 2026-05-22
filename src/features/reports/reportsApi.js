import { apiSlice } from '../api/apiSlice'

export const reportsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUtilisationReport: builder.query({
            query: () => '/api/admin/reports/utilisation',
            providesTags: ['Reports'],
        }),
        getVehicleHealthReport: builder.query({
            query: () => '/api/admin/reports/vehicle-health',
            providesTags: ['Reports'],
        }),
    }),
})

export const {
    useGetUtilisationReportQuery,
    useGetVehicleHealthReportQuery,
} = reportsApi