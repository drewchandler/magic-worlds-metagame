import { useState, useMemo } from 'react'

import { Badge } from '@atoms/Badge'
import { Card } from '@atoms/Card'
import { Link } from '@atoms/Link'
import { SortIcon } from '@atoms/SortIcon'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'
import { EmptyState } from '@molecules/EmptyState'

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

interface MatchesTableProps {
  matches: MatchResult[]
  currentPlayerName: string
  decklists: Record<string, DecklistData>
  normalizePlayerName: (name: string) => string
  draftRounds: Set<number>
}

type SortColumn = 'round' | 'opponent' | 'result' | 'archetype'
type SortDirection = 'asc' | 'desc'

export function MatchesTable({
  matches,
  currentPlayerName,
  decklists,
  normalizePlayerName,
  draftRounds,
}: MatchesTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('round')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const normalizedPlayerName = normalizePlayerName(currentPlayerName)

  const sortedMatches = useMemo(() => {
    const sorted = [...matches].sort((a, b) => {
      const aIsPlayer1 = normalizePlayerName(a.player1) === normalizedPlayerName
      const bIsPlayer1 = normalizePlayerName(b.player1) === normalizedPlayerName
      const aOpponent = aIsPlayer1 ? a.player2 : a.player1
      const bOpponent = bIsPlayer1 ? b.player2 : b.player1
      const aPlayerWins = aIsPlayer1 ? a.p1_wins : a.p2_wins
      const bPlayerWins = bIsPlayer1 ? b.p1_wins : b.p2_wins
      const aOpponentWins = aIsPlayer1 ? a.p2_wins : a.p1_wins
      const bOpponentWins = bIsPlayer1 ? b.p2_wins : b.p1_wins

      // Try to find opponent archetypes
      const aOpponentNormalized = normalizePlayerName(aOpponent)
      const bOpponentNormalized = normalizePlayerName(bOpponent)
      let aOpponentArchetype = 'Unknown'
      let bOpponentArchetype = 'Unknown'
      for (const dl of Object.values(decklists)) {
        if (normalizePlayerName(dl.player) === aOpponentNormalized) {
          aOpponentArchetype = dl.archetype
        }
        if (normalizePlayerName(dl.player) === bOpponentNormalized) {
          bOpponentArchetype = dl.archetype
        }
      }

      let comparison = 0
      switch (sortColumn) {
        case 'round':
          comparison = a.round - b.round
          break
        case 'opponent':
          comparison = aOpponent.localeCompare(bOpponent)
          break
        case 'result':
          comparison = aPlayerWins - aOpponentWins - (bPlayerWins - bOpponentWins)
          break
        case 'archetype':
          comparison = aOpponentArchetype.localeCompare(bOpponentArchetype)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [matches, normalizedPlayerName, decklists, sortColumn, sortDirection, normalizePlayerName])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <Card overflow shadow="lg">
      <Table>
        <TableHead>
          <TableRow variant="header">
            <TableHeader
              onClick={() => handleSort('round')}
              active={sortColumn === 'round'}
              textColor="inverse"
            >
              Round{' '}
              <SortIcon
                column="round"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </TableHeader>
            <TableHeader
              onClick={() => handleSort('opponent')}
              active={sortColumn === 'opponent'}
              textColor="inverse"
            >
              Opponent{' '}
              <SortIcon
                column="opponent"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </TableHeader>
            <TableHeader
              onClick={() => handleSort('result')}
              active={sortColumn === 'result'}
              textColor="inverse"
            >
              Result{' '}
              <SortIcon
                column="result"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </TableHeader>
            <TableHeader
              onClick={() => handleSort('archetype')}
              active={sortColumn === 'archetype'}
              textColor="inverse"
            >
              Opponent Archetype{' '}
              <SortIcon
                column="archetype"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedMatches.length === 0 ? (
            <EmptyState message="No matches found" colSpan={4} />
          ) : (
            sortedMatches.map((match: MatchResult, idx: number) => {
              const aIsPlayer1 = normalizePlayerName(match.player1) === normalizedPlayerName
              const opponent = aIsPlayer1 ? match.player2 : match.player1
              const playerWins = aIsPlayer1 ? match.p1_wins : match.p2_wins
              const opponentWins = aIsPlayer1 ? match.p2_wins : match.p1_wins
              const won = playerWins > opponentWins
              const draw = playerWins === opponentWins
              const isDraft = draftRounds.has(match.round)

              // Try to find opponent's decklist using normalized matching
              let opponentDecklist: DecklistData | undefined
              const opponentNormalized = normalizePlayerName(opponent)
              // First try direct lookup
              opponentDecklist = decklists[opponent]
              // If not found, try normalized lookup
              if (!opponentDecklist) {
                for (const dl of Object.values(decklists)) {
                  if (normalizePlayerName(dl.player) === opponentNormalized) {
                    opponentDecklist = dl
                    break
                  }
                }
              }
              const opponentArchetype = opponentDecklist?.archetype || 'Unknown'

              // Determine result badge variant
              let resultVariant: 'success' | 'warning' | 'danger' = 'danger'
              if (won) {
                resultVariant = 'success'
              } else if (draw) {
                resultVariant = 'warning'
              }

              return (
                <TableRow key={idx}>
                  <TableCell>
                    <Text>{match.round}</Text>
                  </TableCell>
                  <TableCell>
                    <Link to={`/player/${encodeURIComponent(opponent)}`}>
                      {opponent}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={resultVariant}>
                      {playerWins}-{opponentWins}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isDraft ? (
                      <Text color="info">Draft</Text>
                    ) : (
                      <Link to={`/archetype/${encodeURIComponent(opponentArchetype)}`}>
                        {opponentArchetype}
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

