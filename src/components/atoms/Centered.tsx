interface CenteredProps {
  children: React.ReactNode
  minHeight?: string
  className?: string
}

export function Centered({ children, minHeight = 'min-h-[400px]', className = '' }: CenteredProps) {
  return (
    <div className={`flex justify-center items-center ${minHeight} ${className}`}>{children}</div>
  )
}
