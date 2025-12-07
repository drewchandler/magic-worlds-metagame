import { TableRow, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'

interface EmptyStateProps {
  message: string
  colSpan?: number
}

export function EmptyState({ message, colSpan = 1 }: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} textAlign="center" padding="lg" textColor="muted">
        <Text>{message}</Text>
      </TableCell>
    </TableRow>
  )
}

