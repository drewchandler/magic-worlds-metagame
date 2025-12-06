import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { AnalysisData, ArchetypeStats } from '../types'

interface ArchetypeTableProps {
  data: AnalysisData | null
}

type SortColumn = 'archetype' | 'players' | 'matchRecord' | 'matchWinRate' | 'gameRecord' | 'gameWinRate'
type SortDirection = 'asc' | 'desc'

function ArchetypeTable({ data }: ArchetypeTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('matchWinRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const archetypeStats = data?.archetype_stats || {}
  const archetypeCounts = data?.archetype_counts || {}

  const sortedArchetypes = useMemo(() => {
    let sorted = Object.entries(archetypeStats)
      .filter(([arch, stats]: [string, ArchetypeStats]) => stats.total_matches > 0)
      .filter(([arch]: [string, ArchetypeStats]) => 
        arch.toLowerCase().includes(searchTerm.toLowerCase())
      ) as Array<[string, ArchetypeStats]>

    // Sort based on selected column
    sorted.sort((a, b) => {
      const [archA, statsA] = a
      const [archB, statsB] = b
      let comparison = 0

      switch (sortColumn) {
        case 'archetype':
          comparison = archA.localeCompare(archB)
          break
        case 'players':
          comparison = (archetypeCounts[archA] || 0) - (archetypeCounts[archB] || 0)
          break
        case 'matchRecord':
          comparison = (statsA.wins - statsA.losses) - (statsB.wins - statsB.losses)
          break
        case 'matchWinRate':
          comparison = statsA.win_rate - statsB.win_rate
          break
        case 'gameRecord':
          comparison = (statsA.games_won - statsA.games_lost) - (statsB.games_won - statsB.games_lost)
          break
        case 'gameWinRate':
          comparison = statsA.game_win_rate - statsB.game_win_rate
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted as Array<[string, ArchetypeStats]>
  }, [archetypeStats, archetypeCounts, searchTerm, sortColumn, sortDirection])

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

  if (!data) return null

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-5 text-slate-800 border-b-4 border-indigo-500 pb-3">Archetype Performance</h2>
      <input
        type="text"
        className="w-full p-4 text-base border-2 border-gray-300 rounded-xl mb-5 focus:outline-none focus:border-indigo-500 transition-colors text-gray-900"
        placeholder="Search archetypes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <th 
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'archetype' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('archetype')}
              >
                Archetype
                {sortColumn === 'archetype' && (
                  <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'players' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('players')}
              >
                Players
                {sortColumn === 'players' && (
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
                className={`p-4 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-600 transition-colors ${sortColumn === 'matchWinRate' ? 'bg-indigo-600' : ''}`}
                onClick={() => handleSort('matchWinRate')}
              >
                Match Win Rate
                {sortColumn === 'matchWinRate' && (
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
            </tr>
          </thead>
          <tbody>
            {sortedArchetypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  {searchTerm ? 'No archetypes found matching your search' : 'No archetype data available'}
                </td>
              </tr>
            ) : (
              sortedArchetypes.map(([arch, stats]) => {
                const winRate = stats.win_rate || 0
                const gameWinRate = stats.game_win_rate || 0
                return (
                  <tr key={arch} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Link 
                        to={`/archetype/${encodeURIComponent(arch)}`} 
                        className="text-gray-900 font-semibold hover:text-indigo-600 hover:underline transition-colors"
                      >
                        {arch}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-900">{archetypeCounts[arch] || 0}</td>
                    <td className="p-4 text-gray-900">{stats.wins}-{stats.losses}</td>
                    <td className="p-4">
                      <span className={`font-bold ${getWinRateClass(winRate)}`}>
                        {(winRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-gray-900">{stats.games_won}-{stats.games_lost}</td>
                    <td className="p-4">
                      <span className={`font-bold ${getWinRateClass(gameWinRate)}`}>
                        {(gameWinRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ArchetypeTable
