interface VStackProps {
  children: React.ReactNode
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
}

export function VStack({
  children,
  spacing = 'md',
  align = 'stretch',
  className = '',
}: VStackProps) {
  const spacingClasses = {
    none: '',
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-4',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  return (
    <div className={`flex flex-col ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

