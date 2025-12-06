interface PaddingProps {
  children: React.ReactNode
  all?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  horizontal?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  vertical?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  top?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  bottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  left?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  right?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Padding({
  children,
  all,
  horizontal,
  vertical,
  top,
  bottom,
  left,
  right,
  className = '',
}: PaddingProps) {
  const paddingSizeClasses = {
    none: '0',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8',
  }

  let classes: string[] = []

  if (all) {
    classes.push(`p-${paddingSizeClasses[all]}`)
  } else {
    if (horizontal) classes.push(`px-${paddingSizeClasses[horizontal]}`)
    if (vertical) classes.push(`py-${paddingSizeClasses[vertical]}`)
    if (top) classes.push(`pt-${paddingSizeClasses[top]}`)
    if (bottom) classes.push(`pb-${paddingSizeClasses[bottom]}`)
    if (left) classes.push(`pl-${paddingSizeClasses[left]}`)
    if (right) classes.push(`pr-${paddingSizeClasses[right]}`)
  }

  return <div className={`${classes.join(' ')} ${className}`}>{children}</div>
}
