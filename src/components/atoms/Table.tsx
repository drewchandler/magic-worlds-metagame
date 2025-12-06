interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return <table className={`w-full bg-white border-collapse ${className}`}>{children}</table>
}

export function TableHead({ children, className = '' }: TableProps) {
  return <thead className={className}>{children}</thead>
}

export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={className}>{children}</tbody>
}

export function TableRow({
  children,
  className = '',
  onClick,
}: TableProps & { onClick?: () => void }) {
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${className}`} onClick={onClick}>
      {children}
    </tr>
  )
}

export function TableHeader({
  children,
  className = '',
  onClick,
  active,
}: TableProps & { onClick?: () => void; active?: boolean }) {
  const activeClass = active ? 'bg-indigo-600' : ''
  const interactiveClass = onClick ? 'cursor-pointer hover:bg-indigo-600 transition-colors' : ''
  return (
    <th
      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider ${interactiveClass} ${activeClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '' }: TableProps) {
  return <td className={`p-4 text-gray-900 ${className}`}>{children}</td>
}
