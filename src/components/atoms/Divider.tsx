interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  const orientationClasses = {
    horizontal: 'w-full h-[1px] bg-neutral-200',
    vertical: 'h-full w-[1px] bg-neutral-200',
  }

  return <div className={`${orientationClasses[orientation]} ${className}`} />
}

