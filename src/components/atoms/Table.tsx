interface TableProps {
  children: React.ReactNode
  className?: string
  minWidth?: string
}

export function Table({ children, className = '', minWidth }: TableProps) {
  const style: React.CSSProperties = {}
  if (minWidth) style.minWidth = minWidth
  return <table className={`w-full bg-white border-collapse ${className}`} style={style}>{children}</table>
}

export function TableHead({ children, className = '', sticky }: TableProps & { sticky?: boolean }) {
  const stickyClass = sticky ? 'sticky top-0 z-20' : ''
  return <thead className={`${stickyClass} ${className}`}>{children}</thead>
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
  sticky,
  left,
  zIndex,
  minWidth,
  background,
}: TableProps & {
  onClick?: () => void
  active?: boolean
  textColor?: 'default' | 'inverse'
  sticky?: boolean
  left?: string
  zIndex?: number
  minWidth?: string
  background?: 'default' | 'gradient-primary' | 'gradient-dark'
}) {
  const activeClass = active ? 'bg-primary' : ''
  const interactiveClass = onClick ? 'cursor-pointer hover:bg-primary transition-colors' : ''
  const textColorClass = textColor === 'inverse' ? 'text-white' : ''
  const stickyClass = sticky ? 'sticky top-0' : ''
  const zIndexClass = zIndex ? `z-${zIndex}` : ''
  
  const backgroundClasses = {
    default: '',
    'gradient-primary': 'bg-gradient-to-r from-primary-500 to-accent-600',
    'gradient-dark': 'bg-gradient-to-br from-neutral-800 to-info-800',
  }
  
  const style: React.CSSProperties = {}
  if (minWidth) style.minWidth = minWidth
  if (left !== undefined) style.left = left

  return (
    <th
      className={`p-3 text-left font-semibold text-xs uppercase tracking-wider ${interactiveClass} ${activeClass} ${textColorClass} ${stickyClass} ${zIndexClass} ${backgroundClasses[background || 'default']} ${className}`}
      onClick={onClick}
      style={style}
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
  background = 'default',
  border = false,
  cursor = 'default',
  hover = false,
  sticky = false,
  left,
  zIndex,
  minWidth,
}: TableProps & {
  colSpan?: number
  textAlign?: 'left' | 'center' | 'right'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  textColor?: 'default' | 'secondary' | 'muted'
  background?: 'default' | 'success-light' | 'warning-light' | 'danger-light' | 'neutral-100' | 'neutral-50' | 'gradient-dark'
  border?: boolean
  cursor?: 'default' | 'pointer'
  hover?: boolean
  sticky?: boolean
  left?: string
  zIndex?: number
  minWidth?: string
}) {
  const paddingClasses = padding
    ? padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-2'
        : padding === 'md'
          ? 'p-3'
          : 'p-4'
    : 'p-3'
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
  
  const backgroundClasses = {
    default: '',
    'success-light': 'bg-success-100',
    'warning-light': 'bg-warning-100',
    'danger-light': 'bg-danger-100',
    'neutral-100': 'bg-neutral-100',
    'neutral-50': 'bg-neutral-50',
    'gradient-dark': 'bg-gradient-to-br from-neutral-800 to-info-800',
  }
  
  const borderClass = border ? 'border border-neutral-200' : ''
  const cursorClass = cursor === 'pointer' ? 'cursor-pointer' : ''
  const hoverClass = hover ? 'transition-all hover:scale-105 hover:z-10 hover:shadow-md relative' : ''
  const stickyClass = sticky ? 'sticky' : ''
  const zIndexClass = zIndex ? `z-${zIndex}` : ''
  
  const style: React.CSSProperties = {}
  if (minWidth) style.minWidth = minWidth
  if (left !== undefined) style.left = left

  return (
    <td colSpan={colSpan} className={`${paddingClasses} ${textAlignClasses} ${textColorClasses} ${backgroundClasses[background]} ${borderClass} ${cursorClass} ${hoverClass} ${stickyClass} ${zIndexClass} ${className}`} style={style}>
      {children}
    </td>
  )
}
