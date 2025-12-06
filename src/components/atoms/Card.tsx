interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'stat' | 'page'
  className?: string
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const baseClasses = 'bg-white rounded-xl shadow-md'
  const variantClasses = {
    default: '',
    stat: 'p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all',
    page: 'max-w-7xl mx-auto rounded-3xl shadow-2xl overflow-hidden',
  }

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</div>
}

