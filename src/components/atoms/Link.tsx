import { Link as RouterLink } from 'react-router-dom'

interface LinkProps {
  to: string
  children: React.ReactNode
  variant?: 'default' | 'nav' | 'button' | 'badge'
  className?: string
}

export function Link({ to, children, variant = 'default', className = '' }: LinkProps) {
  const variantClasses = {
    default: 'text-primary hover:text-primary-800 hover:underline',
    nav: 'text-white hover:text-neutral-200 hover:underline',
    button:
      'inline-block px-4 py-2 bg-white text-neutral-900 rounded-lg border border-neutral-300 hover:bg-neutral-50',
    badge: 'inline-block px-3 py-1 bg-primary-50 text-primary border border-primary-200 rounded-lg hover:bg-primary-100 font-bold',
  }

  return (
    <RouterLink to={to} className={`${variantClasses[variant]} ${className}`}>
      {children}
    </RouterLink>
  )
}
