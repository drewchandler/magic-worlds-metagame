import { useState, useEffect, useMemo } from 'react'

import { Box } from '@atoms/Box'
import { Card } from '@atoms/Card'
import { Input } from '@atoms/Input'
import { Link } from '@atoms/Link'
import { SortIcon } from '@atoms/SortIcon'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import { SectionHeader } from '@molecules/SectionHeader'
import { EmptyState } from '@molecules/EmptyState'
import { Pagination } from '@molecules/Pagination'
import type { AnalysisData } from '@/types'

interface PlayerTableProps {
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
}

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

type SortColumn = 'player' | 'archetype' | 'matchRecord' | 'winRate' | 'gameRecord' | 'gameWinRate' | 'matches'
type SortDirection = 'asc' | 'desc'

function PlayerTable({ data }: PlayerTableProps) {
  const [results, setResults] = useState<MatchResult[]>([])
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>('winRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetch('/results.json')
      .then(res => res.json())
      .then((resultsData: MatchResult[]) => {
        setResults(resultsData)
      })
      .catch(err => console.error('Error loading results:', err))
  }, [])

  useEffect(() => {
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        setDecklists(decklistsData)
      })
      .catch(err => console.error('Error loading decklists:', err))
  }, [])

  const playerStats = useMemo(() => {
    if (results.length === 0 || Object.keys(decklists).length === 0) {
      return []
    }

    const statsMap = new Map<string, PlayerData>()

    // Initialize stats for each player from decklists
    Object.values(decklists).forEach((decklist: DecklistData) => {
      const normalized = normalizePlayerName(decklist.player)
      statsMap.set(normalized, {
        player: decklist.player,
        archetype: decklist.archetype,
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
  }, [results, decklists])

  const filteredAndSortedPlayers = useMemo(() => {
    // Filter by search term
    let filtered = playerStats.filter(player => {
      const searchLower = searchTerm.toLowerCase()
      return (
        player.player.toLowerCase().includes(searchLower) ||
        player.archetype.toLowerCase().includes(searchLower)
      )
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'player':
          comparison = a.player.localeCompare(b.player)
          break
        case 'archetype':
          comparison = a.archetype.localeCompare(b.archetype)
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
          const aRate = a.gamesWon + a.gamesLost > 0 ? a.gamesWon / (a.gamesWon + a.gamesLost) : 0
          const bRate = b.gamesWon + b.gamesLost > 0 ? b.gamesWon / (b.gamesWon + b.gamesLost) : 0
          comparison = aRate - bRate
          break
        }
        case 'matches':
          comparison = a.totalMatches - b.totalMatches
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [playerStats, searchTerm, sortColumn, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedPlayers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPlayers = filteredAndSortedPlayers.slice(startIndex, endIndex)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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

  if (!data) return null

  return (
    <Box padding="lg">
      <VStack spacing="md">
        <SectionHeader>Player Statistics</SectionHeader>
        <Input
          type="text"
          fullWidth
          size="lg"
          placeholder="Search players or archetypes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
                  onClick={() => handleSort('archetype')}
                  active={sortColumn === 'archetype'}
                  textColor="inverse"
                >
                  Archetype{' '}
                  <SortIcon
                    column="archetype"
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
              {paginatedPlayers.length === 0 ? (
                <EmptyState
                  message={
                    searchTerm
                      ? 'No players found matching your search'
                      : 'No player data available'
                  }
                  colSpan={7}
                />
              ) : (
                paginatedPlayers.map(playerStat => {
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
                        <Link to={`/archetype/${encodeURIComponent(playerStat.archetype)}`}>
                          <Text variant="body">{playerStat.archetype}</Text>
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAndSortedPlayers.length}
          itemLabel="players"
          onPrevious={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          onNext={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        />
      </VStack>
    </Box>
  )
}

export default PlayerTable

