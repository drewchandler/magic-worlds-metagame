interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
  background?: boolean
  className?: string
}

export function Badge({ children, variant = 'primary', background = false, className = '' }: BadgeProps) {
  const variantClasses = {
    success: background ? 'bg-success-50 text-success border border-success-200' : 'text-success',
    warning: background ? 'bg-warning-50 text-warning border border-warning-200' : 'text-warning',
    danger: background ? 'bg-danger-50 text-danger border border-danger-200' : 'text-danger',
    info: background ? 'bg-info-50 text-info border border-info-200' : 'text-info',
    primary: background ? 'bg-primary-50 text-primary border border-primary-200' : 'text-primary',
  }

  const baseClasses = background ? 'px-3 py-1 rounded-lg' : ''

  return <span className={`font-bold ${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</span>
}
