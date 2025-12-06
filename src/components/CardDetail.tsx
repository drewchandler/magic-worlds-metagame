import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import type { AnalysisData } from '../types'
import CardTooltip from './CardTooltip'

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

function CardDetail({ data }: CardDetailProps) {
  const { cardName } = useParams<{ cardName: string }>()
  const decodedName = decodeURIComponent(cardName || '')
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})

  useEffect(() => {
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        setDecklists(decklistsData)
      })
      .catch(err => console.error('Error loading decklists:', err))
  }, [])

  const archetypeStats = useMemo(() => {
    const archetypeMap = new Map<string, {
      totalCopies: number
      mainDeckCopies: number
      sideboardCopies: number
      decksIncluded: Set<string>
      totalDecks: Set<string>
    }>()

    Object.values(decklists).forEach((decklist: DecklistData) => {
      const archetype = decklist.archetype
      const deckKey = `${decklist.player}-${archetype}`
      
      const existing = archetypeMap.get(archetype) || {
        totalCopies: 0,
        mainDeckCopies: 0,
        sideboardCopies: 0,
        decksIncluded: new Set<string>(),
        totalDecks: new Set<string>()
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
        percentageIncluded: (stat.decksIncluded.size / totalDecks) * 100
      })
    })

    // Filter out archetypes with 0 copies and sort by total copies descending
    return stats
      .filter(stat => stat.totalCopies > 0)
      .sort((a, b) => b.totalCopies - a.totalCopies)
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
      percentageIncluded: totalDecks > 0 ? (decksIncluded / totalDecks) * 100 : 0
    }
  }, [decklists, decodedName])

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
          <Link to="/" className="text-white opacity-90 hover:opacity-100 hover:underline inline-block mb-3">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{decodedName}</h1>
            <CardTooltip cardName={decodedName}>
              <span className="text-white opacity-90 hover:opacity-100 cursor-pointer text-2xl">🃏</span>
            </CardTooltip>
          </div>
        </div>

        <div className="p-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">Overall Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-5">
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{totalStats.totalCopies}</div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Total Copies</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{totalStats.mainDeckCopies}</div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Main Deck</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{totalStats.sideboardCopies}</div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Sideboard</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{totalStats.decksIncluded}</div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Decks Included</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{totalStats.percentageIncluded.toFixed(1)}%</div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">% of Decks</div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">Archetypes ({archetypeStats.length})</h2>
          <div className="overflow-x-auto rounded-xl shadow-lg mt-5">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Archetype</th>
                  <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Total Copies</th>
                  <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Avg Main Deck</th>
                  <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Avg Sideboard</th>
                  <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Decks Included</th>
                  <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">% of Archetype</th>
                </tr>
              </thead>
              <tbody>
                {archetypeStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No archetypes found using this card
                    </td>
                  </tr>
                ) : (
                  archetypeStats.map((stat) => (
                    <tr key={stat.archetype} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <Link 
                          to={`/archetype/${encodeURIComponent(stat.archetype)}`} 
                          className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
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
                      <td className="p-4 text-gray-900">{stat.decksIncluded} / {stat.totalDecks}</td>
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

