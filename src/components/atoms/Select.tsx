interface SelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string }>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  size = 'md',
  className = '',
}: SelectProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-4 py-4 text-base',
  }

  return (
    <select
      value={value}
      onChange={onChange}
      className={`${sizeClasses[size]} border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-neutral-900 bg-neutral-50 ${className}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

