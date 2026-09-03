import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '../app/AppShell'
import { Card } from '../components/ui/Card'
import { repositories } from '../domain/repositories/appRepositories'
import { resetDemo } from '../domain/repositories/seed'

export const Route = createFileRoute('/settings')({ component: Settings })

function Settings() {
  const queryClient = useQueryClient()
  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading"><div><span className="eyebrow">Demo workspace</span><h1>Settings</h1><p>Local product-demo controls. Account management is not part of this build.</p></div></div>
        <Card className="settings-card"><div><strong>Reset seeded demo data</strong><p>Restores Samuel, the recipient demo account, procedures, and activity to their initial local state.</p></div><button className="button button--ghost" onClick={() => void resetDemo(repositories).then(() => queryClient.invalidateQueries())} type="button">Reset demo</button></Card>
      </div>
    </AppShell>
  )
}
