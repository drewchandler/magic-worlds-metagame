import { Container } from '@atoms/Container'
import { Loading } from '@molecules/Loading'
import { PageHeader } from '@organisms/Header'

export function LoadingPage() {
  return (
    <Container variant="page">
      <PageHeader />
      <Loading />
    </Container>
  )
}
