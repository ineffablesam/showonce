// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getRouter } from '../router'
import { repositories } from '../domain/repositories/appRepositories'
import { resetDemo } from '../domain/repositories/seed'

window.scrollTo = () => {}
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true
}
HTMLDialogElement.prototype.close = function close() {
  this.open = false
  this.dispatchEvent(new Event('close'))
}

beforeEach(() => {
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    writable: true,
    value: {
      permission: 'granted',
      requestPermission: vi.fn(async () => 'granted'),
    },
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: undefined,
  })
})

async function renderRoute(path: string) {
  const router = getRouter({
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  render(<RouterProvider router={router} />)
  await waitFor(() => expect(router.state.status).toBe('idle'))
  return router
}

async function openWorkspace(
  user: ReturnType<typeof userEvent.setup>,
  username = 'demo',
) {
  await user.click(screen.getByRole('button', { name: /open workspace/i }))
  await user.type(screen.getByLabelText(/^username$/i), username)
  await user.click(
    screen.getByRole('button', {
      name: new RegExp(`open ${username}`, 'i'),
    }),
  )
  await waitFor(() =>
    expect(screen.getByRole('navigation', { name: /workspace/i })).toBeTruthy(),
  )
}

async function renderWorkspace(path = '/app') {
  const user = userEvent.setup()
  const router = await renderRoute('/')
  await openWorkspace(user)
  if (path !== '/app') {
    await act(async () => {
      await router.navigate({ to: path })
    })
    await waitFor(() => expect(router.state.status).toBe('idle'))
  }
  return { router, user }
}

async function selectNorthstarTargetApp(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole('button', { name: /select the app/i }))
  await user.click(
    screen.getByRole('option', { name: /northstar benefits demo/i }),
  )
}

describe('ShowOnce product routes', () => {
  it('redirects the dashboard alias to the workspace', async () => {
    const user = userEvent.setup()
    const router = await renderRoute('/')
    await openWorkspace(user)
    await act(async () => {
      await router.navigate({ to: '/dashboard' })
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/app'))
  })

  it('enters the Northstar Benefits demo from its stable route', async () => {
    const router = await renderRoute('/demo')
    expect(router.state.location.pathname).toBe('/demo/benefits/renewal')
  })

  it('presents a product-first landing page with working entry points', async () => {
    await renderRoute('/')

    expect(
      screen.getByRole('heading', {
        name: /walk through it once\. agents complete it live\./i,
      }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: /open workspace/i })).toBeTruthy()
  })

  it('renders dashboard navigation, seeded work, and honest WebMCP status', async () => {
    await renderWorkspace('/app')

    expect(screen.getByRole('navigation', { name: /workspace/i })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Overview' }).getAttribute('href'),
    ).toBe('/app')
    expect(screen.getByText('Renew annual benefits')).toBeTruthy()
    expect(screen.getByText('Annual benefits renewal')).toBeTruthy()
    expect(await screen.findByText('WebMCP unavailable')).toBeTruthy()
    expect(
      screen.getByLabelText(/browser does not expose document\.modelcontext/i),
    ).toBeTruthy()
  })

  it('creates a real recording and enters the connected benefits app', async () => {
    const { user, router } = await renderWorkspace('/app')

    await user.click(screen.getByRole('button', { name: /new showonce/i }))
    expect(screen.getByRole('dialog', { name: /new showonce/i })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /create showonce/i }))
    expect(await screen.findByText('Give this ShowOnce a name.')).toBeTruthy()

    await user.type(screen.getByLabelText(/showonce name/i), 'Quarterly close')
    await selectNorthstarTargetApp(user)
    await user.click(screen.getByRole('button', { name: /create showonce/i }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/demo/benefits/renewal'),
    )
    expect(router.state.location.search.recording).toBeTruthy()
    expect((await screen.findAllByText(/northstar benefits/i)).length).toBeGreaterThan(0)
    expect(await screen.findByText('Actions captured')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /finish showing/i }).hasAttribute('disabled'),
    ).toBe(true)
  })

  it('opens and closes an accessible mobile navigation drawer', async () => {
    const { user } = await renderWorkspace('/app')

    const trigger = screen.getByRole('button', { name: /open navigation/i })
    await user.click(trigger)
    expect(
      screen
        .getByRole('dialog', { name: /workspace navigation/i })
        .classList.contains('sidebar--open'),
    ).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    await user.click(screen.getAllByRole('button', { name: /close navigation/i })[0])
    expect(
      screen
        .getByRole('complementary', { name: /workspace navigation/i })
        .classList.contains('sidebar--open'),
    ).toBe(false)
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('automatically captures a real Northstar Benefits walkthrough with no manual step picking', async () => {
    await resetDemo(repositories)
    const { user, router } = await renderWorkspace('/app')
    await user.click(screen.getByRole('button', { name: /new showonce/i }))
    await user.type(
      screen.getByLabelText(/showonce name/i),
      'Renew dental coverage',
    )
    await selectNorthstarTargetApp(user)
    await user.click(screen.getByRole('button', { name: /create showonce/i }))

    await user.click(await screen.findByRole('button', { name: /review renewal/i }))
    await user.click(await screen.findByRole('button', { name: /manage coverage/i }))
    await user.click(await screen.findByRole('radio', { name: /^annual$/i }))
    await user.click(screen.getByRole('button', { name: /^continue$/i }))
    await user.click(
      await screen.findByRole('button', { name: /confirm address is current/i }),
    )
    await user.click(screen.getByRole('button', { name: /^continue$/i }))
    await user.click(await screen.findByRole('checkbox', { name: /paperless/i }))
    await user.click(screen.getByRole('button', { name: /^continue$/i }))
    await user.click(await screen.findByRole('button', { name: /^submit renewal$/i }))

    expect(await screen.findByText('Coverage renewed.')).toBeTruthy()
    await user.click(await screen.findByRole('button', { name: /finish showing/i }))
    await waitFor(() =>
      expect(router.state.location.pathname.startsWith('/recordings/')).toBe(
        true,
      ),
    )
    expect(await screen.findByText(/7 meaningful actions captured/i)).toBeTruthy()
    await user.type(screen.getByLabelText(/^recipient$/i), 'Jordan')
    await user.click(
      await screen.findByRole('button', { name: /create recipient link/i }),
    )
    await waitFor(() =>
      expect(router.state.location.pathname.startsWith('/handoffs/')).toBe(true),
    )
    const recipientToken = router.state.location.pathname.split('/').at(-1)
    if (!recipientToken) throw new Error('Recipient token missing')
    await act(async () => {
      await router.navigate({
        to: '/s/$publicToken',
        params: { publicToken: recipientToken },
        search: { preview: false, scenario: 'normal' },
      })
    })
    await user.click(await screen.findByRole('button', { name: /open task/i }))
    expect(await screen.findByText('Welcome, Jordan')).toBeTruthy()
    await user.click(
      await screen.findByRole('button', { name: /choose gold at \$142/i }),
    )
    await user.click(
      await screen.findByRole('checkbox', {
        name: /i am jordan and i approve/i,
      }),
    )
    await user.click(
      screen.getByRole('button', { name: /confirm & submit/i }),
    )

    expect(await screen.findByText(/jordan’s plan is renewed/i)).toBeTruthy()
    expect((await repositories.accounts.get('recipient-normal'))?.submittedAt).not.toBe(
      null,
    )
  })

  it('loads a token-only handoff and reacts to a real compare tool call', async () => {
    await resetDemo(repositories)
    const handoff = (await repositories.handoffs.list())[0]
    if (!handoff.publicToken) throw new Error('Seed handoff token missing')
    const tools: WebMCP.ModelContextTool[] = []
    const markOpened = vi.spyOn(repositories.handoffs, 'markOpened')
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: WebMCP.ModelContextTool) => {
          tools.push(tool)
        },
      },
    })

    await renderRoute(`/s/${handoff.publicToken}?scenario=normal`)
    expect(markOpened).toHaveBeenCalledWith(handoff.publicToken)
    expect(await screen.findByText(handoff.title)).toBeTruthy()
    await waitFor(() =>
      expect(new Set(tools.map(({ name }) => name)).size).toBe(12),
    )
    const compare = [...tools].reverse().find(
      ({ name }) => name === 'showonce_compare_to_handoff',
    )
    await act(async () => {
      await compare?.execute({}, { signal: new AbortController().signal })
    })
    expect(await screen.findByText('Adapted for you')).toBeTruthy()
  })

  it('renders sender preview without binding or registering mutating tools', async () => {
    await resetDemo(repositories)
    const handoff = (await repositories.handoffs.list())[0]
    if (!handoff.publicToken) throw new Error('Seed handoff token missing')
    const markOpened = vi.spyOn(repositories.handoffs, 'markOpened')
    const tools: WebMCP.ModelContextTool[] = []
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: WebMCP.ModelContextTool) => {
          tools.push(tool)
        },
      },
    })

    await renderRoute(
      `/s/${handoff.publicToken}?scenario=normal&preview=true`,
    )

    expect(await screen.findByText('DEMO PREVIEW')).toBeTruthy()
    expect(markOpened).not.toHaveBeenCalled()
    expect(tools).toHaveLength(0)
    expect(
      screen.getByRole('status', {
        name: /webmcp tools are paused in read-only preview/i,
      }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: /start live adaptation/i })
        .getAttribute('href'),
    ).toContain(`/s/${handoff.publicToken}`)
  })

  it('keeps a failed atomic completion retryable in the recipient UI', async () => {
    await resetDemo(repositories)
    const handoff = (await repositories.handoffs.list())[0]
    if (!handoff.publicToken) throw new Error('Seed handoff token missing')
    const user = userEvent.setup()
    await renderRoute(`/s/${handoff.publicToken}?scenario=normal`)

    await user.click(await screen.findByRole('button', { name: /open task/i }))
    await user.click(
      await screen.findByRole('button', { name: /choose gold at \$142/i }),
    )
    await user.click(
      await screen.findByRole('checkbox', {
        name: /i am the recipient and i approve/i,
      }),
    )
    const complete = vi
      .spyOn(repositories.handoffs, 'complete')
      .mockRejectedValueOnce(new Error('temporary network failure'))

    await user.click(
      screen.getByRole('button', { name: /confirm & submit/i }),
    )
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Completion failed. Your renewal was not submitted; please retry.',
    )
    expect((await repositories.accounts.get('recipient-normal'))?.submittedAt).toBeNull()

    await user.click(
      screen.getByRole('button', { name: /confirm & submit/i }),
    )
    expect(complete).toHaveBeenCalledTimes(2)
    expect(await screen.findByText(/the recipient’s plan is renewed/i)).toBeTruthy()
  })

  it('copies the live recipient link without any preview mode', async () => {
    await resetDemo(repositories)
    const handoff = (await repositories.handoffs.list())[0]
    if (!handoff.publicToken) throw new Error('Seed handoff token missing')

    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)

    const { user, router } = await renderWorkspace('/app')
    await act(async () => {
      await router.navigate({ to: '/handoffs/$id', params: { id: handoff.publicToken } })
    })
    await waitFor(() => expect(router.state.status).toBe('idle'))

    expect(screen.getByText(`/s/${handoff.publicToken}?scenario=normal`)).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: /open recipient view/i }),
    ).toBeNull()
    expect(
      screen.queryByRole('link', { name: /preview scenario/i }),
    ).toBeNull()

    await user.click(screen.getByRole('button', { name: /copy link/i }))

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(`/s/${handoff.publicToken}?scenario=normal`),
    )
    expect(await screen.findByRole('button', { name: /^copied$/i })).toBeTruthy()
  })
})
