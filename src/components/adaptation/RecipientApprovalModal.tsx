import { useEffect, useRef } from 'react'

import type { AccountState, AdaptationDifference } from '../../domain/model'
import { ConfirmationGate } from './ConfirmationGate'

export function RecipientApprovalModal({
  open,
  account,
  planName,
  monthlyPrice,
  differences,
  recipientName,
  submitting,
  onConfirmAndSubmit,
  onClose,
}: {
  open: boolean
  account: AccountState
  planName: string
  monthlyPrice: number
  differences: AdaptationDifference[]
  recipientName: string
  submitting: boolean
  onConfirmAndSubmit: () => Promise<void>
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const submitted = account.submittedAt !== null
  const shouldShow = open && !submitted

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (shouldShow && !dialog.open) {
      dialog.showModal()
    } else if (!shouldShow && dialog.open) {
      dialog.close()
    }
  }, [shouldShow])

  return (
    <dialog
      aria-labelledby="recipient-approval-title"
      className="dialog dialog--approval"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <ConfirmationGate
        account={account}
        differences={differences}
        monthlyPrice={monthlyPrice}
        onConfirmAndSubmit={onConfirmAndSubmit}
        planName={planName}
        recipientName={recipientName}
        submitting={submitting}
        variant="modal"
      />
    </dialog>
  )
}
