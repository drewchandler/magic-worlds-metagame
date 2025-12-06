interface HStackProps {
  children: React.ReactNode
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
}

export function HStack({
  children,
  spacing = 'md',
  align = 'center',
  className = '',
}: HStackProps) {
  const spacingClasses = {
    none: '',
    sm: 'space-x-1',
    md: 'space-x-2',
    lg: 'space-x-4',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  return (
    <div className={`flex flex-row ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}
