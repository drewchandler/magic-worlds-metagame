import React from 'react'

interface IconProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Icon({ children, size = 'md', className = '' }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}

