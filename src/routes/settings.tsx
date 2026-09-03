import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { AppShell } from '../app/AppShell'
import { Card } from '../components/ui/Card'
import { repositories } from '../domain/repositories/appRepositories'
import { resetDemo } from '../domain/repositories/seed'
import { useWorkspaceSession } from '../hooks/useWorkspaceSession'
import { formatUsernameLabel } from '../lib/workspaceUsername'
import { deleteWorkspaceAccountServer } from '../server/sharedServerFns'

export const Route = createFileRoute('/settings')({ component: Settings })

function Settings() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useWorkspaceSession()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()

  const username = session.data?.username
  const usernameLabel = username ? formatUsernameLabel(username) : 'Workspace'

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      `Delete ${usernameLabel}'s workspace on this browser? Recordings, handoffs, activity, and the username claim will be removed. This cannot be undone.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setDeleteError(undefined)
    try {
      await deleteWorkspaceAccountServer()
      await queryClient.invalidateQueries()
      await navigate({ to: '/' })
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Could not delete your workspace account.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>Settings</h1>
            <p>
              Manage your recorder workspace on this browser
              {username ? ` (${usernameLabel})` : ''}.
            </p>
          </div>
        </div>

        <Card className="settings-card">
          <div>
            <strong>Reset seeded demo data</strong>
            <p>
              Restores the demo recorder account, recipient demo state,
              procedures, and activity to their initial local values.
            </p>
          </div>
          <button
            className="button button--ghost"
            onClick={() =>
              void resetDemo(repositories).then(() =>
                queryClient.invalidateQueries(),
              )
            }
            type="button"
          >
            Reset demo
          </button>
        </Card>

        <Card className="settings-card settings-card--danger">
          <div>
            <strong>Delete account</strong>
            <p>
              Permanently remove your workspace data from shared storage and sign
              this browser out. You can claim the same username again later if it
              is still available.
            </p>
            {deleteError ? (
              <p className="settings-card__error" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
          <button
            className="button button--danger"
            disabled={deleting}
            onClick={() => void deleteAccount()}
            type="button"
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </Card>
      </div>
    </AppShell>
  )
}
