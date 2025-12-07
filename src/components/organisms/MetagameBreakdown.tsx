import { useState, useEffect, useMemo } from 'react'

import { Box } from '@atoms/Box'
import { Card } from '@atoms/Card'
import { SortIcon } from '@atoms/SortIcon'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import { Link } from '@atoms/Link'
import { SectionHeader } from '@molecules/SectionHeader'
import { EmptyState } from '@molecules/EmptyState'
import { normalizePlayerName } from '@/utils/playerName'
import { DAY_2_START_ROUND } from '@/utils/constants'
import type { AnalysisData } from '@/types'

interface MetagameBreakdownProps {
  data: AnalysisData | null
}

interface MatchResult {
  round: number
  player1: string
  player2: string
}

interface DecklistData {
  player: string
  archetype: string
}


interface ArchetypeMetagameData {
  archetype: string
  day1Players: number
  day1Percentage: number
  day2Players: number
  day2Percentage: number
  conversionRate: number
}

type SortColumn = 'archetype' | 'day1Players' | 'day1Percentage' | 'day2Percentage' | 'conversionRate'
type SortDirection = 'asc' | 'desc'

function MetagameBreakdown({ data }: MetagameBreakdownProps) {
  const [results, setResults] = useState<MatchResult[]>([])
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>('day1Percentage')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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

  const metagameData = useMemo(() => {
    if (!data || results.length === 0 || Object.keys(decklists).length === 0) {
      return []
    }

    const archetypeCounts = data.archetype_counts || {}
    
    // Get all players who made day 2 (played in round 11+)
    const day2PlayersSet = new Set<string>()
    results.forEach((result: MatchResult) => {
      if (result.round >= DAY_2_START_ROUND) {
        day2PlayersSet.add(result.player1)
        day2PlayersSet.add(result.player2)
      }
    })

    // Normalize day 2 players for matching
    const day2PlayersNormalized = new Set<string>()
    day2PlayersSet.forEach(player => {
      day2PlayersNormalized.add(normalizePlayerName(player))
    })

    // Count players per archetype for day 1 and day 2
    const archetypeDay1Counts: Record<string, number> = {}
    const archetypeDay2Counts: Record<string, number> = {}

    // Day 1: all players from archetype_counts
    Object.entries(archetypeCounts).forEach(([archetype, count]) => {
      archetypeDay1Counts[archetype] = count
      archetypeDay2Counts[archetype] = 0
    })

    // Day 2: count players who made day 2 by archetype
    Object.values(decklists).forEach((decklist: DecklistData) => {
      const normalizedPlayer = normalizePlayerName(decklist.player)
      if (day2PlayersNormalized.has(normalizedPlayer)) {
        const archetype = decklist.archetype
        archetypeDay2Counts[archetype] = (archetypeDay2Counts[archetype] || 0) + 1
      }
    })

    const totalDay1Players = Object.values(archetypeDay1Counts).reduce((sum, count) => sum + count, 0)
    const totalDay2Players = Object.values(archetypeDay2Counts).reduce((sum, count) => sum + count, 0)

    const metagame: ArchetypeMetagameData[] = []
    Object.keys(archetypeCounts).forEach(archetype => {
      const day1Players = archetypeDay1Counts[archetype] || 0
      const day2Players = archetypeDay2Counts[archetype] || 0
      
      const day1Percentage = totalDay1Players > 0 ? (day1Players / totalDay1Players) * 100 : 0
      const day2Percentage = totalDay2Players > 0 ? (day2Players / totalDay2Players) * 100 : 0
      const conversionRate = day1Players > 0 ? (day2Players / day1Players) * 100 : 0

      metagame.push({
        archetype,
        day1Players,
        day1Percentage,
        day2Players,
        day2Percentage,
        conversionRate,
      })
    })

    return metagame
  }, [data, results, decklists])

  const sortedMetagame = useMemo(() => {
    const sorted = [...metagameData].sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'archetype':
          comparison = a.archetype.localeCompare(b.archetype)
          break
        case 'day1Players':
          comparison = a.day1Players - b.day1Players
          break
        case 'day1Percentage':
          comparison = a.day1Percentage - b.day1Percentage
          break
        case 'day2Percentage':
          comparison = a.day2Percentage - b.day2Percentage
          break
        case 'conversionRate':
          comparison = a.conversionRate - b.conversionRate
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [metagameData, sortColumn, sortDirection])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  if (!data) return null

  return (
    <Box padding="lg">
      <VStack spacing="md">
        <SectionHeader>Metagame Breakdown</SectionHeader>
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
                  onClick={() => handleSort('day1Players')}
                  active={sortColumn === 'day1Players'}
                  textColor="inverse"
                >
                  Players{' '}
                  <SortIcon
                    column="day1Players"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
                <TableHeader
                  onClick={() => handleSort('day1Percentage')}
                  active={sortColumn === 'day1Percentage'}
                  textColor="inverse"
                >
                  Day 1 %{' '}
                  <SortIcon
                    column="day1Percentage"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
                <TableHeader
                  onClick={() => handleSort('day2Percentage')}
                  active={sortColumn === 'day2Percentage'}
                  textColor="inverse"
                >
                  Day 2 %{' '}
                  <SortIcon
                    column="day2Percentage"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
                <TableHeader
                  onClick={() => handleSort('conversionRate')}
                  active={sortColumn === 'conversionRate'}
                  textColor="inverse"
                >
                  Day 2 Conversion{' '}
                  <SortIcon
                    column="conversionRate"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedMetagame.length === 0 ? (
                <EmptyState message="No metagame data available" colSpan={5} />
              ) : (
                sortedMetagame.map(item => (
                  <TableRow key={item.archetype}>
                    <TableCell>
                      <Link to={`/archetype/${encodeURIComponent(item.archetype)}`}>
                        <Text variant="body" className="font-semibold">
                          {item.archetype}
                        </Text>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Text>{item.day1Players}</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{item.day1Percentage.toFixed(1)}%</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{item.day2Percentage.toFixed(1)}%</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{item.conversionRate.toFixed(1)}%</Text>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </VStack>
    </Box>
  )
}

export default MetagameBreakdown

