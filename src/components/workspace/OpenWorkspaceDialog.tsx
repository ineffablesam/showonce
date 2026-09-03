import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { usernameValidationMessage } from '../../lib/workspaceUsername'
import { openWorkspaceServer } from '../../server/sharedServerFns'
import { Icon } from '../ui/Icon'

const workspaceDialogEase = [0.22, 1, 0.36, 1] as const

const workspaceDialogTransition = {
  duration: 0.28,
  ease: workspaceDialogEase,
}

const continueButtonVariants = {
  rest: {},
  hover: {},
}

const continueArrowVariants = {
  rest: { x: 0 },
  hover: { x: 5 },
}

function ContinueButton({
  disabled,
  pending,
  onClick,
  reducedMotion,
}: {
  disabled: boolean
  pending: boolean
  onClick: () => void
  reducedMotion: boolean | null
}) {
  return (
    <motion.button
      animate="rest"
      className="button button--primary workspace-dialog__continue"
      disabled={disabled}
      initial={false}
      onClick={onClick}
      type="button"
      variants={continueButtonVariants}
      whileHover={disabled || reducedMotion ? undefined : 'hover'}
      whileTap={disabled || reducedMotion ? undefined : { scale: 0.985 }}
    >
      <span>{pending ? 'Continuing…' : 'Continue'}</span>
      {!pending ? (
        <motion.span
          aria-hidden="true"
          className="workspace-dialog__continue-arrow"
          variants={continueArrowVariants}
        >
          <Icon name="arrow" />
        </motion.span>
      ) : null}
    </motion.button>
  )
}

export function OpenWorkspaceDialog({
  onClose,
  open,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const motionTransition = reducedMotion
    ? { duration: 0.01 }
    : workspaceDialogTransition

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const panelVariants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.96, y: 14 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97, y: 8 },
      }

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  const submit = async () => {
    const validation = usernameValidationMessage(username)
    if (validation) {
      setError(validation)
      return
    }

    setPending(true)
    setError(undefined)
    try {
      await openWorkspaceServer({ data: { username } })
      onClose()
      await navigate({ to: '/app' })
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not open your workspace.',
      )
    } finally {
      setPending(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <motion.div
          animate="visible"
          className="workspace-dialog-backdrop"
          exit="exit"
          initial="hidden"
          key="workspace-dialog-backdrop"
          onClick={onClose}
          role="presentation"
          transition={motionTransition}
          variants={backdropVariants}
        >
          <motion.div
            animate="visible"
            aria-labelledby="workspace-dialog-title"
            aria-modal="true"
            className="workspace-dialog"
            exit="exit"
            initial="hidden"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            transition={motionTransition}
            variants={panelVariants}
          >
            <button
              aria-label="Close"
              className="workspace-dialog__close"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
            <span className="workspace-dialog__eyebrow">Recorder workspace</span>
            <h2 id="workspace-dialog-title">Choose your username</h2>
            <p className="workspace-dialog__lede">
              Your username is your recorder workspace on this browser. Pick
              something unique — your recordings, handoffs, and Needs input queue
              stay tied to it.
            </p>
            <p className="workspace-dialog__hint">
              Recipients do not open a workspace. They use the shared link you send
              and the recipient name you enter when creating that link.
            </p>
            <label className="workspace-dialog__field">
              <span className="workspace-dialog__label">Username</span>
              <input
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                autoFocus
                name="showonce-workspace-handle"
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void submit()
                }}
                placeholder="e.g. samuel"
                spellCheck={false}
                type="text"
                value={username}
              />
            </label>
            {error ? (
              <p className="workspace-dialog__error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="workspace-dialog__actions">
              <button
                className="button button--ghost"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <ContinueButton
                disabled={pending}
                onClick={() => void submit()}
                pending={pending}
                reducedMotion={reducedMotion}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export function OpenWorkspaceTrigger({
  className,
  large = false,
  label = 'Open workspace',
  onOpen,
}: {
  className?: string
  large?: boolean
  label?: string
  onOpen: () => void
}) {
  return (
    <button
      className={
        className ?? `button button--primary${large ? ' button--large' : ''}`
      }
      onClick={onOpen}
      type="button"
    >
      {label} <Icon name="arrow" />
    </button>
  )
}
