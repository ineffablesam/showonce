import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../app/AppShell'
import { ActivityTable } from '../components/activity/ActivityTable'
import { Card, EmptyState } from '../components/ui/Card'
import { activityQuery } from '../lib/queries'

export const Route = createFileRoute('/activity')({ component: Activity })

function Activity() {
  const activity = useQuery(activityQuery)
  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading"><div><span className="eyebrow">Semantic audit</span><h1>Activity</h1><p>Human commands and real WebMCP invocations, clearly sourced.</p></div></div>
        {activity.isPending ? <div aria-label="Loading activity" className="page-loading"><span /></div> : activity.isError ? <Card className="error-state">Unable to load activity.</Card> : activity.data.length ? <Card><ActivityTable data={activity.data} /></Card> : <Card><EmptyState detail="Actions appear here as the connected flow runs." icon="activity" iconTone="green" title="No activity yet" /></Card>}
      </div>
    </AppShell>
  )
}
