import { createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'

const token = localStorage.getItem('token')
const user = token ? jwtDecode(token) : null

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token,
        role: user?.role ?? null,
        name: user?.name ?? null,
        email: user?.email ?? null,
    },
    reducers: {
        setCredentials: (state, action) => {
            const { token } = action.payload
            state.token = token
            const decoded = jwtDecode(token)
            state.role = decoded.role
            state.name = decoded.name
            state.email = decoded.email
            localStorage.setItem('token', token)
        },
        logout: (state) => {
            state.token = null
            state.role = null
            state.name = null
            state.email = null
            localStorage.removeItem('token')
        },
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer