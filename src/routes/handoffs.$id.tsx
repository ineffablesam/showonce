import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { AppShell } from '../app/AppShell'
import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { compareProcedureToRecipient } from '../domain/adaptation/compareProcedureToRecipient'
import {
  createDemoAccount,
  createRecipientAccount,
} from '../domain/integration/productFlow'
import { repositories } from '../domain/repositories/appRepositories'
import { SHOWONCE_TOOLS } from '../webmcp/definitions/tools'

export const Route = createFileRoute('/handoffs/$id')({
  component: HandoffDetail,
})

function HandoffDetail() {
  const { id } = Route.useParams()
  const handoff = useQuery({
    queryKey: ['handoff', id],
    queryFn: async () =>
      (await repositories.handoffs.list()).find(
        (candidate) => candidate.publicToken === id,
      ) ?? null,
  })
  const sharePath = `/s/${id}?scenario=normal`
  const procedure = handoff.data?.procedure
  const adaptation = procedure
    ? compareProcedureToRecipient(
        procedure,
        createDemoAccount(),
        createRecipientAccount('normal'),
      )
    : null
  const recipientTools = SHOWONCE_TOOLS.filter((tool) =>
    tool.scopes.includes('recipient'),
  )
  const recipientName = handoff.data?.recipient ?? 'the recipient'

  return (
    <AppShell>
      {!handoff.data ? (
        <Card>
          <EmptyState
            detail="The recipient link may have been removed."
            title={handoff.isPending ? 'Loading handoff' : 'Handoff not found'}
          />
        </Card>
      ) : (
        <div className="handoff-detail">
          <header className="procedure-hero">
            <div>
              <span className="pill pill--ready">
                {(handoff.data.status ?? 'created').replaceAll('_', ' ')}
              </span>
              <h1>{handoff.data.title}</h1>
              <p>Portable task with explicit adaptation, privacy, and activity.</p>
            </div>
          </header>
          <Card className="share-card">
            <span className="share-card__icon"><Icon name="share" /></span>
            <div>
              <small>Recipient link</small>
              <code>{sharePath}</code>
            </div>
            <Link
              className="button button--primary"
              params={{ publicToken: id }}
              search={{ preview: true, scenario: 'normal' }}
              to="/s/$publicToken"
            >
              Open recipient view
            </Link>
          </Card>
          <div className="handoff-audit-grid">
            <Card>
              <span className="eyebrow">Original task</span>
              <h2>{procedure?.title ?? handoff.data.title}</h2>
              <p>{procedure?.steps.length ?? 0} sanitized semantic actions.</p>
              {procedure?.steps.map((step, index) => (
                <div className="procedure-step" key={step.id}>
                  <span>{index + 1}</span>
                  <strong>{step.commandType.replaceAll('_', ' ')}</strong>
                </div>
              ))}
            </Card>
            <Card>
              <span className="eyebrow">Recipient adaptation</span>
              <h2>{recipientName}’s account stays authoritative</h2>
              <p>
                {adaptation?.safeActions.length ?? 0} safe actions can adapt;{' '}
                {adaptation?.differences.length ?? 0} differences remain visible.
              </p>
              {adaptation?.differences.map((difference) => (
                <div key={`${difference.kind}-${difference.detail}`}>
                  <strong>{difference.kind.replaceAll('_', ' ')}</strong>
                  <p>{difference.detail}</p>
                </div>
              ))}
              <Link
                className="text-link"
                params={{ publicToken: id }}
                search={{ preview: true, scenario: 'normal' }}
                to="/s/$publicToken"
              >
                Preview scenario — normal <Icon name="arrow" />
              </Link>
            </Card>
            <Card>
              <span className="eyebrow">Activity</span>
              <h2>{(handoff.data.status ?? 'created').replaceAll('_', ' ')}</h2>
              <p>
                Last lifecycle activity{' '}
                {new Date(
                  handoff.data.updatedAt ?? handoff.data.createdAt,
                ).toLocaleString()}.
              </p>
              <Link className="text-link" to="/activity">
                View activity <Icon name="arrow" />
              </Link>
            </Card>
            <Card>
              <span className="eyebrow">Privacy</span>
              <h2>0 credentials shared</h2>
              <p>
                No passwords, sessions, selectors, screenshots, addresses, or
                dependent values are included in this handoff.
              </p>
            </Card>
            <Card>
              <span className="eyebrow">Agent tools</span>
              <h2>{recipientTools.length} recipient tools</h2>
              <p>Registered only on the recipient route when WebMCP is available.</p>
              {recipientTools.map((tool) => (
                <code key={tool.name}>{tool.name}</code>
              ))}
            </Card>
            <Card>
              <span className="eyebrow">Plan unavailable preview</span>
              <h2>No automatic substitute</h2>
              <p>{recipientName} chooses or requests a minimum-information decision.</p>
              <Link
                className="text-link"
                params={{ publicToken: id }}
                search={{ preview: true, scenario: 'unavailable' }}
                to="/s/$publicToken"
              >
                Preview scenario — unavailable <Icon name="arrow" />
              </Link>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  )
}
