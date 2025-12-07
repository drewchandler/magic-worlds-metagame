import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Box } from '@atoms/Box'
import { Card } from '@atoms/Card'
import { Container } from '@atoms/Container'
import { Grid } from '@atoms/Grid'
import { Link } from '@atoms/Link'
import { SortIcon } from '@atoms/SortIcon'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import CardTooltip from '@molecules/CardTooltip'
import { SectionHeader } from '@molecules/SectionHeader'
import { PageHeader } from '@molecules/PageHeader'
import { StatDisplay } from '@molecules/StatDisplay'
import { EmptyState } from '@molecules/EmptyState'
import { LoadingState } from '@molecules/LoadingState'
import type { AnalysisData } from '@/types'

interface ArchetypeDetailProps {
  data: AnalysisData | null
}

interface PlayerData {
  player: string
  archetype: string
  wins: number
  losses: number
  draws: number
  gamesWon: number
  gamesLost: number
  totalMatches: number
}

interface MatchResult {
  round: number
  player1: string
  player2: string
  p1_wins: number
  p2_wins: number
}

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

interface CardStats {
  name: string
  mainDeckTotal: number
  mainDeckAverage: number
  mainDeckDecksIncluded: number
  mainDeckPercentage: number
  sideboardTotal: number
  sideboardAverage: number
  sideboardDecksIncluded: number
  sideboardPercentage: number
}

type SortColumn = 'player' | 'matchRecord' | 'winRate' | 'gameRecord' | 'gameWinRate' | 'matches'
type CardSortColumn =
  | 'name'
  | 'mainDeckAverage'
  | 'sideboardAverage'
  | 'mainDeckPercentage'
  | 'sideboardPercentage'
type SortDirection = 'asc' | 'desc'

// Draft rounds to exclude from constructed statistics
const DRAFT_ROUNDS = new Set([1, 2, 3, 8, 9, 10])

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

function ArchetypeDetail({ data }: ArchetypeDetailProps) {
  const { archetypeName } = useParams<{ archetypeName: string }>()
  const decodedName = decodeURIComponent(archetypeName || '')
  const [players, setPlayers] = useState<Array<{ player: string; archetype: string }>>([])
  const [decklists, setDecklists] = useState<DecklistData[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [sortColumn, setSortColumn] = useState<SortColumn>('winRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [cardSortColumn, setCardSortColumn] = useState<CardSortColumn>('mainDeckAverage')
  const [cardSortDirection, setCardSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        const playersList: Array<{ player: string; archetype: string }> = []
        const decklistsList: DecklistData[] = []
        for (const decklist of Object.values(decklistsData)) {
          const dl = decklist as DecklistData
          if (dl.archetype === decodedName) {
            playersList.push({ player: dl.player, archetype: dl.archetype })
            decklistsList.push(dl)
          }
        }
        setPlayers(playersList)
        setDecklists(decklistsList)
      })
      .catch(err => console.error('Error loading decklists:', err))
  }, [decodedName])

  useEffect(() => {
    fetch('/results.json')
      .then(res => res.json())
      .then((resultsData: MatchResult[]) => {
        setResults(resultsData)
      })
      .catch(err => console.error('Error loading results:', err))
  }, [])

  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerData>()

    // Initialize stats for each player (using normalized names as keys)
    const normalizedPlayerMap = new Map<string, string>() // normalized -> original
    players.forEach(p => {
      const normalized = normalizePlayerName(p.player)
      normalizedPlayerMap.set(normalized, p.player)
      statsMap.set(normalized, {
        player: p.player,
        archetype: p.archetype,
        wins: 0,
        losses: 0,
        draws: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalMatches: 0,
      })
    })

    // Calculate stats from match results (excluding draft rounds)
    results.forEach((match: MatchResult) => {
      // Skip draft rounds for constructed statistics
      if (DRAFT_ROUNDS.has(match.round)) {
        return
      }

      const p1Normalized = normalizePlayerName(match.player1)
      const p2Normalized = normalizePlayerName(match.player2)

      const p1Stats = statsMap.get(p1Normalized)
      const p2Stats = statsMap.get(p2Normalized)

      if (p1Stats) {
        p1Stats.totalMatches++
        if (match.p1_wins > match.p2_wins) {
          p1Stats.wins++
        } else if (match.p2_wins > match.p1_wins) {
          p1Stats.losses++
        } else {
          p1Stats.draws++
        }
        p1Stats.gamesWon += match.p1_wins
        p1Stats.gamesLost += match.p2_wins
      }

      if (p2Stats) {
        p2Stats.totalMatches++
        if (match.p2_wins > match.p1_wins) {
          p2Stats.wins++
        } else if (match.p1_wins > match.p2_wins) {
          p2Stats.losses++
        } else {
          p2Stats.draws++
        }
        p2Stats.gamesWon += match.p2_wins
        p2Stats.gamesLost += match.p1_wins
      }
    })

    return Array.from(statsMap.values())
  }, [players, results])

  const sortedPlayerStats = useMemo(() => {
    const sorted = [...playerStats]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'player':
          comparison = a.player.localeCompare(b.player)
          break
        case 'matchRecord':
          comparison = a.wins - a.losses - (b.wins - b.losses)
          break
        case 'winRate': {
          const aRate = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0
          const bRate = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0
          comparison = aRate - bRate
          break
        }
        case 'gameRecord':
          comparison = a.gamesWon - a.gamesLost - (b.gamesWon - b.gamesLost)
          break
        case 'gameWinRate': {
          const aGameRate =
            a.gamesWon + a.gamesLost > 0 ? a.gamesWon / (a.gamesWon + a.gamesLost) : 0
          const bGameRate =
            b.gamesWon + b.gamesLost > 0 ? b.gamesWon / (b.gamesWon + b.gamesLost) : 0
          comparison = aGameRate - bGameRate
          break
        }
        case 'matches':
          comparison = a.totalMatches - b.totalMatches
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [playerStats, sortColumn, sortDirection])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const getWinRateColor = (rate: number): 'success' | 'warning' | 'danger' => {
    if (rate >= 0.6) return 'success'
    if (rate >= 0.4) return 'warning'
    return 'danger'
  }

  // Calculate card statistics
  const cardStats = useMemo(() => {
    const cardMap = new Map<
      string,
      {
        mainDeckTotal: number
        mainDeckDecksIncluded: number
        sideboardTotal: number
        sideboardDecksIncluded: number
      }
    >()
    const totalDecks = decklists.length

    decklists.forEach(decklist => {
      // Process main deck
      if (decklist.main_deck) {
        decklist.main_deck.forEach(card => {
          const existing = cardMap.get(card.name) || {
            mainDeckTotal: 0,
            mainDeckDecksIncluded: 0,
            sideboardTotal: 0,
            sideboardDecksIncluded: 0,
          }
          existing.mainDeckTotal += card.count
          existing.mainDeckDecksIncluded += 1
          cardMap.set(card.name, existing)
        })
      }

      // Process sideboard
      if (decklist.sideboard) {
        decklist.sideboard.forEach(card => {
          const existing = cardMap.get(card.name) || {
            mainDeckTotal: 0,
            mainDeckDecksIncluded: 0,
            sideboardTotal: 0,
            sideboardDecksIncluded: 0,
          }
          existing.sideboardTotal += card.count
          existing.sideboardDecksIncluded += 1
          cardMap.set(card.name, existing)
        })
      }
    })

    const stats: CardStats[] = []

    cardMap.forEach((stat, name) => {
      stats.push({
        name,
        mainDeckTotal: stat.mainDeckTotal,
        mainDeckAverage: stat.mainDeckTotal / totalDecks,
        mainDeckDecksIncluded: stat.mainDeckDecksIncluded,
        mainDeckPercentage: (stat.mainDeckDecksIncluded / totalDecks) * 100,
        sideboardTotal: stat.sideboardTotal,
        sideboardAverage: stat.sideboardTotal / totalDecks,
        sideboardDecksIncluded: stat.sideboardDecksIncluded,
        sideboardPercentage: (stat.sideboardDecksIncluded / totalDecks) * 100,
      })
    })

    return stats
  }, [decklists])

  const sortedCardStats = useMemo(() => {
    const sorted = [...cardStats]
    sorted.sort((a, b) => {
      let comparison = 0
      switch (cardSortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'mainDeckAverage':
          comparison = a.mainDeckAverage - b.mainDeckAverage
          break
        case 'sideboardAverage':
          comparison = a.sideboardAverage - b.sideboardAverage
          break
        case 'mainDeckPercentage':
          comparison = a.mainDeckPercentage - b.mainDeckPercentage
          break
        case 'sideboardPercentage':
          comparison = a.sideboardPercentage - b.sideboardPercentage
          break
      }
      return cardSortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [cardStats, cardSortColumn, cardSortDirection])

  const handleCardSort = (column: CardSortColumn) => {
    if (cardSortColumn === column) {
      setCardSortDirection(cardSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setCardSortColumn(column)
      setCardSortDirection('desc')
    }
  }

  if (!data) {
    return <LoadingState />
  }

  const archetypeStats = data.archetype_stats[decodedName]
  const archetypeCount = data.archetype_counts[decodedName] || 0

  return (
    <Container variant="page" padding="md">
      <Card variant="page">
        <PageHeader title={decodedName} />

        <Box padding="lg">
          <VStack spacing="md">
            <SectionHeader>Statistics</SectionHeader>
            {archetypeStats ? (
              <Grid columns={{ sm: 2, md: 5 }} spacing="md">
                <StatDisplay label="Players" value={archetypeCount} />
                <StatDisplay
                  label="Match Record"
                  value={
                    archetypeStats.draws && archetypeStats.draws > 0
                      ? `${archetypeStats.wins}-${archetypeStats.losses}-${archetypeStats.draws}`
                      : `${archetypeStats.wins}-${archetypeStats.losses}`
                  }
                />
                <StatDisplay
                  label="Match Win Rate"
                  value={`${(archetypeStats.win_rate * 100).toFixed(1)}%`}
                />
                <StatDisplay
                  label="Game Record"
                  value={`${archetypeStats.games_won}-${archetypeStats.games_lost}`}
                />
                <StatDisplay
                  label="Game Win Rate"
                  value={`${(archetypeStats.game_win_rate * 100).toFixed(1)}%`}
                />
              </Grid>
            ) : (
              <Text color="secondary">No statistics available</Text>
            )}
          </VStack>
        </Box>

        <Box padding="lg">
          <VStack spacing="md">
            <SectionHeader>Players ({sortedPlayerStats.length})</SectionHeader>
            <Card overflow shadow="lg">
              <Table>
                <TableHead>
                  <TableRow variant="header">
                    <TableHeader
                      onClick={() => handleSort('player')}
                      active={sortColumn === 'player'}
                      textColor="inverse"
                    >
                      Player{' '}
                      <SortIcon
                        column="player"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('matchRecord')}
                      active={sortColumn === 'matchRecord'}
                      textColor="inverse"
                    >
                      Match Record{' '}
                      <SortIcon
                        column="matchRecord"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('winRate')}
                      active={sortColumn === 'winRate'}
                      textColor="inverse"
                    >
                      Win Rate{' '}
                      <SortIcon
                        column="winRate"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('gameRecord')}
                      active={sortColumn === 'gameRecord'}
                      textColor="inverse"
                    >
                      Game Record{' '}
                      <SortIcon
                        column="gameRecord"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('gameWinRate')}
                      active={sortColumn === 'gameWinRate'}
                      textColor="inverse"
                    >
                      Game Win Rate{' '}
                      <SortIcon
                        column="gameWinRate"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('matches')}
                      active={sortColumn === 'matches'}
                      textColor="inverse"
                    >
                      Matches{' '}
                      <SortIcon
                        column="matches"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPlayerStats.length === 0 ? (
                    <EmptyState message="No players found for this archetype" colSpan={6} />
                  ) : (
                    sortedPlayerStats.map(playerStat => {
                      const winRate =
                        playerStat.wins + playerStat.losses > 0
                          ? playerStat.wins / (playerStat.wins + playerStat.losses)
                          : 0
                      const gameWinRate =
                        playerStat.gamesWon + playerStat.gamesLost > 0
                          ? playerStat.gamesWon / (playerStat.gamesWon + playerStat.gamesLost)
                          : 0

                      return (
                        <TableRow key={playerStat.player}>
                          <TableCell>
                            <Link to={`/player/${encodeURIComponent(playerStat.player)}`}>
                              <Text variant="body" className="font-medium">
                                {playerStat.player}
                              </Text>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Text>
                              {playerStat.draws > 0
                                ? `${playerStat.wins}-${playerStat.losses}-${playerStat.draws}`
                                : `${playerStat.wins}-${playerStat.losses}`}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text color={getWinRateColor(winRate)} className="font-bold">
                              {(winRate * 100).toFixed(1)}%
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text>
                              {playerStat.gamesWon}-{playerStat.gamesLost}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text color={getWinRateColor(gameWinRate)} className="font-bold">
                              {(gameWinRate * 100).toFixed(1)}%
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text>{playerStat.totalMatches}</Text>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </VStack>
        </Box>

        {decklists.length > 0 && (
          <Box padding="lg">
            <VStack spacing="md">
              <SectionHeader>Card Breakdown</SectionHeader>
              <Card overflow shadow="lg">
                <Table>
                  <TableHead>
                    <TableRow variant="header">
                      <TableHeader
                        onClick={() => handleCardSort('name')}
                        active={cardSortColumn === 'name'}
                        textColor="inverse"
                      >
                        Card Name{' '}
                        <SortIcon
                          column="name"
                          sortColumn={cardSortColumn}
                          sortDirection={cardSortDirection}
                        />
                      </TableHeader>
                      <TableHeader
                        onClick={() => handleCardSort('mainDeckAverage')}
                        active={cardSortColumn === 'mainDeckAverage'}
                        textColor="inverse"
                      >
                        Avg Main Deck{' '}
                        <SortIcon
                          column="mainDeckAverage"
                          sortColumn={cardSortColumn}
                          sortDirection={cardSortDirection}
                        />
                      </TableHeader>
                      <TableHeader
                        onClick={() => handleCardSort('mainDeckPercentage')}
                        active={cardSortColumn === 'mainDeckPercentage'}
                        textColor="inverse"
                      >
                        Main Deck %{' '}
                        <SortIcon
                          column="mainDeckPercentage"
                          sortColumn={cardSortColumn}
                          sortDirection={cardSortDirection}
                        />
                      </TableHeader>
                      <TableHeader
                        onClick={() => handleCardSort('sideboardAverage')}
                        active={cardSortColumn === 'sideboardAverage'}
                        textColor="inverse"
                      >
                        Avg Sideboard{' '}
                        <SortIcon
                          column="sideboardAverage"
                          sortColumn={cardSortColumn}
                          sortDirection={cardSortDirection}
                        />
                      </TableHeader>
                      <TableHeader
                        onClick={() => handleCardSort('sideboardPercentage')}
                        active={cardSortColumn === 'sideboardPercentage'}
                        textColor="inverse"
                      >
                        Sideboard %{' '}
                        <SortIcon
                          column="sideboardPercentage"
                          sortColumn={cardSortColumn}
                          sortDirection={cardSortDirection}
                        />
                      </TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedCardStats.length === 0 ? (
                      <EmptyState message="No card data available" colSpan={5} />
                    ) : (
                      sortedCardStats.map((cardStat, idx) => (
                        <TableRow key={`${cardStat.name}-${idx}`}>
                          <TableCell>
                            <Link to={`/card/${encodeURIComponent(cardStat.name)}`}>
                              <CardTooltip cardName={cardStat.name}>
                                <Text variant="body" className="font-medium">
                                  {cardStat.name}
                                </Text>
                              </CardTooltip>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Text>
                              {cardStat.mainDeckAverage > 0 ? cardStat.mainDeckAverage.toFixed(1) : '—'}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text>
                              {cardStat.mainDeckPercentage > 0
                                ? `${cardStat.mainDeckPercentage.toFixed(1)}%`
                                : '—'}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text>
                              {cardStat.sideboardAverage > 0
                                ? cardStat.sideboardAverage.toFixed(1)
                                : '—'}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text>
                              {cardStat.sideboardPercentage > 0
                                ? `${cardStat.sideboardPercentage.toFixed(1)}%`
                                : '—'}
                            </Text>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </VStack>
          </Box>
        )}
      </Card>
    </Container>
  )
}

export default ArchetypeDetail
