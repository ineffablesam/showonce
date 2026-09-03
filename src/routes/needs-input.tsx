import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../app/AppShell'
import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { helpRequestsQuery } from '../lib/queries'

export const Route = createFileRoute('/needs-input')({ component: NeedsInput })

function NeedsInput() {
  const requests = useQuery(helpRequestsQuery)
  const open = requests.data?.filter((request) => request.status === 'open') ?? []
  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading"><div><span className="eyebrow">Human judgment</span><h1>Needs input</h1><p>Only material differences that automation must not decide.</p></div></div>
        {requests.isPending ? <div aria-label="Loading input queue" className="page-loading"><span /></div> : requests.isError ? <Card className="error-state">Unable to load requests.</Card> : open.length ? open.filter((request) => request.publicToken).map((request) => <Card className="queue-row" key={request.id}><span><Icon name="help" /></span><div><strong>Plan unavailable</strong><small>No recipient details shared</small></div><Link className="button button--ghost" params={{ publicToken: request.publicToken ?? '' }} to="/help/$publicToken">Review</Link></Card>) : <Card><EmptyState detail="Differences that need a person will appear here." title="Nothing needs input" /></Card>}
      </div>
    </AppShell>
  )
}
