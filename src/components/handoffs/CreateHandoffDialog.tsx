import { useForm } from '@tanstack/react-form'

import type { Procedure } from '../../domain/model'

export interface HandoffFormValues {
  title: string
  recipient: string
  note: string
  expirationDays: 7
  allowSafePreferences: boolean
  requireConfirmation: boolean
  allowHelperEscalation: boolean
}

const PERMISSIONS = [
  [
    'allowSafePreferences',
    'Allow safe preferences',
    'Carry over paperless, communication, and renewal-frequency choices.',
  ],
  [
    'requireConfirmation',
    'Require confirmation',
    'The recipient must explicitly approve before anything submits.',
  ],
  [
    'allowHelperEscalation',
    'Allow helper escalation',
    'Let the recipient ask a trusted helper when a choice needs judgment.',
  ],
] as const

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
      className="flex w-full max-w-xl flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          Share safely
        </span>
        <h3 className="text-xl font-semibold text-neutral-900">
          Create a recipient handoff
        </h3>
        <p className="text-sm leading-relaxed text-neutral-500">
          The handoff includes portable intent only—never screen data.
        </p>
      </div>

      <form.Field
        name="title"
        validators={{
          onSubmit: ({ value }) =>
            value.trim() ? undefined : 'Add a handoff title.',
        }}
      >
        {(field) => (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              Handoff title
            </span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              value={field.state.value}
            />
            {field.state.meta.errors[0] ? (
              <small className="text-xs font-medium text-red-600">
                {String(field.state.meta.errors[0])}
              </small>
            ) : null}
          </label>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="recipient"
          validators={{
            onSubmit: ({ value }) =>
              value.trim() ? undefined : 'Name the recipient.',
          }}
        >
          {(field) => (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700">
                Recipient
              </span>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g. Mom"
                value={field.state.value}
              />
              {field.state.meta.errors[0] ? (
                <small className="text-xs font-medium text-red-600">
                  {String(field.state.meta.errors[0])}
                </small>
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="expirationDays">
          {(field) => (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700">
                Expiration
              </span>
              <input
                className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-500 shadow-sm"
                disabled
                value={`${field.state.value} days`}
              />
            </label>
          )}
        </form.Field>
      </div>

      <form.Field name="note">
        {(field) => (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              Optional note
            </span>
            <textarea
              className="min-h-20 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
              name={field.name}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Add context for the recipient"
              value={field.state.value}
            />
          </label>
        )}
      </form.Field>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
        <legend className="mb-1 px-0.5 text-sm font-semibold text-neutral-700">
          Recipient permissions
        </legend>
        {PERMISSIONS.map(([name, label, hint]) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1.5 transition hover:bg-white">
                <input
                  checked={field.state.value}
                  className="mt-0.5 size-4 shrink-0 accent-neutral-900"
                  onChange={(event) => field.handleChange(event.target.checked)}
                  type="checkbox"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-neutral-800">
                    {label}
                  </span>
                  <span className="text-xs leading-snug text-neutral-500">
                    {hint}
                  </span>
                </span>
              </label>
            )}
          </form.Field>
        ))}
      </fieldset>

      <button
        className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 sm:w-auto sm:self-start"
        type="submit"
      >
        Create recipient link
      </button>
    </form>
  )
}
