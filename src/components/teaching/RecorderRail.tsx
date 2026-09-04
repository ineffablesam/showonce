import { useEffect, useState } from 'react'

import { BrandMark } from '../ui/BrandMark'
import { Icon } from '../ui/Icon'
import { describeCommand } from '../../domain/presentation/describeCommand'
import type { Plan, SemanticEvent } from '../../domain/model'

function useElapsedSeconds(startedAt: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])
  return Math.max(0, Math.floor((now - startedAt) / 1000))
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Left-hand teaching panel. Shows only what ShowOnce automatically captured
 * from real UI interactions with the connected demo app on the right — there
 * is no manual step picker here.
 */
export function RecorderRail({
  startedAt,
  events,
  plans,
  readyToFinish,
  finishing,
  onFinish,
  onReset,
}: {
  startedAt: number
  events: SemanticEvent[]
  plans: readonly Plan[]
  readyToFinish: boolean
  finishing: boolean
  onFinish: () => void
  onReset: () => void
}) {
  const elapsed = useElapsedSeconds(startedAt)
  const applied = events.filter((event) => event.status === 'applied')

  return (
    <aside aria-label="ShowOnce recorder" className="recorder-rail">
      <div className="recorder-rail__brand">
        <span className="brand__mark">
          <BrandMark height={14} width={18} />
        </span>
        ShowOnce
      </div>
      <div className="recorder-rail__status">
        <span className="recorder-rail__pulse" />
        Showing
        <span className="recorder-rail__clock">{formatClock(elapsed)}</span>
      </div>
      <div className="recorder-rail__section">
        <span className="eyebrow">Actions captured</span>
        {applied.length === 0 ? (
          <p className="recorder-rail__empty">
            Use WaitingRoom.gov on the right — every meaningful choice is
            captured automatically.
          </p>
        ) : (
          <ol className="recorder-rail__list">
            {applied.map((event) => (
              <li key={event.id}>
                <Icon name="check" />
                {describeCommand({ type: event.commandType, ...event.input }, plans)}
              </li>
            ))}
          </ol>
        )}
      </div>
      <button
        className="button button--primary recorder-rail__finish"
        disabled={finishing || !readyToFinish}
        onClick={onFinish}
        title={readyToFinish ? 'Compile this recording' : 'Finish the renewal on WaitingRoom.gov first'}
        type="button"
      >
        <Icon name="check" />
        Finish showing
      </button>
      <button className="recorder-rail__reset" onClick={onReset} type="button">
        Reset demo
      </button>
    </aside>
  )
}
