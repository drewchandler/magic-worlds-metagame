interface GridProps {
  children: React.ReactNode
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number }
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Grid({ children, columns = 1, spacing = 'md', className = '' }: GridProps) {
  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const columnClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  }

  const responsiveColumnClasses: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  }

  let gridColsClass = 'grid-cols-1'

  if (typeof columns === 'number') {
    gridColsClass = columnClasses[columns] || `grid-cols-${columns}`
  } else {
    // Responsive grid columns
    const { sm, md, lg, xl } = columns
    const classes: string[] = []
    if (sm) classes.push(columnClasses[sm] || `grid-cols-${sm}`)
    if (md) classes.push(responsiveColumnClasses[md] || `md:grid-cols-${md}`)
    if (lg) classes.push(`lg:grid-cols-${lg}`)
    if (xl) classes.push(`xl:grid-cols-${xl}`)
    if (classes.length > 0) {
      gridColsClass = classes.join(' ')
    }
  }

  return (
    <div className={`grid ${gridColsClass} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  )
}
