import { useState } from 'react'

import type {
  AdaptationDifference,
  AccountState,
  Confirmation,
} from '../../domain/model'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

/** Still used by Samuel's own demonstrator submit flow (see NorthstarApp) and
 * by tests that exercise the underlying `create_confirmation`/`submit_renewal`
 * expiry semantics directly — kept here as the shared, generic helper. */
export function confirmationStatus(
  confirmation: Confirmation | undefined,
  now: number,
): 'missing' | 'fresh' | 'expired' {
  if (!confirmation) return 'missing'
  return confirmation.expiresAt > now ? 'fresh' : 'expired'
}

function differenceLabel(difference: AdaptationDifference): string {
  switch (difference.kind) {
    case 'material_price_change':
      return difference.percentChange !== undefined
        ? `Price difference ${difference.percentChange > 0 ? '+' : ''}${difference.percentChange}%`
        : 'Material price change'
    case 'plan_unavailable':
      return 'Demonstrated plan unavailable'
    case 'plan_difference':
      return 'Plan differs from demonstration'
    case 'preference_difference':
      return 'Preference differs from demonstration'
    case 'recipient_address_preserved':
      return 'Address left alone'
    case 'recipient_dependents_preserved':
      return 'Dependents left alone'
    case 'confirmation_required':
      return 'Requires your confirmation'
    default:
      return String(difference.kind).replaceAll('_', ' ')
  }
}

/**
 * The AWAITING HUMAN APPROVAL gate. An agent can read state, adapt safe
 * preferences, and prepare the renewal right up to this screen — but the
 * personal attestation checkbox and the single "Confirm & submit" action
 * below can only ever be operated by a human. Checking the box and clicking
 * the button perform one atomic action: record the attestation and submit,
 * with no second WebMCP turn required.
 */
export function ConfirmationGate({
  account,
  planName,
  monthlyPrice,
  differences,
  submitting,
  onConfirmAndSubmit,
  recipientName = 'the recipient',
}: {
  account: AccountState
  planName: string
  monthlyPrice: number
  differences: AdaptationDifference[]
  submitting: boolean
  onConfirmAndSubmit: () => Promise<void>
  recipientName?: string
}) {
  const [attested, setAttested] = useState(false)
  const renewalFrequency = account.preferences.renewalFrequency ?? 'annual'

  return (
    <Card className="confirmation-gate">
      <span className="confirmation-gate__icon" data-state="in">
        <Icon name="check" />
      </span>
      <div>
        <span className="eyebrow">Awaiting human approval</span>
        <h2>Ready to submit {recipientName}&rsquo;s renewal</h2>

        <dl className="confirmation-gate__summary">
          <div>
            <dt>Plan</dt>
            <dd>
              {planName} · ${monthlyPrice}/month
            </dd>
          </div>
          <div>
            <dt>Renewal</dt>
            <dd>{renewalFrequency === 'annual' ? 'Annual' : 'Monthly'}</dd>
          </div>
          <div>
            <dt>Dependents</dt>
            <dd>{account.dependents.length}</dd>
          </div>
          <div>
            <dt>Paperless</dt>
            <dd>{account.preferences.paperless ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>Unchanged</dd>
          </div>
        </dl>

        {differences.length > 0 ? (
          <div className="confirmation-gate__differences">
            <span className="confirmation-gate__differences-label">
              Material differences from what was demonstrated
            </span>
            <ul>
              {differences.map((difference) => (
                <li key={`${difference.kind}-${difference.detail}`}>
                  <strong>{differenceLabel(difference)}</strong>
                  <p>{difference.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <label className="confirmation-gate__attestation">
          <input
            checked={attested}
            onChange={(event) => setAttested(event.target.checked)}
            type="checkbox"
          />
          I am {recipientName} and I approve this renewal.
        </label>
        <p className="confirmation-gate__hint">
          An agent can prepare everything above, but only you can check this
          box. WebMCP tools cannot perform this step.
        </p>

        <button
          className="button button--primary"
          disabled={!attested || submitting}
          onClick={() => void onConfirmAndSubmit()}
          type="button"
        >
          {submitting ? 'Submitting…' : 'Confirm & submit'}
        </button>
      </div>
    </Card>
  )
}
