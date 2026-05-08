import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./authSlice.jsx";
import {fleetApi} from '../apis/fleetApi.jsx'

const store = configureStore({
    reducer: {
        auth: authReducer,
        [fleetApi.reducerPath]: fleetApi.reducer
    },
    middleware:(getDefaultMiddleware) => (
        getDefaultMiddleware().concat(fleetApi.middleware)
    )
})

export default store