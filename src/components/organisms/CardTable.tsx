import { useState, useMemo, useEffect } from 'react'

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
import { useDecklists } from '@/hooks/useDecklists'
import type { AnalysisData, DecklistData } from '@/types'

interface CardTableProps {
  data: AnalysisData | null
}

interface CardStat {
  name: string
  totalCopies: number
  mainDeckCopies: number
  sideboardCopies: number
  decksIncluded: number
}

type SortColumn = 'name' | 'totalCopies' | 'mainDeckCopies' | 'sideboardCopies' | 'decksIncluded'
type SortDirection = 'asc' | 'desc'

function CardTable({ data }: CardTableProps) {
  const { decklists } = useDecklists()
  const [sortColumn, setSortColumn] = useState<SortColumn>('totalCopies')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 50

  const cardStats = useMemo(() => {
    const cardMap = new Map<
      string,
      {
        totalCopies: number
        mainDeckCopies: number
        sideboardCopies: number
        decksIncluded: Set<string>
      }
    >()

    Object.values(decklists).forEach((decklist: DecklistData) => {
      const deckKey = `${decklist.player}-${decklist.archetype}`

      if (decklist.main_deck) {
        decklist.main_deck.forEach(card => {
          const existing = cardMap.get(card.name) || {
            totalCopies: 0,
            mainDeckCopies: 0,
            sideboardCopies: 0,
            decksIncluded: new Set<string>(),
          }
          existing.totalCopies += card.count
          existing.mainDeckCopies += card.count
          existing.decksIncluded.add(deckKey)
          cardMap.set(card.name, existing)
        })
      }

      if (decklist.sideboard) {
        decklist.sideboard.forEach(card => {
          const existing = cardMap.get(card.name) || {
            totalCopies: 0,
            mainDeckCopies: 0,
            sideboardCopies: 0,
            decksIncluded: new Set<string>(),
          }
          existing.totalCopies += card.count
          existing.sideboardCopies += card.count
          existing.decksIncluded.add(deckKey)
          cardMap.set(card.name, existing)
        })
      }
    })

    const stats: CardStat[] = []
    cardMap.forEach((stat, name) => {
      stats.push({
        name,
        totalCopies: stat.totalCopies,
        mainDeckCopies: stat.mainDeckCopies,
        sideboardCopies: stat.sideboardCopies,
        decksIncluded: stat.decksIncluded.size,
      })
    })

    return stats
  }, [decklists])

  const sortedCardStats = useMemo(() => {
    let sorted = cardStats.filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    sorted.sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'totalCopies':
          comparison = a.totalCopies - b.totalCopies
          break
        case 'mainDeckCopies':
          comparison = a.mainDeckCopies - b.mainDeckCopies
          break
        case 'sideboardCopies':
          comparison = a.sideboardCopies - b.sideboardCopies
          break
        case 'decksIncluded':
          comparison = a.decksIncluded - b.decksIncluded
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [cardStats, sortColumn, sortDirection, searchTerm])

  const totalPages = Math.ceil(sortedCardStats.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCardStats = sortedCardStats.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (!data) return null

  return (
    <Box padding="lg">
      <VStack spacing="md">
        <SectionHeader>Card Statistics</SectionHeader>
        <Input
          fullWidth
          size="lg"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <Card overflow shadow="lg">
          <Table>
            <TableHead>
              <TableRow variant="header">
                <TableHeader
                  onClick={() => handleSort('name')}
                  active={sortColumn === 'name'}
                  textColor="inverse"
                >
                  Card Name{' '}
                  <SortIcon
                    column="name"
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
                  onClick={() => handleSort('mainDeckCopies')}
                  active={sortColumn === 'mainDeckCopies'}
                  textColor="inverse"
                >
                  Main Deck{' '}
                  <SortIcon
                    column="mainDeckCopies"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
                <TableHeader
                  onClick={() => handleSort('sideboardCopies')}
                  active={sortColumn === 'sideboardCopies'}
                  textColor="inverse"
                >
                  Sideboard{' '}
                  <SortIcon
                    column="sideboardCopies"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
                <TableHeader
                  onClick={() => handleSort('decksIncluded')}
                  active={sortColumn === 'decksIncluded'}
                  textColor="inverse"
                >
                  Decks{' '}
                  <SortIcon
                    column="decksIncluded"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCardStats.length === 0 ? (
                <EmptyState
                  message={
                    searchTerm
                      ? 'No cards found matching your search'
                      : 'No card data available'
                  }
                  colSpan={5}
                />
              ) : (
                paginatedCardStats.map(cardStat => (
                  <TableRow key={cardStat.name}>
                    <TableCell>
                      <Link to={`/card/${encodeURIComponent(cardStat.name)}`}>
                        <Text variant="body" className="font-semibold">
                          {cardStat.name}
                        </Text>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Text>{cardStat.totalCopies}</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{cardStat.mainDeckCopies}</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{cardStat.sideboardCopies}</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{cardStat.decksIncluded}</Text>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedCardStats.length}
          itemLabel="cards"
          onPrevious={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          onNext={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        />
      </VStack>
    </Box>
  )
}

export default CardTable
