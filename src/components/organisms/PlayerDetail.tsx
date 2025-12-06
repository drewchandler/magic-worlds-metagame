import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

import CardTooltip from '@molecules/CardTooltip'
import type { AnalysisData } from '@/types'

interface PlayerDetailProps {
  data: AnalysisData | null
}

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

interface MatchResult {
  round: number
  player1: string
  player2: string
  p1_wins: number
  p2_wins: number
}

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

type SortColumn = 'round' | 'opponent' | 'result' | 'archetype'
type SortDirection = 'asc' | 'desc'

interface SortIconProps {
  column: SortColumn
  sortColumn: SortColumn
  sortDirection: SortDirection
}

function SortIcon({ column, sortColumn, sortDirection }: SortIconProps) {
  if (sortColumn !== column) {
    return <span className="ml-1 text-gray-400">↕</span>
  }
  return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
}

function PlayerDetail({ data }: PlayerDetailProps) {
  const { playerName } = useParams<{ playerName: string }>()
  const decodedName = decodeURIComponent(playerName || '')
  const [decklist, setDecklist] = useState<DecklistData | null>(null)
  const [playerMatches, setPlayerMatches] = useState<MatchResult[]>([])
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>('round')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Load decklist data
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        const decklistsMap: Record<string, DecklistData> = {}
        for (const dl of Object.values(decklistsData)) {
          const d = dl as DecklistData
          decklistsMap[d.player] = d
          if (d.player === decodedName) {
            setDecklist(d)
          }
        }
        setDecklists(decklistsMap)
      })
      .catch(err => console.error('Error loading decklist:', err))
  }, [decodedName])

  useEffect(() => {
    // Load match results
    fetch('/results.json')
      .then(res => res.json())
      .then((results: MatchResult[]) => {
        const normalizedPlayerName = normalizePlayerName(decodedName)
        const matches = results.filter((r: MatchResult) => {
          const p1Normalized = normalizePlayerName(r.player1)
          const p2Normalized = normalizePlayerName(r.player2)
          return p1Normalized === normalizedPlayerName || p2Normalized === normalizedPlayerName
        })
        setPlayerMatches(matches)
      })
      .catch(err => console.error('Error loading results:', err))
  }, [decodedName])

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const playerStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    gamesWon: 0,
    gamesLost: 0,
  }

  const normalizedPlayerName = normalizePlayerName(decodedName)
  playerMatches.forEach((match: MatchResult) => {
    const p1Normalized = normalizePlayerName(match.player1)
    const isPlayer1 = p1Normalized === normalizedPlayerName
    if (isPlayer1) {
      if (match.p1_wins > match.p2_wins) playerStats.wins++
      else if (match.p2_wins > match.p1_wins) playerStats.losses++
      else playerStats.draws++
      playerStats.gamesWon += match.p1_wins
      playerStats.gamesLost += match.p2_wins
    } else {
      if (match.p2_wins > match.p1_wins) playerStats.wins++
      else if (match.p1_wins > match.p2_wins) playerStats.losses++
      else playerStats.draws++
      playerStats.gamesWon += match.p2_wins
      playerStats.gamesLost += match.p1_wins
    }
  })

  const winRate =
    playerStats.wins + playerStats.losses > 0
      ? playerStats.wins / (playerStats.wins + playerStats.losses)
      : 0

  // Sort matches
  const sortedMatches = [...playerMatches].sort((a, b) => {
    const p1Normalized = normalizePlayerName(decodedName)
    const aIsPlayer1 = normalizePlayerName(a.player1) === p1Normalized
    const bIsPlayer1 = normalizePlayerName(b.player1) === p1Normalized
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const formatDecklistForArena = (decklist: DecklistData): string => {
    const lines: string[] = []
    
    // Main deck
    if (decklist.main_deck && decklist.main_deck.length > 0) {
      decklist.main_deck.forEach(card => {
        lines.push(`${card.count} ${card.name}`)
      })
    }
    
    // Sideboard
    if (decklist.sideboard && decklist.sideboard.length > 0) {
      lines.push('') // Blank line separator
      decklist.sideboard.forEach(card => {
        lines.push(`${card.count} ${card.name}`)
      })
    }
    
    return lines.join('\n')
  }

  const handleExportToArena = async () => {
    if (!decklist) return
    
    const arenaFormat = formatDecklistForArena(decklist)
    
    try {
      await navigator.clipboard.writeText(arenaFormat)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Fallback: select text in a textarea
      const textarea = document.createElement('textarea')
      textarea.value = arenaFormat
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textarea)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white p-10 rounded-t-3xl">
          <Link
            to="/"
            className="text-white opacity-90 hover:opacity-100 hover:underline inline-block mb-3"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-3">{decodedName}</h1>
          {decklist && (
            <Link
              to={`/archetype/${encodeURIComponent(decklist.archetype)}`}
              className="inline-block mt-3 px-4 py-2 bg-white rounded-lg font-semibold hover:bg-gray-100 transition-all border border-gray-300 hover:underline text-gray-900"
            >
              {decklist.archetype}
            </Link>
          )}
        </div>

        <div className="p-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
            Match Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {playerStats.draws > 0
                  ? `${playerStats.wins}-${playerStats.losses}-${playerStats.draws}`
                  : `${playerStats.wins}-${playerStats.losses}`}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Match Record</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {(winRate * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Win Rate</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {playerStats.gamesWon}-{playerStats.gamesLost}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Game Record</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{playerMatches.length}</div>
              <div className="text-gray-600 text-sm uppercase tracking-wider">Total Matches</div>
            </div>
          </div>
        </div>

        <div className="p-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-5 text-slate-800 border-b-2 border-indigo-500 pb-2">
            Matches
          </h2>
          <div className="overflow-x-auto rounded-xl shadow-lg mt-5">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('round')}
                  >
                    Round{' '}
                    <SortIcon
                      column="round"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('opponent')}
                  >
                    Opponent{' '}
                    <SortIcon
                      column="opponent"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('result')}
                  >
                    Result{' '}
                    <SortIcon
                      column="result"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th
                    className="p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => handleSort('archetype')}
                  >
                    Opponent Archetype{' '}
                    <SortIcon
                      column="archetype"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMatches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                      No matches found
                    </td>
                  </tr>
                ) : (
                  sortedMatches.map((match: MatchResult, idx: number) => {
                    const p1Normalized = normalizePlayerName(match.player1)
                    const isPlayer1 = p1Normalized === normalizedPlayerName
                    const opponent = isPlayer1 ? match.player2 : match.player1
                    const playerWins = isPlayer1 ? match.p1_wins : match.p2_wins
                    const opponentWins = isPlayer1 ? match.p2_wins : match.p1_wins
                    const won = playerWins > opponentWins
                    const draw = playerWins === opponentWins

                    // Try to find opponent's decklist using normalized matching
                    let opponentDecklist: DecklistData | undefined
                    const opponentNormalized = normalizePlayerName(opponent)
                    for (const dl of Object.values(decklists)) {
                      if (normalizePlayerName(dl.player) === opponentNormalized) {
                        opponentDecklist = dl
                        break
                      }
                    }
                    const opponentArchetype = opponentDecklist?.archetype || 'Unknown'

                    // Determine result color
                    let resultColor = 'text-red-600'
                    if (won) {
                      resultColor = 'text-green-600'
                    } else if (draw) {
                      resultColor = 'text-yellow-600'
                    }

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-900">{match.round}</td>
                        <td className="p-4">
                          <Link
                            to={`/player/${encodeURIComponent(opponent)}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                          >
                            {opponent}
                          </Link>
                        </td>
                        <td className={`p-4 font-bold ${resultColor}`}>
                          {playerWins}-{opponentWins}
                        </td>
                        <td className="p-4">
                          <Link
                            to={`/archetype/${encodeURIComponent(opponentArchetype)}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                          >
                            {opponentArchetype}
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {decklist && (
          <div className="p-10">
            <div className="flex items-center justify-between mb-5 border-b-2 border-indigo-500 pb-2">
              <h2 className="text-2xl font-bold text-slate-800">Decklist</h2>
              <button
                onClick={handleExportToArena}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                title="Copy decklist to clipboard in Magic Arena format"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                {copied ? 'Copied!' : 'Export to Arena'}
              </button>
            </div>
            <div className="mt-5 flex gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 text-slate-700">
                  Main Deck ({decklist.main_deck?.reduce((sum, c) => sum + c.count, 0) || 0} cards)
                </h3>
                <div className="relative">
                  {decklist.main_deck && decklist.main_deck.length > 0 ? (
                    decklist.main_deck.map((card, idx) => (
                      <div key={idx} className="text-gray-900 whitespace-nowrap">
                        {card.count}{' '}
                        <CardTooltip cardName={card.name}>
                          <Link
                            to={`/card/${encodeURIComponent(card.name)}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            {card.name}
                          </Link>
                        </CardTooltip>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No main deck data available</p>
                  )}
                </div>
              </div>
              {decklist.sideboard && decklist.sideboard.length > 0 && (
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-4 text-slate-700">
                    Sideboard ({decklist.sideboard.reduce((sum, c) => sum + c.count, 0)} cards)
                  </h3>
                  <div className="relative">
                    {decklist.sideboard.map((card, idx) => (
                      <div key={idx} className="text-gray-900 whitespace-nowrap">
                        {card.count}{' '}
                        <CardTooltip cardName={card.name}>
                          <Link
                            to={`/card/${encodeURIComponent(card.name)}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            {card.name}
                          </Link>
                        </CardTooltip>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerDetail
