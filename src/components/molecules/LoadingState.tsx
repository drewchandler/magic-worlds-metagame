import { Card } from '@atoms/Card'
import { Container } from '@atoms/Container'
import { Text } from '@atoms/Text'

export function LoadingState() {
  return (
    <Container variant="page" padding="md">
      <Card variant="page" padding="lg">
        <Text>Loading...</Text>
      </Card>
    </Container>
  )
}

