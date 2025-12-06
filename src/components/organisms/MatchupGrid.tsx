import { useMemo } from 'react'

import { Link } from '@atoms/Link'
import type { AnalysisData, MatchupStats } from '@/types'

interface MatchupGridProps {
  data: AnalysisData | null
}

function MatchupGrid({ data }: MatchupGridProps) {
  const matchupStats = useMemo(() => data?.matchup_stats || {}, [data?.matchup_stats])
  const archetypeCounts = useMemo(() => data?.archetype_counts || {}, [data?.archetype_counts])

  // Get all unique archetypes, sorted
  const archetypes = useMemo(() => {
    const archSet = new Set<string>()
    Object.keys(archetypeCounts).forEach(arch => archSet.add(arch))
    Object.values(matchupStats).forEach((matchup: MatchupStats) => {
      archSet.add(matchup.archetype1)
      archSet.add(matchup.archetype2)
    })
    return Array.from(archSet).sort()
  }, [archetypeCounts, matchupStats])

  // Create a lookup map for matchups
  const matchupMap = useMemo(() => {
    const map = new Map<string, MatchupStats>()
    Object.values(matchupStats).forEach((matchup: MatchupStats) => {
      const key = `${matchup.archetype1} vs ${matchup.archetype2}`
      map.set(key, matchup)
    })
    return map
  }, [matchupStats])

  const getMatchup = (arch1: string, arch2: string): MatchupStats | null => {
    if (arch1 === arch2) return null // Mirror match
    const key1 = `${arch1} vs ${arch2}`
    const key2 = `${arch2} vs ${arch1}`
    return matchupMap.get(key1) || matchupMap.get(key2) || null
  }

  const getWinRateBgClass = (rate: number): string => {
    if (rate >= 0.6) return 'bg-green-100'
    if (rate >= 0.4) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getWinRateTextClass = (rate: number): string => {
    if (rate >= 0.6) return 'text-green-700'
    if (rate >= 0.4) return 'text-yellow-600'
    return 'text-red-700'
  }

  if (!data || archetypes.length === 0) return null

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-5 text-slate-800 border-b-4 border-indigo-500 pb-3">
        Matchup Grid
      </h2>
      <p className="text-gray-600 text-sm italic mb-5">
        Win rates shown from the row archetype&apos;s perspective. Mirror matches are excluded.
      </p>
      <div className="overflow-auto rounded-xl shadow-lg max-h-[600px]">
        <table className="w-full bg-white border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider bg-gradient-to-br from-slate-800 to-blue-800 sticky left-0 z-30 min-w-[150px]">
                Archetype
              </th>
              {archetypes.map(arch => (
                <th
                  key={arch}
                  className="p-3 text-center font-semibold text-xs uppercase tracking-wider"
                >
                  <Link
                    to={`/archetype/${encodeURIComponent(arch)}`}
                    variant="nav"
                    className="block"
                  >
                    <div
                      className="max-w-[30px] overflow-hidden text-ellipsis whitespace-nowrap mx-auto"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {arch}
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {archetypes.map(rowArch => (
              <tr key={rowArch}>
                <td className="p-3 bg-gradient-to-br from-slate-800 to-blue-800 text-white text-left sticky left-0 z-10 min-w-[150px]">
                  <Link
                    to={`/archetype/${encodeURIComponent(rowArch)}`}
                    variant="nav"
                    className="font-semibold"
                  >
                    {rowArch}
                  </Link>
                </td>
                {archetypes.map(colArch => {
                  if (rowArch === colArch) {
                    return (
                      <td
                        key={colArch}
                        className="p-3 bg-gray-100 text-gray-500 italic text-center border border-gray-200"
                      >
                        —
                      </td>
                    )
                  }

                  const matchup = getMatchup(rowArch, colArch)
                  if (!matchup) {
                    return (
                      <td
                        key={colArch}
                        className="p-3 bg-gray-50 text-gray-400 text-center border border-gray-200"
                      >
                        —
                      </td>
                    )
                  }

                  // Determine which archetype is which
                  const isRowFirst = matchup.archetype1 === rowArch
                  const wins = isRowFirst ? matchup.arch1_wins : matchup.arch2_wins
                  const losses = isRowFirst ? matchup.arch2_wins : matchup.arch1_wins
                  const winRate = isRowFirst ? matchup.arch1_win_rate : matchup.arch2_win_rate
                  const totalMatches = matchup.total_matches

                  return (
                    <td
                      key={colArch}
                      className={`p-3 text-center border border-gray-200 cursor-pointer transition-all hover:scale-105 hover:z-10 hover:shadow-md relative ${getWinRateBgClass(winRate)}`}
                      title={`${rowArch} vs ${colArch}: ${wins}-${losses} (${(winRate * 100).toFixed(1)}%)`}
                    >
                      <div className="font-bold text-sm mb-1">
                        {wins}-{losses}
                      </div>
                      <div className={`text-lg font-bold mb-1 ${getWinRateTextClass(winRate)}`}>
                        {(winRate * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">({totalMatches})</div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MatchupGrid
