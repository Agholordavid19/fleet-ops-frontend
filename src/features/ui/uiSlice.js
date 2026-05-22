import { createSlice } from '@reduxjs/toolkit'

let toastId = 0

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    activeModal: null,
    toasts: [],
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, { payload }) => {
      state.sidebarOpen = payload
    },
    openModal: (state, { payload }) => {
      state.activeModal = payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
    addToast: (state, { payload }) => {
      state.toasts.push({
        id: ++toastId,
        type: payload.type ?? 'info',
        message: payload.message,
        duration: payload.duration ?? 4000,
      })
    },
    removeToast: (state, { payload }) => {
      state.toasts = state.toasts.filter((t) => t.id !== payload)
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addToast,
  removeToast,
} = uiSlice.actions

export default uiSlice.reducer
