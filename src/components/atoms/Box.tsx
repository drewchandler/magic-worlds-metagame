import React from 'react'

interface BoxProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg'
  textAlign?: 'left' | 'center' | 'right'
  textColor?: 'default' | 'inverse'
  margin?: 'none' | 'sm' | 'md' | 'lg'
  marginX?: 'auto' | 'none' | 'sm' | 'md' | 'lg'
  flex?: boolean
  grow?: boolean
  whitespace?: 'normal' | 'nowrap'
  background?: 'default' | 'gradient-slate-blue' | 'gradient-indigo-purple' | 'neutral-100' | 'neutral-50' | 'dark'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '3xl'
  roundedTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '3xl'
  overflow?: 'none' | 'auto' | 'hidden'
  maxHeight?: string
  minWidth?: string
  width?: 'auto' | 'full'
  sticky?: boolean
  zIndex?: number
  borderBottom?: boolean
  borderBottomColor?: 'primary' | 'neutral'
  borderBottomThickness?: 'sm' | 'md' | 'lg'
  display?: 'block' | 'inline' | 'inline-block' | 'flex'
  cursor?: 'default' | 'pointer'
  as?: 'div' | 'span'
  className?: string
}

const BoxComponent = React.forwardRef<HTMLDivElement | HTMLSpanElement, BoxProps>(function Box(
  {
    children,
    padding = 'none',
    paddingBottom,
    textAlign = 'left',
    textColor = 'default',
    margin = 'none',
  marginX,
    flex = false,
    grow = false,
    whitespace = 'normal',
    background = 'default',
    rounded = 'none',
    roundedTop = 'none',
    overflow = 'none',
    maxHeight,
    minWidth,
    width = 'auto',
    sticky = false,
    zIndex,
    borderBottom = false,
    borderBottomColor = 'primary',
    borderBottomThickness = 'lg',
    display,
    cursor,
    as,
    className = '',
  }: BoxProps,
  ref
) {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-5',
    lg: 'p-8',
  }

  const paddingBottomClasses = {
    none: '',
    sm: 'pb-2',
    md: 'pb-5',
    lg: 'pb-8',
  }

  const horizontalPaddingClasses = {
    none: '',
    sm: 'px-2',
    md: 'px-5',
    lg: 'px-8',
  }

  // If paddingBottom is specified, use horizontal padding + bottom padding separately
  // Otherwise use the full padding class
  const finalPaddingClass = paddingBottom !== undefined
    ? `${horizontalPaddingClasses[padding]} ${paddingBottomClasses[paddingBottom]}`
    : paddingClasses[padding]

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const textColorClasses = {
    default: '',
    inverse: 'text-white',
  }

  const marginClasses = {
    none: '',
    sm: 'mb-2',
    md: 'mb-5',
    lg: 'mb-8',
  }

  const marginXClasses = {
    none: '',
    auto: 'mx-auto',
    sm: 'mx-2',
    md: 'mx-5',
    lg: 'mx-8',
  }

  const marginXClass = marginX ? marginXClasses[marginX] : ''

  const flexClasses = flex ? 'flex' : ''
  const growClasses = grow ? 'flex-1' : ''
  const whitespaceClasses = whitespace === 'nowrap' ? 'whitespace-nowrap' : ''

  const backgroundClasses = {
    default: '',
    'gradient-slate-blue': 'bg-gradient-to-r from-neutral-800 to-info-800',
    'gradient-indigo-purple': 'bg-gradient-to-br from-primary-500 via-accent-500 to-accent-600',
    'neutral-100': 'bg-neutral-100',
    'neutral-50': 'bg-neutral-50',
    dark: 'bg-neutral-900 bg-opacity-90',
  }

  const overflowClasses = {
    none: '',
    auto: 'overflow-auto',
    hidden: 'overflow-hidden',
  }

  const widthClasses = {
    auto: '',
    full: 'w-full',
  }

  const borderBottomClasses = {
    primary: 'border-primary-500',
    neutral: 'border-neutral-200',
  }

  const borderBottomThicknessClasses = {
    sm: 'border-b',
    md: 'border-b-2',
    lg: 'border-b-4',
  }

  const borderBottomClass = borderBottom
    ? `${borderBottomClasses[borderBottomColor]} ${borderBottomThicknessClasses[borderBottomThickness]}`
    : ''

  const displayClasses = {
    block: 'block',
    inline: 'inline',
    'inline-block': 'inline-block',
    flex: 'flex',
  }

  const cursorClasses = {
    default: 'cursor-default',
    pointer: 'cursor-pointer',
  }

  const displayClass = display ? displayClasses[display] : ''
  const cursorClass = cursor ? cursorClasses[cursor] : ''

  const stickyClass = sticky ? 'sticky' : ''
  const zIndexClass = zIndex ? `z-${zIndex}` : ''

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '3xl': 'rounded-3xl',
  }

  const roundedTopClasses = {
    none: '',
    sm: 'rounded-t-sm',
    md: 'rounded-t-md',
    lg: 'rounded-t-lg',
    xl: 'rounded-t-xl',
    '3xl': 'rounded-t-3xl',
  }

  // Use roundedTop if specified, otherwise use rounded
  const finalRoundedClass = roundedTop !== 'none' ? roundedTopClasses[roundedTop] : roundedClasses[rounded]

  const style: React.CSSProperties = {}
  if (maxHeight) style.maxHeight = maxHeight
  if (minWidth) style.minWidth = minWidth

  const classNames = `${finalPaddingClass} ${textAlignClasses[textAlign]} ${textColorClasses[textColor]} ${marginClasses[margin]} ${marginXClass} ${flexClasses} ${growClasses} ${whitespaceClasses} ${backgroundClasses[background]} ${finalRoundedClass} ${overflowClasses[overflow]} ${widthClasses[width]} ${stickyClass} ${zIndexClass} ${borderBottomClass} ${displayClass} ${cursorClass} ${className}`

  const componentType = as || 'div'

  return React.createElement(
    componentType,
    {
      ref: ref as any,
      className: classNames,
      style,
    },
    children
  )
})

BoxComponent.displayName = 'Box'

export const Box = BoxComponent
