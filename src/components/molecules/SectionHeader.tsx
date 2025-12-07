import { Box } from '@atoms/Box'
import { Text } from '@atoms/Text'

interface SectionHeaderProps {
  children: React.ReactNode
  variant?: 'h2' | 'h3'
  borderThickness?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SectionHeader({
  children,
  variant = 'h2',
  borderThickness = 'lg',
  className = '',
}: SectionHeaderProps) {
  return (
    <Box padding="none" margin="none" className={className}>
      <Text
        variant={variant}
        borderBottom
        borderBottomColor="primary"
        borderThickness={borderThickness}
        paddingBottom="sm"
      >
        {children}
      </Text>
    </Box>
  )
}

