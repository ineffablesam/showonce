import {
  columnVisibilityFeature,
  flexRender,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'

import type { Procedure } from '../../domain/model'

const features = tableFeatures({ columnVisibilityFeature })
const columns: Array<ColumnDef<typeof features, Procedure>> = [
  {
    accessorKey: 'title',
    header: 'Procedure',
    cell: (info) => (
      <Link
        className="table-link"
        params={{ id: info.row.original.recordingId }}
        to="/recordings/$id"
      >
        {String(info.getValue())}
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.steps.length,
    id: 'steps',
    header: 'Portable steps',
  },
  {
    id: 'rules',
    header: 'Transfer model',
    cell: () => 'Carry · Adapt · Ask · Never',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: (info) =>
      typeof info.getValue() === 'number'
        ? new Date(info.getValue() as number).toLocaleDateString()
        : 'Unknown',
  },
]

export function ProceduresTable({ data }: { data: Procedure[] }) {
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
