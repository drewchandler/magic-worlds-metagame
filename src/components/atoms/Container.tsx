interface ContainerProps {
  children: React.ReactNode
  variant?: 'page' | 'section' | 'grid'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: 'default' | 'neutral'
  className?: string
}

export function Container({
  children,
  variant = 'section',
  padding = 'md',
  background = 'default',
  className = '',
}: ContainerProps) {
  const variantClasses = {
    page: 'min-h-screen bg-gradient-to-br from-primary-500 via-accent-500 to-accent-600',
    section: '',
    grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: variant === 'page' ? 'p-5' : 'p-10',
    lg: 'p-8',
  }

  const backgroundClasses = {
    default: '',
    neutral: 'bg-neutral-50',
  }

  return (
    <div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      {children}
    </div>
  )
}
