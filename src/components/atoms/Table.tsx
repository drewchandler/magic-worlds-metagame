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
  variant,
}: TableProps & { onClick?: () => void; variant?: 'default' | 'header' }) {
  const variantClasses = {
    default: 'hover:bg-neutral-50 transition-colors',
    header: 'bg-gradient-to-r from-primary-500 to-accent-600',
  }
  return (
    <tr className={`${variantClasses[variant || 'default']} ${className}`} onClick={onClick}>
      {children}
    </tr>
  )
}

export function TableHeader({
  children,
  className = '',
  onClick,
  active,
  textColor,
}: TableProps & { onClick?: () => void; active?: boolean; textColor?: 'default' | 'inverse' }) {
  const activeClass = active ? 'bg-primary' : ''
  const interactiveClass = onClick ? 'cursor-pointer hover:bg-primary transition-colors' : ''
  const textColorClass = textColor === 'inverse' ? 'text-white' : ''
  return (
    <th
      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider ${interactiveClass} ${activeClass} ${textColorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </th>
  )
}

export function TableCell({
  children,
  className = '',
  colSpan,
  textAlign,
  padding,
  textColor,
}: TableProps & {
  colSpan?: number
  textAlign?: 'left' | 'center' | 'right'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  textColor?: 'default' | 'secondary' | 'muted'
}) {
  const paddingClasses = padding
    ? padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-2'
        : padding === 'md'
          ? 'p-4'
          : 'p-6'
    : 'p-4'
  const textAlignClasses = textAlign
    ? textAlign === 'left'
      ? 'text-left'
      : textAlign === 'center'
        ? 'text-center'
        : 'text-right'
    : ''
  const textColorClasses = textColor
    ? textColor === 'secondary'
      ? 'text-secondary'
      : textColor === 'muted'
        ? 'text-muted'
        : 'text-neutral-900'
    : 'text-neutral-900'

  return (
    <td colSpan={colSpan} className={`${paddingClasses} ${textAlignClasses} ${textColorClasses} ${className}`}>
      {children}
    </td>
  )
}
