import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { Card } from '@atoms/Card'
import { Container } from '@atoms/Container'
import { Box } from '@atoms/Box'
import { Link } from '@atoms/Link'
import { Divider } from '@atoms/Divider'
import { VStack } from '@atoms/VStack'
import CardTooltip from '@molecules/CardTooltip'
import { SectionHeader } from '@molecules/SectionHeader'
import { PageHeader } from '@molecules/PageHeader'
import { StatDisplay } from '@molecules/StatDisplay'
import { EmptyState } from '@molecules/EmptyState'
import { LoadingState } from '@molecules/LoadingState'
import { MatchStatsGrid } from '@molecules/MatchStatsGrid'
import { MatchesTable } from '@molecules/MatchesTable'
import { DecklistDisplay } from '@molecules/DecklistDisplay'
import type { AnalysisData } from '@/types'

interface PlayerDetailProps {
  data: AnalysisData | null
}

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

interface MatchResult {
  round: number
  player1: string
  player2: string
  p1_wins: number
  p2_wins: number
}

// Normalize player name for matching - handles both 'First Last' and 'Last, First' formats
function normalizePlayerName(name: string): string {
  if (!name) return ''

  name = name.trim()

  // If it's in "Last, First" format, convert to "First Last"
  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      name = `${parts[1]} ${parts[0]}`
    }
  }

  // Normalize to lowercase and remove extra spaces
  return name.toLowerCase().split(/\s+/).join(' ')
}


function PlayerDetail({ data }: PlayerDetailProps) {
  const { playerName } = useParams<{ playerName: string }>()
  const decodedName = decodeURIComponent(playerName || '')
  const [decklist, setDecklist] = useState<DecklistData | null>(null)
  const [playerMatches, setPlayerMatches] = useState<MatchResult[]>([])
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})

  useEffect(() => {
    // Load decklist data
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        const decklistsMap: Record<string, DecklistData> = {}
        const normalizedPlayerName = normalizePlayerName(decodedName)
        let foundDecklist: DecklistData | null = null
        
        for (const dl of Object.values(decklistsData)) {
          const d = dl as DecklistData
          decklistsMap[d.player] = d
          // Use normalized matching to find current player's decklist
          if (normalizePlayerName(d.player) === normalizedPlayerName && !foundDecklist) {
            foundDecklist = d
          }
        }
        setDecklists(decklistsMap)
        setDecklist(foundDecklist)
      })
      .catch(err => console.error('Error loading decklist:', err))
  }, [decodedName])


  useEffect(() => {
    // Load match results
    fetch('/results.json')
      .then(res => res.json())
      .then((results: MatchResult[]) => {
        const normalizedPlayerName = normalizePlayerName(decodedName)
        const matches = results.filter((r: MatchResult) => {
          const p1Normalized = normalizePlayerName(r.player1)
          const p2Normalized = normalizePlayerName(r.player2)
          return p1Normalized === normalizedPlayerName || p2Normalized === normalizedPlayerName
        })
        setPlayerMatches(matches)
      })
      .catch(err => console.error('Error loading results:', err))
  }, [decodedName])

  if (!data) {
    return <LoadingState />
  }

  // Separate draft and constructed rounds
  const DRAFT_ROUNDS = new Set([1, 2, 3, 8, 9, 10])
  
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
