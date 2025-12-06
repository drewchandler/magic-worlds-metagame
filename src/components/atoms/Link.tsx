import { Link as RouterLink } from 'react-router-dom'

interface LinkProps {
  to: string
  children: React.ReactNode
  variant?: 'default' | 'nav' | 'button'
  className?: string
}

export function Link({ to, children, variant = 'default', className = '' }: LinkProps) {
  const variantClasses = {
    default: 'text-indigo-600 hover:text-indigo-800 hover:underline',
    nav: 'text-white hover:text-gray-200 hover:underline',
    button:
      'inline-block px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 hover:bg-gray-50',
  }

  return (
    <RouterLink to={to} className={`${variantClasses[variant]} ${className}`}>
      {children}
    </RouterLink>
  )
}
