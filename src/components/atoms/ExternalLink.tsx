interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export function ExternalLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: ExternalLinkProps) {
  const variantClasses = {
    primary: 'text-indigo-600 hover:text-indigo-800 hover:underline',
    secondary: 'text-gray-600 hover:text-gray-800 hover:underline',
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </a>
  )
}
