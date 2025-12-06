interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  const orientationClasses = {
    horizontal: 'w-full h-px border-t border-neutral-200',
    vertical: 'h-full w-px border-l border-neutral-200',
  }

  return <div className={`${orientationClasses[orientation]} ${className}`} />
}

