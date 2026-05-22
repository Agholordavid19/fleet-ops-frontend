import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createTestStore } from './store'
import ToastContainer from '../components/ui/Toast'

export function renderWithProviders(ui, { preloadedState = {}, route = '/', ...renderOptions } = {}) {
  const store = createTestStore(preloadedState)

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
          <ToastContainer />
        </MemoryRouter>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
