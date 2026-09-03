import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { AppShell } from '../app/AppShell'
import { HandoffsTable } from '../components/handoffs/HandoffsTable'
import { Card, EmptyState } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { repositories } from '../domain/repositories/appRepositories'
import type { Handoff } from '../domain/model'
import { handoffsQuery } from '../lib/queries'

export const Route = createFileRoute('/handoffs/')({ component: Handoffs })

function Handoffs() {
  const handoffs = useQuery(handoffsQuery)
  const queryClient = useQueryClient()
  const [pendingDelete, setPendingDelete] = useState<Handoff>()

  const deleteHandoff = useMutation({
    mutationFn: (id: string) => repositories.handoffs.remove(id),
    onSuccess: async () => {
      setPendingDelete(undefined)
      await queryClient.invalidateQueries({ queryKey: ['handoffs'] })
    },
  })

  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Portable outcomes</span>
            <h1>Handoffs</h1>
            <p>Recipient links with safe intent and explicit decision points.</p>
          </div>
        </div>
        {handoffs.isPending ? (
          <div aria-label="Loading handoffs" className="page-loading"><span /></div>
        ) : handoffs.isError ? (
          <Card className="error-state">Unable to load handoffs.</Card>
        ) : handoffs.data.length ? (
          <Card>
            <HandoffsTable data={handoffs.data} onDelete={setPendingDelete} />
          </Card>
        ) : (
          <Card><EmptyState detail="Finish a recording, then create its recipient link." title="No handoffs yet" /></Card>
        )}
      </div>
      <ConfirmDialog
        description={
          pendingDelete
            ? `This revokes “${pendingDelete.title}” and removes it from your workspace. Anyone with the link will no longer be able to open it.`
            : ''
        }
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete) deleteHandoff.mutate(pendingDelete.id)
        }}
        open={Boolean(pendingDelete)}
        pending={deleteHandoff.isPending}
        title="Delete this handoff?"
      />
    </AppShell>
  )
}
