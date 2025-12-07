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

interface CardDetailProps {
  data: AnalysisData | null
}

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

interface ArchetypeCardStat {
  archetype: string
  totalCopies: number
  mainDeckCopies: number
  sideboardCopies: number
  averageMainDeck: number
  averageSideboard: number
  decksIncluded: number
  totalDecks: number
  percentageIncluded: number
}

type SortColumn =
  | 'archetype'
  | 'totalCopies'
  | 'averageMainDeck'
  | 'averageSideboard'
  | 'decksIncluded'
  | 'percentageIncluded'
type SortDirection = 'asc' | 'desc'

function CardDetail({ data }: CardDetailProps) {
  const { cardName } = useParams<{ cardName: string }>()
  const decodedName = decodeURIComponent(cardName || '')
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>('percentageIncluded')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        setDecklists(decklistsData)
      })
      .catch(err => console.error('Error loading decklists:', err))
  }, [])

  const archetypeStats = useMemo(() => {
    const archetypeMap = new Map<
      string,
      {
        totalCopies: number
        mainDeckCopies: number
        sideboardCopies: number
        decksIncluded: Set<string>
        totalDecks: Set<string>
      }
    >()

    Object.values(decklists).forEach((decklist: DecklistData) => {
      const archetype = decklist.archetype
      const deckKey = `${decklist.player}-${archetype}`

      const existing = archetypeMap.get(archetype) || {
        totalCopies: 0,
        mainDeckCopies: 0,
        sideboardCopies: 0,
        decksIncluded: new Set<string>(),
        totalDecks: new Set<string>(),
      }

      existing.totalDecks.add(deckKey)

      let cardFound = false

      if (decklist.main_deck) {
        decklist.main_deck.forEach(card => {
          if (card.name === decodedName) {
            existing.mainDeckCopies += card.count
            existing.totalCopies += card.count
            existing.decksIncluded.add(deckKey)
            cardFound = true
          }
        })
      }

      if (decklist.sideboard) {
        decklist.sideboard.forEach(card => {
          if (card.name === decodedName) {
            existing.sideboardCopies += card.count
            existing.totalCopies += card.count
            if (!cardFound) {
              existing.decksIncluded.add(deckKey)
            }
          }
        })
      }

      archetypeMap.set(archetype, existing)
    })

    const stats: ArchetypeCardStat[] = []
    archetypeMap.forEach((stat, archetype) => {
      const totalDecks = stat.totalDecks.size
      stats.push({
        archetype,
        totalCopies: stat.totalCopies,
        mainDeckCopies: stat.mainDeckCopies,
        sideboardCopies: stat.sideboardCopies,
        averageMainDeck: stat.mainDeckCopies / totalDecks,
        averageSideboard: stat.sideboardCopies / totalDecks,
        decksIncluded: stat.decksIncluded.size,
        totalDecks,
        percentageIncluded: (stat.decksIncluded.size / totalDecks) * 100,
      })
    })

    // Filter out archetypes with 0 copies and sort by total copies descending
    return stats.filter(stat => stat.totalCopies > 0).sort((a, b) => b.totalCopies - a.totalCopies)
  }, [decklists, decodedName])

  const totalStats = useMemo(() => {
    let totalCopies = 0
    let mainDeckCopies = 0
    let sideboardCopies = 0
    let decksIncluded = 0
    let totalDecks = 0

    Object.values(decklists).forEach((decklist: DecklistData) => {
      totalDecks++
      let found = false

      if (decklist.main_deck) {
        decklist.main_deck.forEach(card => {
          if (card.name === decodedName) {
            totalCopies += card.count
            mainDeckCopies += card.count
            if (!found) {
              decksIncluded++
              found = true
            }
          }
        })
      }

      if (decklist.sideboard) {
        decklist.sideboard.forEach(card => {
          if (card.name === decodedName) {
            totalCopies += card.count
            sideboardCopies += card.count
            if (!found) {
              decksIncluded++
            }
          }
        })
      }
    })

    return {
      totalCopies,
      mainDeckCopies,
      sideboardCopies,
      decksIncluded,
      totalDecks,
      percentageIncluded: totalDecks > 0 ? (decksIncluded / totalDecks) * 100 : 0,
    }
  }, [decklists, decodedName])

  const sortedArchetypeStats = useMemo(() => {
    const sorted = [...archetypeStats].sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'archetype':
          comparison = a.archetype.localeCompare(b.archetype)
          break
        case 'totalCopies':
          comparison = a.totalCopies - b.totalCopies
          break
        case 'averageMainDeck':
          comparison = a.averageMainDeck - b.averageMainDeck
          break
        case 'averageSideboard':
          comparison = a.averageSideboard - b.averageSideboard
          break
        case 'decksIncluded':
          comparison = a.decksIncluded - b.decksIncluded
          break
        case 'percentageIncluded':
          comparison = a.percentageIncluded - b.percentageIncluded
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [archetypeStats, sortColumn, sortDirection])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  if (!data) {
    return <LoadingState />
  }

  return (
    <Container variant="page" padding="md">
      <Card variant="page">
        <PageHeader
          title={decodedName}
          subtitle={
            <CardTooltip cardName={decodedName}>
              <Text variant="body" color="inverse" className="opacity-90 hover:opacity-100 cursor-pointer text-2xl">
                🃏
              </Text>
            </CardTooltip>
          }
        />

        <Box padding="lg">
          <VStack spacing="md">
            <SectionHeader>Overall Statistics</SectionHeader>
            <Grid columns={{ sm: 2, md: 5 }} spacing="md">
              <StatDisplay label="Total Copies" value={totalStats.totalCopies} />
              <StatDisplay label="Main Deck" value={totalStats.mainDeckCopies} />
              <StatDisplay label="Sideboard" value={totalStats.sideboardCopies} />
              <StatDisplay label="Decks Included" value={totalStats.decksIncluded} />
              <StatDisplay label="% of Decks" value={`${totalStats.percentageIncluded.toFixed(1)}%`} />
            </Grid>
          </VStack>
        </Box>

        <Box padding="lg">
          <VStack spacing="md">
            <SectionHeader>Archetypes ({sortedArchetypeStats.length})</SectionHeader>
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
                      onClick={() => handleSort('totalCopies')}
                      active={sortColumn === 'totalCopies'}
                      textColor="inverse"
                    >
                      Total Copies{' '}
                      <SortIcon
                        column="totalCopies"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('averageMainDeck')}
                      active={sortColumn === 'averageMainDeck'}
                      textColor="inverse"
                    >
                      Avg Main Deck{' '}
                      <SortIcon
                        column="averageMainDeck"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('averageSideboard')}
                      active={sortColumn === 'averageSideboard'}
                      textColor="inverse"
                    >
                      Avg Sideboard{' '}
                      <SortIcon
                        column="averageSideboard"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('decksIncluded')}
                      active={sortColumn === 'decksIncluded'}
                      textColor="inverse"
                    >
                      Decks Included{' '}
                      <SortIcon
                        column="decksIncluded"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('percentageIncluded')}
                      active={sortColumn === 'percentageIncluded'}
                      textColor="inverse"
                    >
                      % of Archetype{' '}
                      <SortIcon
                        column="percentageIncluded"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedArchetypeStats.length === 0 ? (
                    <EmptyState message="No archetypes found using this card" colSpan={6} />
                  ) : (
                    sortedArchetypeStats.map(stat => (
                      <TableRow key={stat.archetype}>
                        <TableCell>
                          <Link to={`/archetype/${encodeURIComponent(stat.archetype)}`}>
                            <Text variant="body" className="font-medium">
                              {stat.archetype}
                            </Text>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Text>{stat.totalCopies}</Text>
                        </TableCell>
                        <TableCell>
                          <Text>{stat.averageMainDeck > 0 ? stat.averageMainDeck.toFixed(1) : '—'}</Text>
                        </TableCell>
                        <TableCell>
                          <Text>{stat.averageSideboard > 0 ? stat.averageSideboard.toFixed(1) : '—'}</Text>
                        </TableCell>
                        <TableCell>
                          <Text>{stat.decksIncluded} / {stat.totalDecks}</Text>
                        </TableCell>
                        <TableCell>
                          <Text>{stat.percentageIncluded.toFixed(1)}%</Text>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </VStack>
        </Box>
      </Card>
    </Container>
  )
}

export default CardDetail
