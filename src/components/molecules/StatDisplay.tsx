import { Card } from '@atoms/Card'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'

interface StatDisplayProps {
  label: string
  value: string | number
  valueColor?: 'primary' | 'info' | 'accent'
  background?: 'neutral' | 'info' | 'accent'
}

export function StatDisplay({
  label,
  value,
  valueColor = 'primary',
  background = 'neutral',
}: StatDisplayProps) {
  return (
    <Card background={background} padding="md">
      <VStack spacing="sm" align="center">
        <Text variant="h2" color={valueColor}>
          {value}
        </Text>
        <Text variant="label">{label}</Text>
      </VStack>
    </Card>
  )
}

