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
    primary: 'text-primary hover:text-primary-800 hover:underline',
    secondary: 'text-secondary hover:text-secondary-800 hover:underline',
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
