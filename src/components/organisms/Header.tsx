import { Header } from '@atoms/Header'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'

export function PageHeader() {
  return (
    <Header variant="page" padding="lg" margin="lg" rounded shadow textAlign="center">
      <VStack spacing="sm" align="center">
        <Text variant="h1" color="inverse" shadow>
          🎴 Magic World Championship 31
        </Text>
        <Text variant="h3" color="inverse" opacity="high">
          Metagame Analysis Dashboard
        </Text>
      </VStack>
    </Header>
  )
}
