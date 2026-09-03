import { useForm } from '@tanstack/react-form'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

const fieldInputClassName =
  'w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10'

const modalMotionTransition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const,
}

type TargetAppValue = '' | 'nexa-benefits'

const TARGET_APP_LABELS = {
  'nexa-benefits': 'Northstar Benefits Demo',
} as const

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
  const targetAppDropdownRef = useRef<HTMLDivElement>(null)
  const [targetAppOpen, setTargetAppOpen] = useState(false)
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      targetApp: '' as TargetAppValue,
    },
    onSubmit: async ({ value }) => {
      if (value.targetApp !== 'nexa-benefits') return
      await onCreate({
        name: value.name,
        description: value.description,
        targetApp: value.targetApp,
      })
    },
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      form.reset()
      setTargetAppOpen(false)
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [form, open])

  useEffect(() => {
    if (!open) {
      setTargetAppOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!targetAppOpen) return

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        targetAppDropdownRef.current &&
        !targetAppDropdownRef.current.contains(event.target as Node)
      ) {
        setTargetAppOpen(false)
      }
    }

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setTargetAppOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleDocumentKeyDown, true)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleDocumentKeyDown, true)
    }
  }, [targetAppOpen])

  return (
    <dialog
      aria-labelledby="create-showonce-title"
      className="dialog dialog--fluid"
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

      <motion.div
        animate={{ height: 'auto' }}
        className="overflow-hidden"
        initial={false}
        layout
        transition={modalMotionTransition}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 pr-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <Icon className="size-3.5" name="spark" /> New workflow
            </span>
            <h2
              className="text-xl font-semibold text-neutral-900"
              id="create-showonce-title"
            >
              New ShowOnce
            </h2>
            <p className="text-sm leading-relaxed text-neutral-500">
              Capture a task once, then share an outcome-aware handoff that adapts
              safely for the next person.
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
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
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-neutral-700">
                    ShowOnce name
                  </span>
                  <input
                    autoFocus
                    className={fieldInputClassName}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Quarterly close"
                    value={field.state.value}
                  />
                  <AnimatePresence initial={false}>
                    {field.state.meta.errors[0] ? (
                      <motion.small
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden text-xs font-medium text-red-600"
                        exit={{ height: 0, opacity: 0 }}
                        initial={{ height: 0, opacity: 0 }}
                        transition={modalMotionTransition}
                      >
                        {String(field.state.meta.errors[0])}
                      </motion.small>
                    ) : null}
                  </AnimatePresence>
                </label>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-neutral-700">
                    Optional description
                  </span>
                  <textarea
                    className={`${fieldInputClassName} min-h-20 resize-none`}
                    name={field.name}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="What should the recipient accomplish?"
                    value={field.state.value}
                  />
                </label>
              )}
            </form.Field>

            <form.Field
              name="targetApp"
              validators={{
                onSubmit: ({ value }) =>
                  value ? undefined : 'Select an app to record against.',
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-1.5" ref={targetAppDropdownRef}>
                  <span className="text-sm font-medium text-neutral-700">
                    Target app
                  </span>
                  <div className="relative">
                    <button
                      aria-expanded={targetAppOpen}
                      aria-haspopup="listbox"
                      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition hover:border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
                      onClick={() => setTargetAppOpen((isOpen) => !isOpen)}
                      type="button"
                    >
                      {field.state.value ? (
                        <span className="flex items-center gap-2">
                          <Icon
                            className="size-4 shrink-0 text-emerald-700"
                            name="northstar"
                          />
                          {TARGET_APP_LABELS[field.state.value]}
                        </span>
                      ) : (
                        <span className="text-neutral-500">Select the app</span>
                      )}
                      <motion.span
                        animate={{ rotate: targetAppOpen ? 180 : 0 }}
                        initial={false}
                        transition={modalMotionTransition}
                      >
                        <ChevronDown
                          aria-hidden="true"
                          className="size-4 shrink-0 text-neutral-400"
                        />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {targetAppOpen ? (
                        <motion.div
                          animate={{ height: 'auto', opacity: 1 }}
                          className="overflow-hidden"
                          exit={{ height: 0, opacity: 0 }}
                          initial={{ height: 0, opacity: 0 }}
                          key="target-app-menu"
                          transition={modalMotionTransition}
                        >
                          <div
                            className="mt-1.5 overflow-hidden rounded-xl border border-neutral-200 bg-white py-2 shadow-lg"
                            role="listbox"
                          >
                            <div
                              aria-disabled="true"
                              className="pointer-events-none flex cursor-not-allowed flex-col gap-2 px-3.5 pb-3 opacity-50"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-neutral-700">
                                  Custom URL
                                </span>
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                                  Coming soon
                                </span>
                              </div>
                              <input
                                className="pointer-events-none w-full cursor-not-allowed rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-400"
                                disabled
                                placeholder="https://your-app.com"
                                readOnly
                                tabIndex={-1}
                              />
                            </div>

                            <div className="border-t border-neutral-100 px-3.5 pt-3">
                              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                                Quick links
                              </span>
                              <button
                                aria-selected={
                                  field.state.value === 'nexa-benefits'
                                }
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm text-neutral-900 transition hover:bg-neutral-50"
                                onClick={() => {
                                  field.handleChange('nexa-benefits')
                                  setTargetAppOpen(false)
                                }}
                                role="option"
                                type="button"
                              >
                                <Icon
                                  className="size-4 shrink-0 text-emerald-700"
                                  name="northstar"
                                />
                                Northstar Benefits Demo
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence initial={false}>
                    {field.state.meta.errors[0] ? (
                      <motion.small
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden text-xs font-medium text-red-600"
                        exit={{ height: 0, opacity: 0 }}
                        initial={{ height: 0, opacity: 0 }}
                        transition={modalMotionTransition}
                      >
                        {String(field.state.meta.errors[0])}
                      </motion.small>
                    ) : null}
                  </AnimatePresence>
                  <input
                    name={field.name}
                    type="hidden"
                    value={field.state.value}
                  />
                </div>
              )}
            </form.Field>

            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-5">
              <Button onClick={onClose} type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit">Create ShowOnce</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </dialog>
  )
}
