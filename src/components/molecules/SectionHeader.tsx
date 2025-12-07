import { Box } from '@atoms/Box'
import { HStack } from '@atoms/HStack'
import { Text } from '@atoms/Text'

interface SectionHeaderProps {
  children: React.ReactNode
  variant?: 'h2' | 'h3'
  borderThickness?: 'sm' | 'md' | 'lg'
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({
  children,
  variant = 'h2',
  borderThickness = 'lg',
  actions,
  className = '',
}: SectionHeaderProps) {
  return (
    <Box
      padding="none"
      margin="none"
      width="full"
      borderBottom={true}
      borderBottomColor="primary"
      borderBottomThickness={borderThickness}
      paddingBottom="sm"
      className={className}
    >
      <HStack spacing="md" align="center" justify={actions ? 'between' : 'start'}>
        <Text variant={variant}>{children}</Text>
        {actions && <Box padding="none" margin="none">{actions}</Box>}
      </HStack>
    </Box>
  )
}

