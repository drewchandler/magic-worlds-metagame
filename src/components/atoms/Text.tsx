interface TextProps {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'small'
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'inverse' | 'info' | 'accent' | 'success' | 'warning' | 'danger'
  leading?: 'normal' | 'relaxed'
  shadow?: boolean
  opacity?: 'full' | 'high' | 'medium' | 'low'
  borderBottom?: boolean
  borderBottomColor?: 'primary' | 'neutral'
  borderThickness?: 'sm' | 'md' | 'lg'
  paddingBottom?: 'sm' | 'md' | 'lg'
  italic?: boolean
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  cursor?: 'default' | 'pointer'
  hover?: string
  className?: string
}

export function Text({
  children,
  variant = 'body',
  color = 'default',
  leading = 'normal',
  shadow = false,
  opacity = 'full',
  borderBottom = false,
  borderBottomColor = 'primary',
  borderThickness = 'md',
  paddingBottom,
  italic = false,
  fontWeight,
  fontSize,
  cursor,
  hover,
  className = '',
}: TextProps) {
  const variantClasses = {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    label: 'text-sm uppercase tracking-wider text-secondary',
    small: 'text-xs text-muted',
  }

  const colorClasses = {
    default: '',
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted',
    inverse: 'text-white',
    info: 'text-info',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
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

  const borderThicknessClasses = {
    sm: 'border-b',
    md: 'border-b-2',
    lg: 'border-b-4',
  }
  
  const borderBottomClasses = borderBottom
    ? `${borderThicknessClasses[borderThickness]} ${borderBottomColor === 'primary' ? 'border-primary-500' : 'border-neutral-200'}`
    : ''

  const paddingBottomClasses = paddingBottom
    ? paddingBottom === 'sm'
      ? 'pb-2'
      : paddingBottom === 'md'
        ? 'pb-3'
        : 'pb-4'
    : borderBottom
      ? 'pb-2'
      : ''

  const Component = variant.startsWith('h') ? (variant as 'h1' | 'h2' | 'h3') : 'p'

  const italicClass = italic ? 'italic' : ''
  
  const fontWeightClasses = {
    normal: '',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
  
  const fontSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }
  
  const cursorClasses = {
    default: 'cursor-default',
    pointer: 'cursor-pointer',
  }
  
  const fontWeightClass = fontWeight ? fontWeightClasses[fontWeight] : ''
  const fontSizeClass = fontSize ? fontSizeClasses[fontSize] : ''
  const cursorClass = cursor ? cursorClasses[cursor] : ''
  const hoverClass = hover ? `hover:${hover}` : ''

  return (
    <Component
      className={`${variantClasses[variant]} ${colorClasses[color]} ${leadingClasses[leading]} ${getShadowClass(shadow)} ${opacityClasses[opacity]} ${borderBottomClasses} ${paddingBottomClasses} ${italicClass} ${fontWeightClass} ${fontSizeClass} ${cursorClass} ${hoverClass} ${className}`}
    >
      {children}
    </Component>
  )
}
