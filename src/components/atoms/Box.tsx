interface BoxProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  textAlign?: 'left' | 'center' | 'right'
  textColor?: 'default' | 'inverse'
  margin?: 'none' | 'sm' | 'md' | 'lg'
  flex?: boolean
  grow?: boolean
  whitespace?: 'normal' | 'nowrap'
  background?: 'default' | 'gradient-slate-blue' | 'gradient-indigo-purple'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '3xl'
  roundedTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '3xl'
  className?: string
}

export function Box({
  children,
  padding = 'none',
  textAlign = 'left',
  textColor = 'default',
  margin = 'none',
  flex = false,
  grow = false,
  whitespace = 'normal',
  background = 'default',
  rounded = 'none',
  roundedTop = 'none',
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

  const flexClasses = flex ? 'flex' : ''
  const growClasses = grow ? 'flex-1' : ''
  const whitespaceClasses = whitespace === 'nowrap' ? 'whitespace-nowrap' : ''

  const backgroundClasses = {
    default: '',
    'gradient-slate-blue': 'bg-gradient-to-r from-neutral-800 to-info-800',
    'gradient-indigo-purple': 'bg-gradient-to-br from-primary-500 via-accent-500 to-accent-600',
  }

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '3xl': 'rounded-3xl',
  }

  const roundedTopClasses = {
    none: '',
    sm: 'rounded-t-sm',
    md: 'rounded-t-md',
    lg: 'rounded-t-lg',
    xl: 'rounded-t-xl',
    '3xl': 'rounded-t-3xl',
  }

  // Use roundedTop if specified, otherwise use rounded
  const finalRoundedClass = roundedTop !== 'none' ? roundedTopClasses[roundedTop] : roundedClasses[rounded]

  return (
    <div
      className={`${paddingClasses[padding]} ${textAlignClasses[textAlign]} ${textColorClasses[textColor]} ${marginClasses[margin]} ${flexClasses} ${growClasses} ${whitespaceClasses} ${backgroundClasses[background]} ${finalRoundedClass} ${className}`}
    >
      {children}
    </div>
  )
}
