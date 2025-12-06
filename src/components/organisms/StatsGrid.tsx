import { Container } from '@atoms/Container'
import { StatCard } from '@molecules/StatCard'
import type { AnalysisData } from '@/types'

interface StatsGridProps {
  data: AnalysisData | null
}

export function StatsGrid({ data }: StatsGridProps) {
  if (!data) return null

  const archetypeCounts = data.archetype_counts || {}
  const totalPlayers = data.total_players || 0
  const totalMatches = data.total_matches || 0
  const totalDecks = Object.values(archetypeCounts).reduce((sum, count) => sum + count, 0)
  const numArchetypes = Object.keys(archetypeCounts).length

  const stats = [
    { label: 'Players', value: totalPlayers },
    { label: 'Archetypes', value: numArchetypes },
    { label: 'Matches', value: totalMatches },
    { label: 'Total Decks', value: totalDecks },
  ]

  return (
    <Container variant="grid" padding="lg" background="gray">
      {stats.map((stat, index) => (
        <StatCard key={index} label={stat.label} value={stat.value} />
      ))}
    </Container>
  )
}
