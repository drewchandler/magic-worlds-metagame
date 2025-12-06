interface BoxProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  textAlign?: 'left' | 'center' | 'right'
  textColor?: 'default' | 'inverse'
  margin?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Box({
  children,
  padding = 'none',
  textAlign = 'left',
  textColor = 'default',
  margin = 'none',
  className = '',
}: BoxProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-5',
    lg: 'p-8',
  }

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const textColorClasses = {
    default: '',
    inverse: 'text-white',
  }

  const marginClasses = {
    none: '',
    sm: 'mb-2',
    md: 'mb-5',
    lg: 'mb-8',
  }

  return (
    <div
      className={`${paddingClasses[padding]} ${textAlignClasses[textAlign]} ${textColorClasses[textColor]} ${marginClasses[margin]} ${className}`}
    >
      {children}
    </div>
  )
}
