import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import StatsGrid from './components/StatsGrid'
import ArchetypeTable from './components/ArchetypeTable'
import MatchupGrid from './components/MatchupGrid'
import ArchetypeDetail from './components/ArchetypeDetail'
import PlayerDetail from './components/PlayerDetail'
import CardTable from './components/CardTable'
import CardDetail from './components/CardDetail'
import Loading from './components/Loading'
import Error from './components/Error'
import type { AnalysisData } from './types'

function AppContent() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/analysis.json')
      if (!response.ok) {
        throw new Error('Failed to load analysis data. Make sure you\'ve run the spider and analysis scripts first.')
      }
      const analysisData: AnalysisData = await response.json()
      setData(analysisData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
        <Header />
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
        <Header />
        <Error message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5">
          <Header />
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
            <StatsGrid data={data} />
            <ArchetypeTable data={data} />
            <MatchupGrid data={data} />
            <CardTable data={data} />
            <footer className="text-center py-5 text-gray-600 bg-gray-50">
              <p>Data from <a href="https://magic.gg/events/magic-world-championship-31" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">magic.gg</a></p>
              <p className="mt-2">Last updated: {new Date().toLocaleString()}</p>
            </footer>
          </div>
        </div>
      } />
      <Route path="/archetype/:archetypeName" element={<ArchetypeDetail data={data} />} />
      <Route path="/player/:playerName" element={<PlayerDetail data={data} />} />
      <Route path="/card/:cardName" element={<CardDetail data={data} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
