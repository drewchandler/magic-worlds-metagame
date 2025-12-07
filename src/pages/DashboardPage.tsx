import { Card } from '@atoms/Card'
import { Container } from '@atoms/Container'
import { ExternalLink } from '@atoms/ExternalLink'
import { Footer } from '@atoms/Footer'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import ArchetypeTable from '@organisms/ArchetypeTable'
import CardTable from '@organisms/CardTable'
import { PageHeader } from '@organisms/Header'
import MatchupGrid from '@organisms/MatchupGrid'
import MetagameBreakdown from '@organisms/MetagameBreakdown'
import { StatsGrid } from '@organisms/StatsGrid'
import { useData } from '@/App'

export function DashboardPage() {
  const data = useData()
  return (
    <Container variant="page">
      <PageHeader />
      <Card variant="page">
        <StatsGrid data={data} />
        <MetagameBreakdown data={data} />
        <ArchetypeTable data={data} />
        <MatchupGrid data={data} />
        <CardTable data={data} />
        <Footer>
          <VStack spacing="sm" align="center">
            <Text variant="body">
              Data from{' '}
              <ExternalLink href="https://magic.gg/events/magic-world-championship-31">
                magic.gg
              </ExternalLink>
            </Text>
            <Text variant="small">Last updated: {new Date().toLocaleString()}</Text>
          </VStack>
        </Footer>
      </Card>
    </Container>
  )
}
