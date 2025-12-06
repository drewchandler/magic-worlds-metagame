import { Card } from '@atoms/Card'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card variant="stat">
      <VStack spacing="sm" align="center">
        <Text variant="h1" color="primary">
          {value}
        </Text>
        <Text variant="label">{label}</Text>
      </VStack>
    </Card>
  )
}
