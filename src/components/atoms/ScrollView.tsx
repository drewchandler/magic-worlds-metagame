interface ScrollViewProps {
  children: React.ReactNode
  axis?: 'horizontal' | 'vertical' | 'both'
  showsIndicators?: boolean
  className?: string
}

export function ScrollView({
  children,
  axis = 'vertical',
  showsIndicators = true,
  className = '',
}: ScrollViewProps) {
  const axisClasses = {
    horizontal: 'overflow-x-auto overflow-y-hidden',
    vertical: 'overflow-y-auto overflow-x-hidden',
    both: 'overflow-auto',
  }

  const scrollbarClass = showsIndicators ? '' : 'scrollbar-hide'

  return <div className={`${axisClasses[axis]} ${scrollbarClass} ${className}`}>{children}</div>
}
