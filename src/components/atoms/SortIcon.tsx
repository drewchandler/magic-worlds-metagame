interface SortIconProps {
  column: string
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  className?: string
}

export function SortIcon({ column, sortColumn, sortDirection, className = '' }: SortIconProps) {
  if (sortColumn !== column) {
    return (
      <span className={`ml-1 text-muted ${className}`}>
        ↕
      </span>
    )
  }
  return (
    <span className={`ml-1 ${className}`}>
      {sortDirection === 'asc' ? '↑' : '↓'}
    </span>
  )
}

