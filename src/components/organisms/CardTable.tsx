import { useState, useEffect, useMemo } from 'react'

import { Link } from '@atoms/Link'
import type { AnalysisData } from '@/types'

interface CardTableProps {
  data: AnalysisData | null
}

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
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
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>('totalCopies')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        setDecklists(decklistsData)
      })
      .catch(err => console.error('Error loading decklists:', err))
  }, [])

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
  const endIndex = startIndex + itemsPerPage
  const paginatedCardStats = sortedCardStats.slice(startIndex, endIndex)

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
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-5 text-slate-800 border-b-4 border-indigo-500 pb-3">
        Card Statistics
      </h2>
      <input
        type="text"
        className="w-full p-4 text-base border-2 border-gray-300 rounded-xl mb-5 focus:outline-none focus:border-indigo-500 transition-colors text-gray-900"
        placeholder="Search cards..."
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value)
          setCurrentPage(1)
        }}
      />
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <th
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'name' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('name')}
              >
                Card Name
                {sortColumn === 'name' && (
                  <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'totalCopies' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('totalCopies')}
              >
                Total Copies
                {sortColumn === 'totalCopies' && (
                  <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'mainDeckCopies' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('mainDeckCopies')}
              >
                Main Deck
                {sortColumn === 'mainDeckCopies' && (
                  <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'sideboardCopies' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('sideboardCopies')}
              >
                Sideboard
                {sortColumn === 'sideboardCopies' && (
                  <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'decksIncluded' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('decksIncluded')}
              >
                Decks
                {sortColumn === 'decksIncluded' && (
                  <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCardStats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  {searchTerm ? 'No cards found matching your search' : 'No card data available'}
                </td>
              </tr>
            ) : (
              paginatedCardStats.map(cardStat => (
                <tr key={cardStat.name} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <Link to={`/card/${encodeURIComponent(cardStat.name)}`}>
                      {cardStat.name}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-900">{cardStat.totalCopies}</td>
                  <td className="p-4 text-gray-900">{cardStat.mainDeckCopies}</td>
                  <td className="p-4 text-gray-900">{cardStat.sideboardCopies}</td>
                  <td className="p-4 text-gray-900">{cardStat.decksIncluded}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages} ({sortedCardStats.length} cards)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default CardTable
