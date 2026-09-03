import {
  columnVisibilityFeature,
  flexRender,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { SHOWONCE_TOOLS } from '../../webmcp/definitions/tools'

interface ToolRow {
  name: string
  title: string
  scope: string
  mode: string
  status: 'registered' | 'not registered' | 'browser-reported'
}

const features = tableFeatures({ columnVisibilityFeature })
const columns: Array<ColumnDef<typeof features, ToolRow>> = [
  { accessorKey: 'name', header: 'Tool' },
  { accessorKey: 'title', header: 'Purpose' },
  { accessorKey: 'scope', header: 'Route scope' },
  { accessorKey: 'mode', header: 'Mode' },
  {
    accessorKey: 'status',
    header: 'Actual status',
    cell: (info) => (
      <span className={`pill ${info.getValue() === 'registered' ? 'pill--live' : ''}`}>
        {String(info.getValue())}
      </span>
    ),
  },
]

export function ToolsTable({
  registeredToolNames,
  browserToolNames,
}: {
  registeredToolNames: string[]
  browserToolNames: string[]
}) {
  const registered = new Set(registeredToolNames)
  const showOnceRows: ToolRow[] = SHOWONCE_TOOLS.map((tool) => ({
    name: tool.name,
    title: tool.title,
    scope: tool.scopes.join(', '),
    mode: tool.annotations.readOnlyHint ? 'Read' : 'Write',
    status: registered.has(tool.name) ? 'registered' : 'not registered',
  }))
  const known = new Set(showOnceRows.map((row) => row.name))
  const browserRows: ToolRow[] = browserToolNames
    .filter((name) => !known.has(name))
    .map((name) => ({
      name,
      title: 'Browser-reported tool',
      scope: 'Browser',
      mode: 'Reported by getTools',
      status: 'browser-reported',
    }))
  const table = useTable({
    features,
    data: [...showOnceRows, ...browserRows],
    columns,
  })

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
