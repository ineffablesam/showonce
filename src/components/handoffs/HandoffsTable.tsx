import {
  columnVisibilityFeature,
  flexRender,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'

import { Icon } from '../ui/Icon'
import type { Handoff } from '../../domain/model'

const features = tableFeatures({ columnVisibilityFeature })
const formatDate = (value: unknown) =>
  typeof value === 'number' ? new Date(value).toLocaleDateString() : '—'

function buildColumns(
  onDelete?: (handoff: Handoff) => void,
): Array<ColumnDef<typeof features, Handoff>> {
  const columns: Array<ColumnDef<typeof features, Handoff>> = [
    {
      accessorKey: 'title',
      header: 'Task',
      cell: (info) => (
        <Link
          className="table-link"
          params={{ id: info.row.original.publicToken ?? info.row.original.id }}
          to="/handoffs/$id"
        >
          {String(info.getValue())}
        </Link>
      ),
    },
    {
      accessorKey: 'recipient',
      header: 'Recipient',
      cell: (info) => info.getValue() ?? '—',
    },
    {
      id: 'sourceApp',
      header: 'Source app',
      cell: ({ row }) =>
        /benefits|renewal/iu.test(
          row.original.procedure?.title ?? row.original.title,
        )
          ? 'Northstar Benefits'
          : '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = String(info.getValue() ?? 'created')
        return (
          <span className={`pill ${status === 'completed' ? 'pill--ready' : ''}`}>
            {status.replaceAll('_', ' ')}
          </span>
        )
      },
    },
    {
      id: 'adaptations',
      header: 'Adaptations',
      cell: ({ row }) =>
        row.original.procedure?.steps.filter(
          (step) =>
            step.policy === 'safe_preference' ||
            step.policy === 'availability_checked' ||
            step.policy === 'recipient_specific',
        ).length ?? 0,
    },
    {
      id: 'needsInput',
      header: 'Needs input',
      cell: ({ row }) => (row.original.status === 'needs_input' ? 'Yes' : '—'),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: (info) => formatDate(info.getValue()),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last activity',
      cell: ({ row }) => formatDate(row.original.updatedAt ?? row.original.createdAt),
    },
  ]

  if (onDelete) {
    columns.push({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          aria-label={`Delete ${row.original.title}`}
          className="row-delete-button"
          onClick={() => onDelete(row.original)}
          type="button"
        >
          <Icon name="trash" />
        </button>
      ),
    })
  }

  return columns
}

export function HandoffsTable({
  data,
  onDelete,
}: {
  data: Handoff[]
  onDelete?: (handoff: Handoff) => void
}) {
  const columns = useMemo(() => buildColumns(onDelete), [onDelete])
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
