import { test, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

test('1+1', () => expect(1+1).toBe(2))
test('react renders', () => {
  const { container } = render(React.createElement('div', null, 'hello'))
  expect(container.textContent).toBe('hello')
})
