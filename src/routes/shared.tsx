import { Link, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../app/AppShell'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'

export const Route = createFileRoute('/shared')({ component: Shared })

function Shared() {
  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Recipient inbox</span>
            <h1>Shared with me</h1>
            <p>Seeded demo handoffs received from other people.</p>
          </div>
        </div>
        <div className="handoff-audit-grid">
          <Card>
            <span className="pill">Seeded demo</span>
            <span className="eyebrow">From Samuel</span>
            <h2>Renew dental coverage</h2>
            <p>A recipient-side handoff ready to review and adapt.</p>
            <Link
              className="text-link"
              params={{ publicToken: 'seedHandoffToken_1234567' }}
              search={{ preview: false, scenario: 'normal' }}
              to="/s/$publicToken"
            >
              Open ready handoff <Icon name="arrow" />
            </Link>
            <span className="pill pill--ready">Ready</span>
          </Card>
          <Card>
            <span className="pill">Seeded demo</span>
            <span className="eyebrow">From Support</span>
            <h2>Update account preferences</h2>
            <p>A completed recipient-side example retained for its audit trail.</p>
            <Link className="text-link" to="/activity">
              View activity <Icon name="arrow" />
            </Link>
            <span className="pill pill--ready">Completed</span>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
