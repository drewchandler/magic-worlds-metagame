import { Box } from '@atoms/Box'
import { Button } from '@atoms/Button'
import { HStack } from '@atoms/HStack'
import { Text } from '@atoms/Text'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemLabel: string
  onPrevious: () => void
  onNext: () => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemLabel,
  onPrevious,
  onNext,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <Box padding="none" margin="none">
      <HStack spacing="md" justify="center" align="center">
        <Button onClick={onPrevious} disabled={currentPage === 1}>
          Previous
        </Button>
        <Text variant="body">
          Page {currentPage} of {totalPages} ({totalItems} {itemLabel})
        </Text>
        <Button onClick={onNext} disabled={currentPage === totalPages}>
          Next
        </Button>
      </HStack>
    </Box>
  )
}

