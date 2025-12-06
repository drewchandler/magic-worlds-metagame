interface InputProps {
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  fullWidth?: boolean
  className?: string
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  fullWidth = false,
  className = '',
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 ${fullWidth ? 'w-full' : ''} ${className}`}
    />
  )
}
