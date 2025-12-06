interface SpacerProps {
  minLength?: number
  className?: string
}

export function Spacer({ minLength, className = '' }: SpacerProps) {
  const style = minLength ? { minWidth: `${minLength}px`, minHeight: `${minLength}px` } : {}

  return <div className={`flex-1 ${className}`} style={style} />
}

