import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Link } from '@atoms/Link'
import CardTooltip from '@molecules/CardTooltip'
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

  const getWinRateClass = (rate: number): string => {
    if (rate >= 0.6) return 'text-green-600'
    if (rate >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const archetypeStats = data.archetype_stats[decodedName]
  const archetypeCount = data.archetype_counts[decodedName] || 0

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
          <h1 className="text-4xl font-bold mb-3">{decodedName}</h1>
        </div>

        <div className="p-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
            Statistics
          </h2>
          {archetypeStats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-5">
              <div className="bg-gray-50 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{archetypeCount}</div>
                <div className="text-gray-600 text-sm uppercase tracking-wider">Players</div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {archetypeStats.draws && archetypeStats.draws > 0
                    ? `${archetypeStats.wins}-${archetypeStats.losses}-${archetypeStats.draws}`
                    : `${archetypeStats.wins}-${archetypeStats.losses}`}
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider">Match Record</div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {(archetypeStats.win_rate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider">Match Win Rate</div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {archetypeStats.games_won}-{archetypeStats.games_lost}
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider">Game Record</div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {(archetypeStats.game_win_rate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider">Game Win Rate</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No statistics available</p>
          )}
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
            Players ({sortedPlayerStats.length})
          </h2>
          <div className="overflow-x-auto rounded-xl shadow-lg mt-5">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <th
                    className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'player' ? 'bg-indigo-600' : ''}`}
                    onClick={() => handleSort('player')}
                  >
                    Player
                    {sortColumn === 'player' && (
                      <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'matchRecord' ? 'bg-indigo-600' : ''}`}
                    onClick={() => handleSort('matchRecord')}
                  >
                    Match Record
                    {sortColumn === 'matchRecord' && (
                      <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'winRate' ? 'bg-indigo-600' : ''}`}
                    onClick={() => handleSort('winRate')}
                  >
                    Win Rate
                    {sortColumn === 'winRate' && (
                      <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'gameRecord' ? 'bg-indigo-600' : ''}`}
                    onClick={() => handleSort('gameRecord')}
                  >
                    Game Record
                    {sortColumn === 'gameRecord' && (
                      <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'gameWinRate' ? 'bg-indigo-600' : ''}`}
                    onClick={() => handleSort('gameWinRate')}
                  >
                    Game Win Rate
                    {sortColumn === 'gameWinRate' && (
                      <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'matches' ? 'bg-indigo-600' : ''}`}
                    onClick={() => handleSort('matches')}
                  >
                    Matches
                    {sortColumn === 'matches' && (
                      <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayerStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No players found for this archetype
                    </td>
                  </tr>
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
                      <tr key={playerStat.player} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <Link
                            to={`/player/${encodeURIComponent(playerStat.player)}`}
                            className="font-medium"
                          >
                            {playerStat.player}
                          </Link>
                        </td>
                        <td className="p-4">
                          {playerStat.draws > 0
                            ? `${playerStat.wins}-${playerStat.losses}-${playerStat.draws}`
                            : `${playerStat.wins}-${playerStat.losses}`}
                        </td>
                        <td className="p-4">
                          <span className={`font-bold ${getWinRateClass(winRate)}`}>
                            {(winRate * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4">
                          {playerStat.gamesWon}-{playerStat.gamesLost}
                        </td>
                        <td className="p-4">
                          <span className={`font-bold ${getWinRateClass(gameWinRate)}`}>
                            {(gameWinRate * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4">{playerStat.totalMatches}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {decklists.length > 0 && (
          <div className="p-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
              Card Breakdown
            </h2>
            <div className="mt-5 overflow-x-auto rounded-xl shadow-lg">
              <table className="w-full bg-white border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th
                      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${cardSortColumn === 'name' ? 'bg-indigo-600' : ''}`}
                      onClick={() => handleCardSort('name')}
                    >
                      Card Name
                      {cardSortColumn === 'name' && (
                        <span className="ml-2">{cardSortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${cardSortColumn === 'mainDeckAverage' ? 'bg-indigo-600' : ''}`}
                      onClick={() => handleCardSort('mainDeckAverage')}
                    >
                      Avg Main Deck
                      {cardSortColumn === 'mainDeckAverage' && (
                        <span className="ml-2">{cardSortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${cardSortColumn === 'mainDeckPercentage' ? 'bg-indigo-600' : ''}`}
                      onClick={() => handleCardSort('mainDeckPercentage')}
                    >
                      Main Deck %
                      {cardSortColumn === 'mainDeckPercentage' && (
                        <span className="ml-2">{cardSortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${cardSortColumn === 'sideboardAverage' ? 'bg-indigo-600' : ''}`}
                      onClick={() => handleCardSort('sideboardAverage')}
                    >
                      Avg Sideboard
                      {cardSortColumn === 'sideboardAverage' && (
                        <span className="ml-2">{cardSortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${cardSortColumn === 'sideboardPercentage' ? 'bg-indigo-600' : ''}`}
                      onClick={() => handleCardSort('sideboardPercentage')}
                    >
                      Sideboard %
                      {cardSortColumn === 'sideboardPercentage' && (
                        <span className="ml-2">{cardSortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCardStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500">
                        No card data available
                      </td>
                    </tr>
                  ) : (
                    sortedCardStats.map((cardStat, idx) => (
                      <tr
                        key={`${cardStat.name}-${idx}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            to={`/card/${encodeURIComponent(cardStat.name)}`}
                            className="font-medium"
                          >
                            <CardTooltip cardName={cardStat.name}>{cardStat.name}</CardTooltip>
                          </Link>
                        </td>
                        <td className="p-4 text-gray-900">
                          {cardStat.mainDeckAverage > 0 ? cardStat.mainDeckAverage.toFixed(1) : '—'}
                        </td>
                        <td className="p-4 text-gray-900">
                          {cardStat.mainDeckPercentage > 0
                            ? `${cardStat.mainDeckPercentage.toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="p-4 text-gray-900">
                          {cardStat.sideboardAverage > 0
                            ? cardStat.sideboardAverage.toFixed(1)
                            : '—'}
                        </td>
                        <td className="p-4 text-gray-900">
                          {cardStat.sideboardPercentage > 0
                            ? `${cardStat.sideboardPercentage.toFixed(1)}%`
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchetypeDetail
