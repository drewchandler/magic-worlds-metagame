import { Container } from '@atoms/Container'
import { Error } from '@molecules/Error'
import { PageHeader } from '@organisms/Header'

interface ErrorPageProps {
  message: string
  onRetry: () => void
}

export function ErrorPage({ message, onRetry }: ErrorPageProps) {
  return (
    <Container variant="page">
      <PageHeader />
      <Error message={message} onRetry={onRetry} />
    </Container>
  )
}
