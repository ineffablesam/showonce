import { useEffect, useRef } from 'react'

import { Button } from './Button'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  pending = false,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      aria-labelledby="confirm-dialog-title"
      className="dialog dialog--confirm"
      onCancel={onCancel}
      onClose={onCancel}
      ref={dialogRef}
    >
      <button
        aria-label="Close"
        className="dialog__close"
        onClick={onCancel}
        type="button"
      >
        ×
      </button>
      <h2 id="confirm-dialog-title">{title}</h2>
      <p>{description}</p>
      <div className="dialog__actions">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button
          disabled={pending}
          onClick={onConfirm}
          type="button"
          variant="danger"
        >
          {pending ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
