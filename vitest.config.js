import { defineConfig } from 'vitest/config'

// Dedicated Vitest config — uses esbuild's native automatic JSX transform
// instead of @vitejs/plugin-react (Babel). This avoids the "React is not
// defined" error caused by the plugin not applying its transform to test files
// in v6 + Vite 8.
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/main.jsx', 'src/App.jsx'],
    },
  },
})
