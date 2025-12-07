interface HStackProps {
  children: React.ReactNode
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  className?: string
}

export function HStack({
  children,
  spacing = 'md',
  align = 'center',
  justify,
  className = '',
}: HStackProps) {
  const spacingClasses = {
    none: '',
    xs: 'space-x-0.5',
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

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  const justifyClass = justify ? justifyClasses[justify] : ''

  return (
    <div className={`flex flex-row ${spacingClasses[spacing]} ${alignClasses[align]} ${justifyClass} ${className}`}>
      {children}
    </div>
  )
}

