import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AppShell, useAppWebMCP } from '../app/AppShell'
import { ActivityTable } from '../components/activity/ActivityTable'
import { Card, EmptyState } from '../components/ui/Card'
import { ToolsTable } from '../components/webmcp/ToolsTable'
import { activityQuery } from '../lib/queries'

export const Route = createFileRoute('/webmcp')({ component: WebMCP })

function WebMCP() {
  return <AppShell><Inspector /></AppShell>
}

function Inspector() {
  const webmcp = useAppWebMCP()
  const activity = useQuery({
    ...activityQuery,
    refetchInterval: 1_000,
  })
  const [browserTools, setBrowserTools] = useState<string[]>([])

  useEffect(() => {
    if (webmcp.status !== 'available' || typeof document === 'undefined') return
    if (!document.modelContext) return
    const context = document.modelContext as unknown as {
      getTools?: () => unknown | Promise<unknown>
    }
    if (!context.getTools) return
    let active = true
    const refresh = () => void Promise.resolve(context.getTools?.()).then((value) => {
      if (!active || !Array.isArray(value)) return
      setBrowserTools(
        value.flatMap((tool) => {
          if (typeof tool === 'string') return [tool]
          if (
            tool !== null &&
            typeof tool === 'object' &&
            'name' in tool &&
            typeof tool.name === 'string'
          ) {
            return [tool.name]
          }
          return []
        }),
      )
    })
    refresh()
    const interval = window.setInterval(refresh, 2_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [webmcp.status])

  const invocations =
    activity.data?.filter((event) => event.kind === 'webmcp_invocation') ?? []

  return (
    <div className="library-page">
      <div className="page-heading">
        <div><span className="eyebrow">Browser capability</span><h1>WebMCP inspector</h1><p>Actual registrations and invocation outcomes for this route.</p></div>
        <span className={`live-banner ${webmcp.status === 'available' ? 'live-banner--on' : ''}`}>
          {webmcp.status === 'available' ? 'WEBMCP LIVE' : `WEBMCP ${webmcp.status.toUpperCase()}`}
        </span>
      </div>
      <section>
        <div className="section-heading"><h2>Tool inventory</h2><span>{webmcp.registeredToolNames.length} registered here</span></div>
        <Card><ToolsTable browserToolNames={browserTools} registeredToolNames={webmcp.registeredToolNames} /></Card>
      </section>
      <section className="inspector-log">
        <div className="section-heading"><h2>Actual invocation log</h2><span>No synthetic calls</span></div>
        {invocations.length ? <Card><ActivityTable data={invocations} /></Card> : <Card><EmptyState detail="Real browser tool calls will be audited here." title="No WebMCP invocations" /></Card>}
      </section>
    </div>
  )
}
