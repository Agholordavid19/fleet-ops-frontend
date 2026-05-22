import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: null,
  userId: null,
  name: null,
  email: null,
  role: null,
  userType: null,
  companyId: null,
  isAuthenticated: false,
  profilePictureUrl: null,
  profilePictureId: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token
      state.userId = payload.userId
      state.name = payload.name
      state.email = payload.email
      state.role = payload.role
      state.userType = payload.userType
      state.companyId = payload.companyId
      state.isAuthenticated = true
    },
    updateProfilePicture: (state, { payload }) => {
      state.profilePictureUrl = payload?.imageUrl ?? null
      state.profilePictureId = payload?.imageId ?? null
    },
    logout: (state) => {
      Object.assign(state, initialState)
    },
  },
})

export const { setCredentials, updateProfilePicture, logout } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => ({
  userId: state.auth.userId,
  name: state.auth.name,
  email: state.auth.email,
  role: state.auth.role,
  userType: state.auth.userType,
  companyId: state.auth.companyId,
  profilePictureUrl: state.auth.profilePictureUrl,
  profilePictureId: state.auth.profilePictureId,
})

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectUserRole = (state) => state.auth.role
export const selectCompanyId = (state) => state.auth.companyId
export const selectToken = (state) => state.auth.token
