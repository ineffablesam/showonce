import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { AppShell } from '../app/AppShell'
import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import type { HelpRequest } from '../domain/model'
import { helpRequestsQuery } from '../lib/queries'

export const Route = createFileRoute('/needs-input')({ component: NeedsInput })

function requestTitle(request: HelpRequest): string {
  if (request.detail === 'material_price_change') {
    return 'Regional pricing differs'
  }
  return 'Demonstrated plan unavailable'
}

function requestDetail(): string {
  return 'No recipient address or credentials were shared — only the decision needed.'
}

function NeedsInput() {
  const requests = useQuery(helpRequestsQuery)
  const open = requests.data?.filter((request) => request.status === 'open') ?? []

  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Human judgment</span>
            <h1>Needs input</h1>
            <p>
              When an agent hits a material difference — like regional pricing or
              a missing plan — ShowOnce pauses and asks you to decide.
            </p>
          </div>
        </div>
        {requests.isPending ? (
          <div aria-label="Loading input queue" className="page-loading">
            <span />
          </div>
        ) : requests.isError ? (
          <Card className="error-state">Unable to load requests.</Card>
        ) : open.length ? (
          open
            .filter((request) => request.publicToken)
            .map((request) => (
              <Card className="queue-row" key={request.id}>
                <span>
                  <Icon name="help" />
                </span>
                <div>
                  <strong>{requestTitle(request)}</strong>
                  <small>{requestDetail()}</small>
                </div>
                <Link
                  className="button button--ghost"
                  params={{ publicToken: request.publicToken ?? '' }}
                  to="/help/$publicToken"
                >
                  Review
                </Link>
              </Card>
            ))
        ) : (
          <Card>
            <EmptyState
              detail="When a recipient's agent hits regional pricing or a missing plan, the pause appears here and you get a browser notification."
              icon="help"
              iconTone="amber"
              title="Nothing needs input"
            />
          </Card>
        )}
      </div>
    </AppShell>
  )
}
