import { useEffect, useState } from 'react'

import type { Confirmation } from '../../domain/model'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

export function ConfirmationGate({
  planName,
  monthlyPrice,
  submitting,
  onConfirm,
  onSubmit,
  confirmation,
  now,
  recipientName = 'the recipient',
}: {
  planName: string
  monthlyPrice: number
  submitting: boolean
  onConfirm: () => Promise<void>
  onSubmit: () => Promise<void>
  confirmation?: Confirmation
  now?: number
  recipientName?: string
}) {
  const [confirmed, setConfirmed] = useState(false)
  const [, setClockTick] = useState(0)
  const status = confirmationStatus(confirmation, now ?? Date.now())

  useEffect(() => {
    if (now !== undefined || !confirmation) return
    const delay = Math.max(0, confirmation.expiresAt - Date.now() + 10)
    const timeout = window.setTimeout(() => setClockTick((value) => value + 1), delay)
    return () => window.clearTimeout(timeout)
  }, [confirmation, now])

  return (
    <Card className="confirmation-gate">
      <span className="confirmation-gate__icon" data-state="in"><Icon name="check" /></span>
      <div>
        <span className="eyebrow">Final confirmation</span>
        <h2>Ready to submit {recipientName}’s renewal</h2>
        <p>
          {planName} at ${monthlyPrice}/month · annual renewal · paperless.
          Human approval is separate from submission and remains valid for 120
          seconds.
        </p>
        <label>
          <input
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            type="checkbox"
          />
          I’m {recipientName} and I approve this renewal.
        </label>
        {status === 'fresh' ? (
          <>
            <p role="status">Confirmed by {recipientName}. WebMCP may now submit.</p>
            <button
              className="button button--primary"
              disabled={submitting}
              onClick={() => void onSubmit()}
              type="button"
            >
              Submit renewal
            </button>
          </>
        ) : (
          <>
            {status === 'expired' ? (
              <p role="alert">
                Confirmation expired. {recipientName} must approve again.
              </p>
            ) : null}
            <button
              className="button button--primary"
              disabled={!confirmed || submitting}
              onClick={() => void onConfirm()}
              type="button"
            >
              Confirm for 120 seconds
            </button>
          </>
        )}
      </div>
    </Card>
  )
}

export function confirmationStatus(
  confirmation: Confirmation | undefined,
  now: number,
): 'missing' | 'fresh' | 'expired' {
  if (!confirmation) return 'missing'
  return confirmation.expiresAt > now ? 'fresh' : 'expired'
}
