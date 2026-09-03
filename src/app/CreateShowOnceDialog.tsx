import { useForm } from '@tanstack/react-form'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

export function CreateShowOnceDialog({
  open,
  onClose,
  onCreate,
  returnFocusRef,
}: {
  open: boolean
  onClose: () => void
  onCreate: (value: {
    name: string
    description: string
    targetApp: 'nexa-benefits'
  }) => Promise<void>
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      targetApp: 'nexa-benefits' as const,
    },
    onSubmit: async ({ value }) => {
      await onCreate(value)
    },
  })

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
      aria-labelledby="create-showonce-title"
      className="dialog"
      onCancel={onClose}
      onClose={() => {
        onClose()
        returnFocusRef.current?.focus()
      }}
      ref={dialogRef}
    >
      <button
        aria-label="Close"
        className="dialog__close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <span className="dialog__eyebrow">
        <Icon name="spark" /> New workflow
      </span>
      <h2 id="create-showonce-title">New ShowOnce</h2>
      <p>
        Capture a task once, then share an outcome-aware handoff that adapts
        safely for the next person.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) =>
              value.trim() ? undefined : 'Give this ShowOnce a name.',
          }}
        >
          {(field) => (
            <label className="field">
              <span>ShowOnce name</span>
              <input
                autoFocus
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g. Quarterly close"
                value={field.state.value}
              />
              {field.state.meta.errors[0] ? (
                <small className="field__error">
                  {String(field.state.meta.errors[0])}
                </small>
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <label className="field">
              <span>Optional description</span>
              <textarea
                name={field.name}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="What should the recipient accomplish?"
                value={field.state.value}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="targetApp">
          {(field) => (
            <label className="field">
              <span>Target app</span>
              <select disabled name={field.name} value={field.state.value}>
                <option value="nexa-benefits">Northstar Benefits Demo</option>
              </select>
            </label>
          )}
        </form.Field>

        <div className="dialog__actions">
          <Button onClick={onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Create ShowOnce</Button>
        </div>
      </form>
    </dialog>
  )
}
