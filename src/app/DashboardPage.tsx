import { Link } from '@tanstack/react-router'

import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import {
  formatHandoffStatus,
  handoffStatusPillClass,
  isActiveHandoff,
  sortHandoffsByRecency,
} from '../lib/handoffDashboard'
import { useWorkspaceOverview } from '../lib/queries'
import { useWorkspaceSession } from '../hooks/useWorkspaceSession'
import { formatUsernameLabel } from '../lib/workspaceUsername'
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
  const session = useWorkspaceSession()
  const webmcp = useAppWebMCP()
  const webmcpPresentation = getWebMCPPresentation(webmcp)
  const usernameLabel = formatUsernameLabel(session.data?.username ?? 'there')

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
  const activeHandoffs = sortHandoffsByRecency(handoffs.filter(isActiveHandoff))
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
    : procedures.length
      ? 100
      : 0
  const completionDetail = recordings.length
    ? `${finishedRecordings} of ${recordings.length} finished`
    : procedures.length
      ? `${procedures.length} procedure${procedures.length === 1 ? '' : 's'} ready to share`
      : 'No captures yet'
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="dashboard">
      <section
        aria-labelledby="webmcp-title"
        className="relative isolate mb-8 w-full overflow-hidden rounded-xl border border-white/20 bg-[url('/background.png')] bg-cover bg-[center_88%] text-white shadow-[0_2px_8px_rgb(35_36_32/3%)]"
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/15 to-black/55" />
        <div className="relative p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-base font-medium tracking-tight" id="webmcp-title">
              WebMCP
            </h2>
            <Link
              className="text-[9px] font-bold text-white/75 transition-colors hover:text-white"
              to="/webmcp"
            >
              Inspector
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="grid size-10.5 shrink-0 place-items-center rounded-[11px] bg-white/15 text-white backdrop-blur-sm">
                <Icon name="bolt" />
              </span>
              <div className="min-w-0">
                <strong className="block text-[11px] font-semibold">
                  WebMCP status: {webmcpPresentation.shortLabel}
                </strong>
                <p className="mt-1.5 max-w-2xl text-[9px] leading-relaxed text-white/75">
                  {webmcpPresentation.detail}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center self-start rounded-full px-2.5 py-1 text-[8px] font-extrabold sm:self-center ${
                webmcp.status === 'available'
                  ? 'bg-[#e3f2e7] text-(--green)'
                  : 'bg-white/15 text-white/85'
              }`}
            >
              {webmcpPresentation.shortLabel}
            </span>
          </div>
        </div>
      </section>

      <div className="page-heading">
        <div>
          <span className="eyebrow">{today}</span>
          <h1>
            <span className="page-heading__greeting-lead">Good evening,</span>{' '}
            <span className="page-heading__greeting-name">{usernameLabel}.</span>
          </h1>
          <p>Pick up where you left off or capture something worth repeating.</p>
        </div>
        <div className="page-heading__signal">
          <span>Recording completion</span>
          <strong>{completionRate}%</strong>
          <small>{completionDetail}</small>
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
              <strong>{activeHandoffs.length}</strong>
              <span>
                {activeHandoffs.length
                  ? 'Waiting on recipients'
                  : handoffs.length
                    ? 'All finished'
                    : 'None shared yet'}
              </span>
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
                icon="record"
                iconTone="ink"
                title="Nothing in progress"
              />
            )}
            {activeHandoffs.slice(0, 1).map((handoff) => (
              <Link
                className="work-row"
                key={handoff.id}
                params={{ id: handoff.publicToken ?? handoff.id }}
                to="/handoffs/$id"
              >
                <span className="work-row__icon work-row__icon--green">
                  <Icon name="share" />
                </span>
                <span className="work-row__content">
                  <strong>{handoff.title}</strong>
                  <small>
                    Handoff · Updated{' '}
                    {formatDate(handoff.updatedAt ?? handoff.createdAt)}
                  </small>
                </span>
                <span className={handoffStatusPillClass(handoff.status)}>
                  {formatHandoffStatus(handoff.status)}
                </span>
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
              <EmptyState
                detail="Material differences will pause here."
                icon="help"
                iconTone="amber"
                title="Nothing needs input"
              />
            )}
          </Card>
        </section>
      </div>

      <section aria-labelledby="activity-title" className="mt-6">
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
              icon="activity"
              iconTone="green"
              title="No activity yet"
            />
          )}
        </Card>
      </section>
    </div>
  )
}
