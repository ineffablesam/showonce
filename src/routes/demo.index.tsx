import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/')({
  beforeLoad: () => {
    throw redirect({
      to: '/demo/benefits/$section',
      params: { section: 'renewal' },
      search: { recording: undefined },
    })
  },
})
