// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { WebMCPStatus } from './TopBar'

afterEach(cleanup)

describe('WebMCPStatus', () => {
  it.each([
      ['registering', 'WebMCP registering'],
    ['available', 'WebMCP ready'],
    ['unavailable', 'WebMCP unavailable'],
    ['error', 'WebMCP error'],
  ] as const)('renders the real %s lifecycle state', (status, label) => {
    render(
      <WebMCPStatus
        state={{
          status,
          registeredToolNames:
            status === 'available' ? ['showonce.list_procedures'] : [],
          ...(status === 'error' ? { error: new Error('registration failed') } : {}),
        }}
      />,
    )

    expect(screen.getByText(label)).toBeTruthy()
  })
})
