interface AlertProps {
  children: React.ReactNode
  variant?: 'error' | 'warning' | 'info' | 'success'
  className?: string
}

export function Alert({ children, variant = 'error', className = '' }: AlertProps) {
  const variantClasses = {
    error: 'bg-danger-50 border-2 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-2 border-warning-200 text-warning-800',
    info: 'bg-info-50 border-2 border-info-200 text-info-800',
    success: 'bg-success-50 border-2 border-success-200 text-success-800',
  }

  return (
    <div className={`${variantClasses[variant]} p-8 rounded-xl max-w-2xl text-center ${className}`}>
      {children}
    </div>
  )
}

