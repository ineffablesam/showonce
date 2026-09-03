import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '../app/AppShell'
import { DashboardPage } from '../app/DashboardPage'

export const Route = createFileRoute('/app')({
  component: AppRoute,
})

function AppRoute() {
  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  )
}
