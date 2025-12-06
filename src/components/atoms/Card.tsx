interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'stat' | 'page'
  background?: 'default' | 'neutral' | 'info' | 'accent'
  overflow?: boolean
  shadow?: 'default' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Card({
  children,
  variant = 'default',
  background = 'default',
  overflow = false,
  shadow = 'default',
  padding,
  className = '',
}: CardProps) {
  const baseClasses = 'rounded-xl'
  const variantClasses = {
    default: '',
    stat: 'p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all',
    page: 'max-w-7xl mx-auto rounded-3xl shadow-2xl overflow-hidden',
  }
  const backgroundClasses = {
    default: 'bg-white',
    neutral: 'bg-neutral-50',
    info: 'bg-info-50',
    accent: 'bg-accent-50',
  }
  const shadowClasses = {
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }
  const overflowClasses = overflow ? 'overflow-x-auto' : ''
  const paddingClasses = padding
    ? padding === 'sm'
      ? 'p-2'
      : padding === 'md'
        ? 'p-4'
        : 'p-6'
    : ''

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${backgroundClasses[background]} ${shadowClasses[shadow]} ${overflowClasses} ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  )
}

