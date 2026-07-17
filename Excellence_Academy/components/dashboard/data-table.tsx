import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export function DataTable<T>({ columns, data, emptyMessage = 'No records available.' }: DataTableProps<T>) {
  if (!data.length) {
    return <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => {
                const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor]
                return (
                  <TableCell key={column.header} className={column.className}>
                    {value as React.ReactNode}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
