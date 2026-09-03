import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { AppShell } from '../app/AppShell'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Card, EmptyState } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { repositories } from '../domain/repositories/appRepositories'
import { recordingsQuery } from '../lib/queries'

export const Route = createFileRoute('/recordings/')({ component: Recordings })

function Recordings() {
  const recordings = useQuery(recordingsQuery)
  const queryClient = useQueryClient()
  const [pendingDeleteId, setPendingDeleteId] = useState<string>()

  const deleteRecording = useMutation({
    mutationFn: async (id: string) => {
      const procedure = await repositories.procedures.getByRecordingId(id)
      if (procedure) await repositories.procedures.remove(procedure.id)
      await repositories.recordings.remove(id)
    },
    onSuccess: async () => {
      setPendingDeleteId(undefined)
      await queryClient.invalidateQueries()
    },
  })

  const pendingRecording = recordings.data?.find(
    (recording) => recording.id === pendingDeleteId,
  )

  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Semantic capture</span>
            <h1>Recordings</h1>
            <p>Meaningful human actions—not screenshots or coordinates.</p>
          </div>
        </div>
        {recordings.isPending ? (
          <div aria-label="Loading recordings" className="page-loading">
            <span />
          </div>
        ) : recordings.isError ? (
          <Card className="error-state">Unable to load recordings.</Card>
        ) : recordings.data.length ? (
          <div className="recording-list">
            {recordings.data.map((recording) => (
              <div className="recording-list__row" key={recording.id}>
                <Link
                  className="recording-list__link"
                  params={{ id: recording.id }}
                  to="/recordings/$id"
                >
                  <Card>
                    <span
                      className={`pill ${
                        recording.status === 'finished' ? 'pill--ready' : ''
                      }`}
                    >
                      {recording.status}
                    </span>
                    <h2>{recording.title}</h2>
                    <p>{recording.events.length} semantic actions</p>
                  </Card>
                </Link>
                <button
                  aria-label={`Delete ${recording.title}`}
                  className="row-delete-button"
                  onClick={() => setPendingDeleteId(recording.id)}
                  type="button"
                >
                  <Icon name="trash" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              detail="Use New ShowOnce to record the connected benefits flow."
              icon="record"
              iconTone="ink"
              title="No recordings yet"
            />
          </Card>
        )}
      </div>
      <ConfirmDialog
        description={
          pendingRecording
            ? `This deletes “${pendingRecording.title}” along with its compiled procedure and any handoffs created from it. This can’t be undone.`
            : ''
        }
        onCancel={() => setPendingDeleteId(undefined)}
        onConfirm={() => {
          if (pendingDeleteId) deleteRecording.mutate(pendingDeleteId)
        }}
        open={Boolean(pendingDeleteId)}
        pending={deleteRecording.isPending}
        title="Delete this recording?"
      />
    </AppShell>
  )
}
