import { Link } from '@tanstack/react-router'

import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { useWorkspaceOverview } from '../lib/queries'
import { useAppWebMCP } from './AppShell'
import { getWebMCPPresentation } from './TopBar'

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

export function DashboardPage() {
  const overview = useWorkspaceOverview()
  const webmcp = useAppWebMCP()
  const webmcpPresentation = getWebMCPPresentation(webmcp)

  if (overview.isPending) {
    return (
      <div aria-label="Loading workspace" className="page-loading">
        <span />
        <span />
        <span />
      </div>
    )
  }

  if (overview.isError) {
    return (
      <Card className="error-state">
        <strong>We couldn’t load this workspace.</strong>
        <p>Your local data is unchanged. Refresh to try again.</p>
      </Card>
    )
  }

  const procedures = overview.procedures.data ?? []
  const handoffs = overview.handoffs.data ?? []
  const activity = overview.activity.data ?? []
  const recordings = overview.recordings.data ?? []
  const openRequests =
    overview.helpRequests.data?.filter((request) => request.status === 'open') ??
    []
  const finishedRecordings = recordings.filter(
    (recording) => recording.status === 'finished',
  ).length
  const completionRate = recordings.length
    ? Math.round((finishedRecordings / recordings.length) * 100)
    : 0
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{today}</span>
          <h1>Good evening, Alex.</h1>
          <p>Pick up where you left off or capture something worth repeating.</p>
        </div>
        <div className="page-heading__signal">
          <span>Recording completion</span>
          <strong>{completionRate}%</strong>
          <small>{finishedRecordings} of {recordings.length} finished</small>
        </div>
      </div>

      <section aria-labelledby="overview-title">
        <div className="section-heading">
          <h2 id="overview-title">Overview</h2>
          <span>Live workspace</span>
        </div>
        <div className="metric-grid">
          <Card className="metric-card">
            <span className="metric-card__icon metric-card__icon--ink">
              <Icon name="record" />
            </span>
            <div>
              <small>Reusable procedures</small>
              <strong>{procedures.length}</strong>
              <span>Ready to hand off</span>
            </div>
          </Card>
          <Card className="metric-card">
            <span className="metric-card__icon metric-card__icon--green">
              <Icon name="share" />
            </span>
            <div>
              <small>Active handoffs</small>
              <strong>{handoffs.length}</strong>
              <span>Across your workspace</span>
            </div>
          </Card>
          <Card className="metric-card">
            <span className="metric-card__icon metric-card__icon--amber">
              <Icon name="help" />
            </span>
            <div>
              <small>Needs input</small>
              <strong>{openRequests.length}</strong>
              <span>{openRequests.length ? 'Judgment waiting' : 'Queue clear'}</span>
            </div>
          </Card>
          <Card className="metric-card">
            <span className="metric-card__icon metric-card__icon--blue">
              <Icon name="bolt" />
            </span>
            <div>
              <small>WebMCP tools</small>
              <strong>{webmcp.registeredToolNames.length}</strong>
              <span>{webmcpPresentation.shortLabel}</span>
            </div>
          </Card>
        </div>
      </section>

      <div className="dashboard-grid">
        <section aria-labelledby="continue-title">
          <div className="section-heading">
            <h2 id="continue-title">Continue working</h2>
            <Link to="/recordings">View all</Link>
          </div>
          <Card className="continue-card">
            {procedures.length ? (
              procedures.slice(0, 2).map((procedure) => (
                <Link
                  className="work-row"
                  key={procedure.id}
                  to="/recordings"
                >
                  <span className="work-row__icon">
                    <Icon name="record" />
                  </span>
                  <span className="work-row__content">
                    <strong>{procedure.title}</strong>
                    <small>Procedure · Updated {formatDate(procedure.createdAt)}</small>
                  </span>
                  <span className="pill pill--ready">Ready</span>
                  <Icon name="arrow" />
                </Link>
              ))
            ) : (
              <EmptyState
                detail="Record a workflow to make it safely repeatable."
                title="Nothing in progress"
              />
            )}
            {handoffs.slice(0, 1).map((handoff) => (
              <Link className="work-row" key={handoff.id} to="/handoffs">
                <span className="work-row__icon work-row__icon--green">
                  <Icon name="share" />
                </span>
                <span className="work-row__content">
                  <strong>{handoff.title}</strong>
                  <small>Handoff · Shared {formatDate(handoff.createdAt)}</small>
                </span>
                <span className="pill">Shared</span>
                <Icon name="arrow" />
              </Link>
            ))}
          </Card>
        </section>

        <section aria-labelledby="input-title">
          <div className="section-heading">
            <h2 id="input-title">Needs your input</h2>
            <Link to="/needs-input">View queue</Link>
          </div>
          <Card className="input-card">
            {openRequests.length ? (
              <>
                <span className="input-card__icon"><Icon name="help" /></span>
                <div>
                  <span className="eyebrow">Plan difference</span>
                  <h3>Benefits renewal needs a judgment call</h3>
                  <p>The demonstrated plan is unavailable. No recipient-specific values are shared.</p>
                  <Link className="text-link" to="/needs-input">Review difference <Icon name="arrow" /></Link>
                </div>
              </>
            ) : (
              <EmptyState detail="Material differences will pause here." title="Nothing needs input" />
            )}
          </Card>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid--bottom">
        <section aria-labelledby="activity-title">
          <div className="section-heading">
            <h2 id="activity-title">Recent activity</h2>
            <Link to="/activity">Open audit trail</Link>
          </div>
          <Card className="activity-card">
            {activity.length ? (
              activity.slice(0, 3).map((event) => (
                <div className="activity-row" key={event.id}>
                  <span className="activity-row__dot" />
                  <strong>{event.toolName ?? event.kind}</strong>
                  <small>{event.outcome ?? event.source}</small>
                </div>
              ))
            ) : (
              <EmptyState
                detail="Human actions and real WebMCP invocations will appear here."
                title="No activity yet"
              />
            )}
          </Card>
        </section>

        <section aria-labelledby="webmcp-title">
          <div className="section-heading">
            <h2 id="webmcp-title">WebMCP</h2>
            <Link to="/webmcp">Inspector</Link>
          </div>
          <Card className="webmcp-card">
            <span className="webmcp-card__glyph">
              <Icon name="bolt" />
            </span>
            <div>
              <strong>WebMCP status: {webmcpPresentation.shortLabel}</strong>
              <p>{webmcpPresentation.detail}</p>
            </div>
            <span
              className={`pill ${webmcp.status === 'available' ? 'pill--ready' : ''}`}
            >
              {webmcpPresentation.shortLabel}
            </span>
          </Card>
        </section>
      </div>
    </div>
  )
}
