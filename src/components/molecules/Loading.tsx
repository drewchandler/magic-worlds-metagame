import { Box } from '@atoms/Box'
import { Centered } from '@atoms/Centered'
import { Spinner } from '@atoms/Spinner'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'

export function Loading() {
  return (
    <Centered>
      <Box textAlign="center" textColor="inverse">
        <VStack spacing="lg" align="center">
          <Spinner />
          <Text variant="h3" color="inverse">
            Loading data...
          </Text>
        </VStack>
      </Box>
    </Centered>
  )
}
