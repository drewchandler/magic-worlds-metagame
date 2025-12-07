interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'link'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'font-medium transition-colors'
  const variantClasses = {
    primary: disabled
      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed rounded'
      : 'bg-primary text-inverse hover:bg-primary-800 rounded',
    secondary: disabled
      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed rounded'
      : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 rounded',
    link: disabled
      ? 'text-neutral-400 cursor-not-allowed'
      : 'text-primary hover:text-primary-800 hover:underline',
  }

  const sizeClasses = {
    sm: 'px-3 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}
