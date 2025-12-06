interface ZStackProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function ZStack({ children, align = 'center', className = '' }: ZStackProps) {
  const alignClasses = {
    start: 'items-start justify-start',
    center: 'items-center justify-center',
    end: 'items-end justify-end',
  }

  return <div className={`relative ${alignClasses[align]} ${className}`}>{children}</div>
}

