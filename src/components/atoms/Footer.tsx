interface FooterProps {
  children: React.ReactNode
  className?: string
}

export function Footer({ children, className = '' }: FooterProps) {
  return (
    <footer className={`text-center py-5 text-gray-600 bg-gray-50 ${className}`}>{children}</footer>
  )
}

