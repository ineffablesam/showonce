import { useForm } from '@tanstack/react-form'

import type { Procedure } from '../../domain/model'
import { Button } from '../ui/Button'

export interface HandoffFormValues {
  title: string
  recipient: string
  note: string
  expirationDays: 7
  allowSafePreferences: boolean
  requireConfirmation: boolean
  allowHelperEscalation: boolean
}

export function CreateHandoffDialog({
  procedure,
  onCreate,
}: {
  procedure: Procedure
  onCreate: (value: HandoffFormValues) => Promise<void>
}) {
  const form = useForm({
    defaultValues: {
      title: procedure.title,
      recipient: 'Mom',
      note: '',
      expirationDays: 7 as const,
      allowSafePreferences: true,
      requireConfirmation: true,
      allowHelperEscalation: true,
    },
    onSubmit: async ({ value }) => {
      await onCreate(value)
    },
  })

  return (
    <form
      className="handoff-form"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div>
        <span className="eyebrow">Share safely</span>
        <h3>Create a recipient handoff</h3>
        <p>The handoff includes portable intent only—never screen data.</p>
      </div>
      <form.Field
        name="title"
        validators={{
          onSubmit: ({ value }) =>
            value.trim() ? undefined : 'Add a handoff title.',
        }}
      >
        {(field) => (
          <label className="field">
            <span>Handoff title</span>
            <input
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
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
      <div className="form-grid">
        <form.Field
          name="recipient"
          validators={{
            onSubmit: ({ value }) =>
              value.trim() ? undefined : 'Name the recipient.',
          }}
        >
          {(field) => (
            <label className="field">
              <span>Recipient</span>
              <input
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g. Mom"
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
        <form.Field name="expirationDays">
          {(field) => (
            <label className="field">
              <span>Expiration</span>
              <input disabled value={`${field.state.value} days`} />
            </label>
          )}
        </form.Field>
      </div>
      <form.Field name="note">
        {(field) => (
          <label className="field">
            <span>Optional note</span>
            <textarea
              name={field.name}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Add context for the recipient"
              value={field.state.value}
            />
          </label>
        )}
      </form.Field>
      <fieldset className="handoff-policy">
        <legend>Recipient permissions</legend>
        {(
          [
            ['allowSafePreferences', 'Allow safe preferences'],
            ['requireConfirmation', 'Require confirmation'],
            ['allowHelperEscalation', 'Allow helper escalation'],
          ] as const
        ).map(([name, label]) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <label>
                <input
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  type="checkbox"
                />
                {label}
              </label>
            )}
          </form.Field>
        ))}
      </fieldset>
      <Button type="submit">Create recipient link</Button>
    </form>
  )
}
