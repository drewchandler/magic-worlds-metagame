import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Link } from '@atoms/Link'
import CardTooltip from '@molecules/CardTooltip'
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

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <span className="ml-1 text-gray-400">↕</span>
    }
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white p-10 rounded-t-3xl">
          <Link
            to="/"
            variant="nav"
            className="inline-block mb-3"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{decodedName}</h1>
            <CardTooltip cardName={decodedName}>
              <span className="text-white opacity-90 hover:opacity-100 cursor-pointer text-2xl">
                🃏
              </span>
            </CardTooltip>
          </div>
        </div>

        <div className="p-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
            Overall Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-5">
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {totalStats.totalCopies}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Total Copies</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {totalStats.mainDeckCopies}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Main Deck</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {totalStats.sideboardCopies}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Sideboard</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {totalStats.decksIncluded}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Decks Included</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {totalStats.percentageIncluded.toFixed(1)}%
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">% of Decks</div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
            Archetypes ({sortedArchetypeStats.length})
          </h2>
          <div className="overflow-x-auto rounded-xl shadow-lg mt-5">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('archetype')}
                  >
                    Archetype <SortIcon column="archetype" />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('totalCopies')}
                  >
                    Total Copies <SortIcon column="totalCopies" />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('averageMainDeck')}
                  >
                    Avg Main Deck <SortIcon column="averageMainDeck" />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('averageSideboard')}
                  >
                    Avg Sideboard <SortIcon column="averageSideboard" />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('decksIncluded')}
                  >
                    Decks Included <SortIcon column="decksIncluded" />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('percentageIncluded')}
                  >
                    % of Archetype <SortIcon column="percentageIncluded" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedArchetypeStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No archetypes found using this card
                    </td>
                  </tr>
                ) : (
                  sortedArchetypeStats.map(stat => (
                    <tr key={stat.archetype} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <Link
                          to={`/archetype/${encodeURIComponent(stat.archetype)}`}
                          className="font-medium"
                        >
                          {stat.archetype}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-900">{stat.totalCopies}</td>
                      <td className="p-4 text-gray-900">
                        {stat.averageMainDeck > 0 ? stat.averageMainDeck.toFixed(1) : '—'}
                      </td>
                      <td className="p-4 text-gray-900">
                        {stat.averageSideboard > 0 ? stat.averageSideboard.toFixed(1) : '—'}
                      </td>
                      <td className="p-4 text-gray-900">
                        {stat.decksIncluded} / {stat.totalDecks}
                      </td>
                      <td className="p-4 text-gray-900">{stat.percentageIncluded.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDetail
