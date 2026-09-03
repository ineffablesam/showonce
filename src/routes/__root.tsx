import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Toaster } from 'sileo'
import { useState } from 'react'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ShowOnce — demo once, agents complete it live',
      },
      {
        name: 'description',
        content:
          'Record a browser task once, share a handoff link, and let the recipient\'s agent complete it via WebMCP.',
      },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap',
      },
      ...(appCss ? [{ rel: 'stylesheet', href: appCss }] : []),
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster offset={{ top: 76 }} position="top-right" theme="light" />
      <Outlet />
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
