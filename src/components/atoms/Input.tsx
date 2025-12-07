interface InputProps {
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  fullWidth = false,
  size = 'md',
  className = '',
}: InputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-4 py-4 text-base',
  }
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${sizeClasses[size]} border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-neutral-900 ${fullWidth ? 'w-full' : ''} ${className}`}
    />
  )
}
