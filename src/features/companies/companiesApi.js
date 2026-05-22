import { apiSlice } from '../api/apiSlice'

export const companiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerCompany: builder.mutation({
      query: (body) => ({
        url: '/api/public/companies/register',
        method: 'POST',
        body,
      }),
    }),
    getCompanyProfile: builder.query({
      query: () => '/api/company/profile',
      providesTags: ['CompanyProfile'],
    }),
    updateCompanyProfile: builder.mutation({
      query: (body) => ({ url: '/api/company/profile', method: 'PATCH', body }),
      invalidatesTags: ['CompanyProfile'],
    }),
    getPlatformCompanies: builder.query({
      query: () => '/api/platform/companies',
      providesTags: ['Companies'],
    }),
    getPlatformCompanyById: builder.query({
      query: (id) => `/api/platform/companies/${id}`,
      providesTags: (r, e, id) => [{ type: 'Companies', id }],
    }),
    approveCompany: builder.mutation({
      query: (id) => ({ url: `/api/platform/companies/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Companies'],
    }),
    rejectCompany: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/platform/companies/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Companies'],
    }),
    suspendCompany: builder.mutation({
      query: (id) => ({ url: `/api/platform/companies/${id}/suspend`, method: 'PATCH' }),
      invalidatesTags: ['Companies'],
    }),
    reactivateCompany: builder.mutation({
      query: (id) => ({ url: `/api/platform/companies/${id}/reactivate`, method: 'PATCH' }),
      invalidatesTags: ['Companies'],
    }),
  }),
})

export const {
  useRegisterCompanyMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useGetPlatformCompaniesQuery,
  useGetPlatformCompanyByIdQuery,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
  useSuspendCompanyMutation,
  useReactivateCompanyMutation,
} = companiesApi
