import { apiSlice } from '../api/apiSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/public/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/api/auth/change-password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useChangePasswordMutation } = authApi
