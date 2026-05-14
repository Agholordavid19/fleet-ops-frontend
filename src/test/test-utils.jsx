import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/authSlice.jsx'

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  })
}

export function renderWithProviders(
  ui,
  { preloadedState = {}, store, initialEntries = ['/'], ...options } = {}
) {
  const testStore = store ?? createTestStore(preloadedState)

  function Wrapper({ children }) {
    return (
      <Provider store={testStore}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </Provider>
    )
  }

  return { store: testStore, ...render(ui, { wrapper: Wrapper, ...options }) }
}