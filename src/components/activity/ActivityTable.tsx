import {
  columnVisibilityFeature,
  flexRender,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import type { ActivityEvent } from '../../domain/model'

const features = tableFeatures({ columnVisibilityFeature })
const columns: Array<ColumnDef<typeof features, ActivityEvent>> = [
  {
    accessorKey: 'timestamp',
    header: 'Time',
    cell: (info) =>
      typeof info.getValue() === 'number'
        ? new Date(info.getValue() as number).toLocaleString()
        : 'Unknown',
  },
  {
    accessorKey: 'kind',
    header: 'Event',
    cell: (info) => String(info.getValue()).replaceAll('_', ' '),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: (info) => (
      <span className={`pill ${info.getValue() === 'webmcp' ? 'pill--live' : ''}`}>
        {info.getValue() === 'webmcp' ? 'Real WebMCP' : 'Human'}
      </span>
    ),
  },
  {
    accessorFn: (row) => row.toolName ?? row.commandType,
    id: 'action',
    header: 'Tool / action',
    cell: (info) => String(info.getValue() ?? 'Manual semantic command'),
  },
  {
    accessorKey: 'policy',
    header: 'Policy',
    cell: (info) => String(info.getValue() ?? '—').replaceAll('_', ' '),
  },
  {
    accessorKey: 'outcome',
    header: 'Outcome',
    cell: (info) => String(info.getValue() ?? 'recorded'),
  },
]

export function ActivityTable({ data }: { data: ActivityEvent[] }) {
  const table = useTable({
    features,
    data,
    columns,
  })
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
