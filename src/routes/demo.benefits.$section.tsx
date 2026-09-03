import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { BrowserFrame } from '../components/browser/BrowserFrame'
import { NorthstarApp } from '../components/northstar/NorthstarApp'
import { RecorderRail } from '../components/teaching/RecorderRail'
import { Card, EmptyState } from '../components/ui/Card'
import {
  applyRecordedCommand,
  finishRecording,
} from '../domain/integration/productFlow'
import type { Command, Confirmation } from '../domain/model'
import { repositories } from '../domain/repositories/appRepositories'
import { resetDemo } from '../domain/repositories/seed'

export const Route = createFileRoute('/demo/benefits/$section')({
  validateSearch: (search: Record<string, unknown>) => ({
    recording:
      typeof search.recording === 'string' ? search.recording : undefined,
  }),
  component: BenefitsRoute,
})

function BenefitsRoute() {
  const { recording: recordingId } = Route.useSearch()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // A ref (not state) because create_confirmation and submit_renewal can run
  // back-to-back within a single async handler, before a state update from
  // the first call would have flushed to a re-render.
  const confirmationRef = useRef<Confirmation | undefined>(undefined)
  const [addressConfirmed, setAddressConfirmed] = useState(false)

  const accountId = 'samuel'
  const accountQuery = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => repositories.accounts.get(accountId),
  })
  const recordingQuery = useQuery({
    queryKey: ['recording', recordingId],
    queryFn: () =>
      recordingId ? repositories.recordings.get(recordingId) : null,
  })

  const action = useMutation({
    mutationFn: async (command: Command) => {
      const account = accountQuery.data
      if (!recordingId || !account) throw new Error('Recording context missing')
      const confirmation = confirmationRef.current
      const commandWithConfirmation =
        command.type === 'submit_renewal' && confirmation
          ? { ...command, confirmationToken: confirmation.token }
          : command
      const result = await applyRecordedCommand(
        repositories,
        recordingId,
        account,
        commandWithConfirmation,
        {
          confirmation,
          createToken: () => crypto.randomUUID(),
        },
      )
      if (result.confirmation) confirmationRef.current = result.confirmation
      return result
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['account', accountId] }),
        queryClient.invalidateQueries({
          queryKey: ['recording', recordingId],
        }),
        queryClient.invalidateQueries({ queryKey: ['activity'] }),
      ])
    },
  })

  const finish = useMutation({
    mutationFn: () => {
      if (!recordingId) throw new Error('Recording context missing')
      return finishRecording(repositories, recordingId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['procedures'] })
      await navigate({
        to: '/recordings/$id',
        params: { id: recordingId ?? '' },
      })
    },
  })

  useEffect(() => {
    if (recordingQuery.data?.status === 'finished') {
      void navigate({
        to: '/recordings/$id',
        params: { id: recordingQuery.data.id },
      })
    }
  }, [navigate, recordingQuery.data?.id, recordingQuery.data?.status])

  const reset = async () => {
    await resetDemo(repositories)
    await queryClient.invalidateQueries()
  }

  const loading = accountQuery.isPending || recordingQuery.isPending

  if (loading) {
    return (
      <div aria-label="Loading benefits" className="page-loading">
        <span />
        <span />
      </div>
    )
  }

  if (
    !recordingId ||
    !recordingQuery.data ||
    !accountQuery.data ||
    recordingQuery.data.status !== 'capturing'
  ) {
    return (
      <div className="teaching-empty">
        <Card>
          <EmptyState
            detail="Start a New ShowOnce from the workspace to open Northstar Benefits and begin recording."
            title="No active recording"
          />
          <Link className="button button--primary" to="/app">
            Back to workspace
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="teaching-layout">
      <RecorderRail
        events={recordingQuery.data.events}
        finishing={finish.isPending}
        onFinish={() => finish.mutate()}
        onReset={() => void reset()}
        plans={accountQuery.data.availablePlans}
        readyToFinish={accountQuery.data.submittedAt !== null}
        startedAt={recordingQuery.data.createdAt}
      />
      <div className="teaching-layout__frame">
        <BrowserFrame url="benefits.northstar.demo">
          <NorthstarApp
            account={accountQuery.data}
            addressConfirmed={addressConfirmed}
            memberName="Samuel"
            mode="demonstrator"
            onAddressConfirm={() => setAddressConfirmed(true)}
            runCommand={(command) => action.mutateAsync(command)}
          />
        </BrowserFrame>
      </div>
    </div>
  )
}
