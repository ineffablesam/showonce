import type { AccountState, AdaptationResult } from '../../domain/model'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

function words(value: string): string {
  return value.replaceAll('_', ' ')
}

function actionDetail(
  command: AdaptationResult['safeActions'][number],
): string {
  if (command.type === 'set_preference') {
    return `${words(command.key)} will be set to ${String(command.value)}`
  }
  if (command.type === 'select_plan') {
    return `${command.planId} is available to select`
  }
  return `${words(command.type)} is safe to apply`
}

type DiffTone = 'same' | 'applied' | 'skipped' | 'left-alone' | 'ask' | 'different'

const diffToneLabel: Record<DiffTone, string> = {
  same: 'Same',
  applied: 'Applied',
  skipped: 'Skipped',
  'left-alone': 'Left alone',
  ask: 'Ask',
  different: 'Different',
}

function skippedTone(reason: string): DiffTone {
  if (reason === 'recipient_dependents_left_alone') return 'left-alone'
  if (reason === 'requires_user_confirmation') return 'ask'
  if (reason === 'plan_unavailable' || reason === 'judgment_required')
    return 'different'
  return 'skipped'
}

function differenceTone(kind: AdaptationResult['differences'][number]['kind']): DiffTone {
  if (kind === 'recipient_address_preserved') return 'skipped'
  if (kind === 'recipient_dependents_preserved') return 'left-alone'
  if (kind === 'confirmation_required') return 'ask'
  return 'different'
}

export function AdaptationPanel({
  result,
  onChoose,
  onAsk,
  recipient,
  recipientName,
  helperError,
  askingHelper,
}: {
  result: AdaptationResult
  scenario: 'normal' | 'unavailable'
  onChoose: () => void
  onAsk: () => void
  recipient: AccountState
  recipientName: string
  helperError?: string
  askingHelper?: boolean
}) {
  const unavailable = result.differences.some(
    (difference) => difference.kind === 'plan_unavailable',
  )
  const planDifference = result.differences.find(
    (difference) =>
      difference.kind === 'material_price_change' ||
      difference.kind === 'plan_unavailable' ||
      difference.kind === 'plan_difference',
  )
  const priceDifference = result.differences.find(
    (difference) => difference.kind === 'material_price_change',
  )
  const planName =
    recipient.availablePlans.find((plan) => plan.id === planDifference?.planId)
      ?.name ??
    planDifference?.planId ??
    'Demonstrated plan'
  const recipientPlan = recipient.availablePlans.find(
    (plan) => plan.id === planDifference?.planId,
  )
  const factRows = [
    ...result.matches.map((match) => ({
      key: `match-${match.kind}-${match.detail}`,
      icon: 'check' as const,
      tone: 'same' as const,
      label: match.kind === 'plan_match' ? 'Plan matched' : 'Already matched',
      detail: match.detail,
    })),
    ...result.safeActions.map((command, index) => ({
      key: `safe-${command.type}-${index}`,
      icon: 'check' as const,
      tone: 'applied' as const,
      label: 'Safe to carry',
      detail: actionDetail(command),
    })),
    ...result.skippedActions.map(({ reason }, index) => ({
      key: `skipped-${reason}-${index}`,
      icon: reason.includes('recipient') ? ('home' as const) : ('help' as const),
      tone: skippedTone(reason),
      label:
        reason === 'recipient_details_preserved'
          ? 'Address kept private'
          : reason === 'recipient_dependents_left_alone'
            ? 'Dependents left alone'
            : 'Held back safely',
      detail:
        reason === 'recipient_details_preserved'
          ? 'Current recipient address retained'
          : reason === 'recipient_dependents_left_alone'
            ? `${recipient.dependents.length} recipient records unchanged`
            : words(reason),
    })),
    ...result.differences.map((difference, index) => ({
      key: `difference-${difference.kind}-${index}`,
      icon:
        difference.kind === 'recipient_address_preserved'
          ? ('home' as const)
          : ('help' as const),
      tone: differenceTone(difference.kind),
      label:
        difference.kind === 'recipient_address_preserved'
          ? 'Address difference'
          : difference.kind === 'recipient_dependents_preserved'
            ? 'Dependents difference'
            : words(difference.kind),
      detail:
        difference.percentChange === undefined
          ? difference.detail
          : `${difference.detail} (${difference.percentChange}%)`,
    })),
  ]

  return (
    <div className="adaptation-panel">
      <div className="adaptation-summary">
        <span className="adaptation-summary__icon"><Icon name="spark" /></span>
        <div>
          <span className="eyebrow">Adapted for you</span>
          <h2>Your details stayed yours.</h2>
          <p>
            ShowOnce found {result.matches.length} existing matches and{' '}
            {result.safeActions.length} safe actions. Recipient-specific details
            remain under your control.
          </p>
        </div>
      </div>
      <div className="adaptation-facts">
        {factRows.map((row) => (
          <Card className={`diff-row diff-row--${row.tone}`} key={row.key}>
            <span className={`diff-row__tag diff-row__tag--${row.tone}`}>
              {diffToneLabel[row.tone]}
            </span>
            <Icon name={row.icon} />
            <strong>{row.label}</strong>
            <span>{row.detail}</span>
          </Card>
        ))}
      </div>
      <Card className="decision-card">
        <span className="eyebrow">
          {unavailable ? 'Plan unavailable' : 'Regional pricing difference'}
        </span>
        <h3>
          {unavailable
            ? `${planName} is not offered for this account.`
            : `${planName} costs $${recipientPlan?.monthlyPrice ?? '—'}/month on ${recipientName}'s account.`}
        </h3>
        <p>
          {unavailable
            ? 'ShowOnce will not choose a substitute automatically.'
            : `${priceDifference?.detail ?? 'The demonstrated plan differs by region.'} Ask the sender before an agent continues.`}
        </p>
        {helperError ? (
          <p className="decision-card__error" role="alert">
            {helperError}
          </p>
        ) : null}
        <div className="decision-card__actions">
          <button className="button button--primary" onClick={onChoose} type="button">
            {unavailable
              ? "I'll choose"
              : `Choose ${planName}${recipientPlan ? ` at $${recipientPlan.monthlyPrice}` : ''}`}
          </button>
          <button
            className="button button--ghost"
            disabled={askingHelper}
            onClick={onAsk}
            type="button"
          >
            {askingHelper ? 'Sending request…' : 'Ask the sender'}
          </button>
        </div>
      </Card>
    </div>
  )
}
