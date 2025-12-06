interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'link'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonProps) {
  const baseClasses = 'font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-700 rounded',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 rounded',
    link: 'text-primary hover:text-primary-800 hover:underline',
  }

  const sizeClasses = {
    sm: 'px-3 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}
