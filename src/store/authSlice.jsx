
import { createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'

const isTokenValid = (t) => {
    try {
        return jwtDecode(t).exp * 1000 > Date.now()
    } catch {
        return false
    }
}

const storedToken = localStorage.getItem('token')
const validToken = storedToken && isTokenValid(storedToken) ? storedToken : null
if (storedToken && !validToken) localStorage.removeItem('token')
const user = validToken ? jwtDecode(validToken) : null

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: validToken,
        role: user?.role ?? null,
        name: user?.name ?? null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.token = action.payload.token
            const decoded = jwtDecode(action.payload.token)
            state.role = decoded.role
            state.name = decoded.name
            localStorage.setItem('token', action.payload.token)
        },
        logout: (state) => {
            state.token = null
            state.role = null
            state.name = null
            localStorage.removeItem('token')
        },
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer