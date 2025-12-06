import type { AnalysisData } from '../types'

interface StatsGridProps {
  data: AnalysisData | null
}

function StatsGrid({ data }: StatsGridProps) {
  if (!data) return null

  const archetypeCounts = data.archetype_counts || {}
  const totalPlayers = data.total_players || 0
  const totalMatches = data.total_matches || 0
  const totalDecks = Object.values(archetypeCounts).reduce((sum, count) => sum + count, 0)
  const numArchetypes = Object.keys(archetypeCounts).length

  const stats = [
    { label: 'Players', value: totalPlayers },
    { label: 'Archetypes', value: numArchetypes },
    { label: 'Matches', value: totalMatches },
    { label: 'Total Decks', value: totalDecks },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 p-8 bg-gray-50">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-5 rounded-xl shadow-md text-center hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
          <div className="text-gray-600 text-sm uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatsGrid
