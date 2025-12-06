interface FooterProps {
  children: React.ReactNode
  className?: string
}

export function Footer({ children, className = '' }: FooterProps) {
  return (
    <footer className={`text-center py-5 text-secondary bg-neutral-50 ${className}`}>{children}</footer>
  )
}

