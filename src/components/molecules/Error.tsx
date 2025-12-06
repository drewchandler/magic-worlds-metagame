import { Alert } from '@atoms/Alert'
import { Box } from '@atoms/Box'
import { Button } from '@atoms/Button'
import { Centered } from '@atoms/Centered'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'

interface ErrorProps {
  message: string
  onRetry: () => void
}

export function Error({ message, onRetry }: ErrorProps) {
  return (
    <Centered>
      <Box padding="md">
        <Alert variant="error">
          <VStack spacing="md" align="center">
            <Text variant="h2">⚠️ Error Loading Data</Text>
            <Text variant="body" leading="relaxed">
              {message}
            </Text>
            <Button onClick={onRetry} variant="primary" size="lg">
              Retry
            </Button>
          </VStack>
        </Alert>
      </Box>
    </Centered>
  )
}
