import '@testing-library/jest-dom'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './server'

// ── Framer Motion ─────────────────────────────────────────────────────────────
// vi.mock factories are hoisted before imports, so React must be imported
// asynchronously inside the factory to avoid "React is not defined".
vi.mock('framer-motion', async () => {
  const { default: React } = await import('react')

  const motionProxy = new Proxy({}, {
    get(_, tag) {
      return function MotionStub({
        children, initial, animate, exit, transition, variants,
        whileHover, whileTap, whileFocus, layout, layoutId,
        ...rest
      }) {
        return React.createElement(tag, rest, children)
      }
    },
  })

  return {
    motion: motionProxy,
    AnimatePresence: function AnimatePresence({ children }) {
      return children ?? null
    },
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (v) => v,
    useSpring: (v) => v,
    useTransform: () => 0,
  }
})

// ── MSW ───────────────────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
