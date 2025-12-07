import React from 'react'

interface ImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'default' | 'white'
  aspectRatio?: string
  marginX?: 'auto' | 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Image({
  src,
  alt,
  width,
  height,
  rounded = 'none',
  shadow = 'none',
  background = 'default',
  aspectRatio,
  marginX,
  className = '',
}: ImageProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }

  const backgroundClasses = {
    default: '',
    white: 'bg-white',
  }

  const marginXClasses = {
    none: '',
    auto: 'mx-auto',
    sm: 'mx-2',
    md: 'mx-5',
    lg: 'mx-8',
  }

  const marginXClass = marginX ? marginXClasses[marginX] : ''

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height
  if (aspectRatio) style.aspectRatio = aspectRatio

  return (
    <img
      src={src}
      alt={alt}
      className={`${roundedClasses[rounded]} ${shadowClasses[shadow]} ${backgroundClasses[background]} ${marginXClass} ${className}`}
      style={style}
    />
  )
}

