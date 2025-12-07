import { useState, useMemo } from 'react'

import { Box } from '@atoms/Box'
import { Card } from '@atoms/Card'
import { Select } from '@atoms/Select'
import { Link } from '@atoms/Link'
import { SortIcon } from '@atoms/SortIcon'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import { HStack } from '@atoms/HStack'
import { SectionHeader } from '@molecules/SectionHeader'
import { EmptyState } from '@molecules/EmptyState'
import type { AnalysisData, ArchetypeStats } from '@/types'

interface ArchetypeTableProps {
  data: AnalysisData | null
}

type SortColumn =
  | 'archetype'
  | 'matchRecord'
  | 'matchWinRate'
  | 'gameRecord'
  | 'gameWinRate'
type SortDirection = 'asc' | 'desc'

function ArchetypeTable({ data }: ArchetypeTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('matchWinRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [minMatches, setMinMatches] = useState<string>('0')

  const minMatchesOptions = [
    { value: '0', label: 'All' },
    { value: '25', label: '25+' },
    { value: '50', label: '50+' },
  ]

  const archetypeStats = useMemo(() => data?.archetype_stats || {}, [data?.archetype_stats])
  const archetypeCounts = useMemo(() => data?.archetype_counts || {}, [data?.archetype_counts])

  const sortedArchetypes = useMemo(() => {
    const minMatchesNum = parseInt(minMatches, 10) || 0
    let sorted = Object.entries(archetypeStats)
      .filter(([_arch, stats]: [string, ArchetypeStats]) => stats.total_matches >= minMatchesNum) as Array<[string, ArchetypeStats]>

    // Sort based on selected column
    sorted.sort((a, b) => {
      const [archA, statsA] = a
      const [archB, statsB] = b
      let comparison = 0

      switch (sortColumn) {
        case 'archetype':
          comparison = archA.localeCompare(archB)
          break
        case 'matchRecord':
          comparison = statsA.wins - statsA.losses - (statsB.wins - statsB.losses)
          break
        case 'matchWinRate':
          comparison = statsA.win_rate - statsB.win_rate
          break
        case 'gameRecord':
          comparison = statsA.games_won - statsA.games_lost - (statsB.games_won - statsB.games_lost)
          break
        case 'gameWinRate':
          comparison = statsA.game_win_rate - statsB.game_win_rate
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted as Array<[string, ArchetypeStats]>
  }, [archetypeStats, archetypeCounts, sortColumn, sortDirection, minMatches])

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
        <SectionHeader
          actions={
            <HStack spacing="sm" align="center">
              <Text variant="small">Min matches:</Text>
              <Select
                value={minMatches}
                onChange={e => setMinMatches(e.target.value)}
                options={minMatchesOptions}
                size="sm"
              />
            </HStack>
          }
        >
          Archetype Performance
        </SectionHeader>
        <Card overflow shadow="lg">
          <Table>
            <TableHead>
              <TableRow variant="header">
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
                  onClick={() => handleSort('matchWinRate')}
                  active={sortColumn === 'matchWinRate'}
                  textColor="inverse"
                >
                  Match Win Rate{' '}
                  <SortIcon
                    column="matchWinRate"
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
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedArchetypes.length === 0 ? (
                <EmptyState
                  message="No archetype data available"
                  colSpan={5}
                />
              ) : (
                sortedArchetypes.map(([arch, stats]) => {
                  const winRate = stats.win_rate || 0
                  const gameWinRate = stats.game_win_rate || 0
                  return (
                    <TableRow key={arch}>
                      <TableCell>
                        <Link to={`/archetype/${encodeURIComponent(arch)}`}>
                          <Text variant="body" className="font-semibold">
                            {arch}
                          </Text>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Text>
                          {stats.draws && stats.draws > 0
                            ? `${stats.wins}-${stats.losses}-${stats.draws}`
                            : `${stats.wins}-${stats.losses}`}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text color={getWinRateColor(winRate)} className="font-bold">
                          {(winRate * 100).toFixed(1)}%
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text>
                          {stats.games_won}-{stats.games_lost}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text color={getWinRateColor(gameWinRate)} className="font-bold">
                          {(gameWinRate * 100).toFixed(1)}%
                        </Text>
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
  )
}

export default ArchetypeTable
