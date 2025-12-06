interface TextProps {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'small'
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'inverse'
  leading?: 'normal' | 'relaxed'
  shadow?: boolean
  opacity?: 'full' | 'high' | 'medium' | 'low'
  className?: string
}

export function Text({
  children,
  variant = 'body',
  color = 'default',
  leading = 'normal',
  shadow = false,
  opacity = 'full',
  className = '',
}: TextProps) {
  const variantClasses = {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    label: 'text-sm uppercase tracking-wider text-gray-600',
    small: 'text-xs text-gray-500',
  }

  const colorClasses = {
    default: '',
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    inverse: 'text-white',
  }

  const leadingClasses = {
    normal: '',
    relaxed: 'leading-relaxed',
  }

  const getShadowClass = (hasShadow: boolean) => (hasShadow ? 'drop-shadow-lg' : '')

  const opacityClasses = {
    full: '',
    high: 'opacity-90',
    medium: 'opacity-75',
    low: 'opacity-50',
  }

  const Component = variant.startsWith('h') ? (variant as 'h1' | 'h2' | 'h3') : 'p'

  return (
    <Component
      className={`${variantClasses[variant]} ${colorClasses[color]} ${leadingClasses[leading]} ${getShadowClass(shadow)} ${opacityClasses[opacity]} ${className}`}
    >
      {children}
    </Component>
  )
}
