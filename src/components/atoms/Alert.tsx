interface AlertProps {
  children: React.ReactNode
  variant?: 'error' | 'warning' | 'info' | 'success'
  className?: string
}

export function Alert({ children, variant = 'error', className = '' }: AlertProps) {
  const variantClasses = {
    error: 'bg-red-50 border-2 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-2 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-2 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-2 border-green-200 text-green-800',
  }

  return (
    <div className={`${variantClasses[variant]} p-8 rounded-xl max-w-2xl text-center ${className}`}>
      {children}
    </div>
  )
}
