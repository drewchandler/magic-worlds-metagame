interface HeaderProps {
  children: React.ReactNode
  variant?: 'page' | 'section'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  margin?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  shadow?: boolean
  textAlign?: 'left' | 'center' | 'right'
  className?: string
}

export function Header({
  children,
  variant = 'page',
  padding = 'lg',
  margin = 'none',
  rounded = false,
  shadow = false,
  textAlign = 'left',
  className = '',
}: HeaderProps) {
  const variantClasses = {
    page: 'bg-gradient-to-r from-neutral-800 to-info-800 text-inverse',
    section: 'bg-gradient-to-r from-primary-500 to-accent-600 text-inverse',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-10',
  }

  const marginClasses = {
    none: '',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-5',
  }

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const roundedClass = rounded ? 'rounded-3xl' : ''
  const shadowClass = shadow ? 'shadow-xl' : ''

  if (variant === 'page') {
    return (
      <div
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${marginClasses[margin]} ${textAlignClasses[textAlign]} ${roundedClass} ${shadowClass} ${className}`}
      >
        {children}
      </div>
    )
  }

  return (
    <header
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${marginClasses[margin]} ${textAlignClasses[textAlign]} ${roundedClass} ${shadowClass} ${className}`}
    >
      {children}
    </header>
  )
}
