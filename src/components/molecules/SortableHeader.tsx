import { HStack } from '@atoms/HStack'
import { TableHeader } from '@atoms/Table'

interface SortableHeaderProps {
  children: React.ReactNode
  column: string
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  onSort: (column: string) => void
}

export function SortableHeader({
  children,
  column,
  sortColumn,
  sortDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortColumn === column

  return (
    <TableHeader onClick={() => onSort(column)} active={isActive}>
      <HStack spacing="sm" align="center">
        <span>{children}</span>
        {isActive && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </HStack>
    </TableHeader>
  )
}
