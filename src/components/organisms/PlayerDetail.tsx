import { useParams } from 'react-router-dom'

import { Card } from '@atoms/Card'
import { Container } from '@atoms/Container'
import { Box } from '@atoms/Box'
import { Link } from '@atoms/Link'
import { Divider } from '@atoms/Divider'
import { VStack } from '@atoms/VStack'
import { SectionHeader } from '@molecules/SectionHeader'
import { PageHeader } from '@molecules/PageHeader'
import { LoadingState } from '@molecules/LoadingState'
import { MatchStatsGrid } from '@molecules/MatchStatsGrid'
import { MatchesTable } from '@molecules/MatchesTable'
import { DecklistDisplay } from '@molecules/DecklistDisplay'
import { usePlayerDecklist, useDecklists } from '@/hooks/useDecklists'
import { usePlayerMatches, type MatchResult } from '@/hooks/useResults'
import { normalizePlayerName } from '@/utils/playerName'
import { DRAFT_ROUNDS } from '@/utils/constants'
import type { AnalysisData } from '@/types'

interface PlayerDetailProps {
  data: AnalysisData | null
}

function PlayerDetail({ data }: PlayerDetailProps) {
  const { playerName } = useParams<{ playerName: string }>()
  const decodedName = decodeURIComponent(playerName || '')
  
  const { decklist, loading: decklistLoading, error: decklistError } = usePlayerDecklist(decodedName)
  const { playerMatches, loading: matchesLoading, error: matchesError } = usePlayerMatches(decodedName)
  const { decklists } = useDecklists()

  if (decklistLoading || matchesLoading) {
    return <LoadingState />
  }

  if (decklistError || matchesError) {
    return <LoadingState />
  }

  if (!data) {
    return <LoadingState />
  }
  
  const draftStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    gamesWon: 0,
    gamesLost: 0,
  }
  
  const constructedStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    gamesWon: 0,
    gamesLost: 0,
  }

  const normalizedPlayerName = normalizePlayerName(decodedName)
  playerMatches.forEach((match: MatchResult) => {
    const isDraft = DRAFT_ROUNDS.has(match.round)
    const stats = isDraft ? draftStats : constructedStats
    
    const p1Normalized = normalizePlayerName(match.player1)
    const isPlayer1 = p1Normalized === normalizedPlayerName
    if (isPlayer1) {
      if (match.p1_wins > match.p2_wins) stats.wins++
      else if (match.p2_wins > match.p1_wins) stats.losses++
      else stats.draws++
      stats.gamesWon += match.p1_wins
      stats.gamesLost += match.p2_wins
    } else {
      if (match.p2_wins > match.p1_wins) stats.wins++
      else if (match.p1_wins > match.p2_wins) stats.losses++
      else stats.draws++
      stats.gamesWon += match.p2_wins
      stats.gamesLost += match.p1_wins
    }
  })

  const draftWinRate =
    draftStats.wins + draftStats.losses > 0
      ? draftStats.wins / (draftStats.wins + draftStats.losses)
      : 0
      
  const constructedWinRate =
    constructedStats.wins + constructedStats.losses > 0
      ? constructedStats.wins / (constructedStats.wins + constructedStats.losses)
      : 0
      
  const totalStats = {
    wins: draftStats.wins + constructedStats.wins,
    losses: draftStats.losses + constructedStats.losses,
    draws: draftStats.draws + constructedStats.draws,
    gamesWon: draftStats.gamesWon + constructedStats.gamesWon,
    gamesLost: draftStats.gamesLost + constructedStats.gamesLost,
  }
  
  const totalWinRate =
    totalStats.wins + totalStats.losses > 0
      ? totalStats.wins / (totalStats.wins + totalStats.losses)
      : 0


  return (
    <Container variant="page" padding="md">
      <Card variant="page">
        <PageHeader
          title={decodedName}
          subtitle={
            decklist ? (
              <Link
                to={`/archetype/${encodeURIComponent(decklist.archetype)}`}
                variant="badge"
              >
                {decklist.archetype}
              </Link>
            ) : undefined
          }
        />

        <Box padding="lg">
          <VStack spacing="md">
            <SectionHeader>Match Statistics</SectionHeader>
            <MatchStatsGrid
              overall={{
                ...totalStats,
                matches: playerMatches.length,
              }}
              draft={{
                ...draftStats,
                matches: playerMatches.filter(m => DRAFT_ROUNDS.has(m.round)).length,
              }}
              constructed={{
                ...constructedStats,
                matches: playerMatches.filter(m => !DRAFT_ROUNDS.has(m.round)).length,
              }}
              overallWinRate={totalWinRate}
              draftWinRate={draftWinRate}
              constructedWinRate={constructedWinRate}
            />
          </VStack>
        </Box>

        <Divider />

        <Box padding="lg">
          <VStack spacing="md">
            <SectionHeader>Matches</SectionHeader>
            <MatchesTable
              matches={playerMatches}
              currentPlayerName={decodedName}
              decklists={decklists}
              normalizePlayerName={normalizePlayerName}
              draftRounds={DRAFT_ROUNDS}
            />
          </VStack>
        </Box>

        <Divider />

        {decklist && (
          <DecklistDisplay decklist={decklist} />
        )}
      </Card>
    </Container>
  )
}

export default PlayerDetail
