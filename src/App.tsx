import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider, ScrollRestoration, Outlet } from 'react-router-dom'

import { ArchetypeDetailPage } from '@pages/ArchetypeDetailPage'
import { CardDetailPage } from '@pages/CardDetailPage'
import { DashboardPage } from '@pages/DashboardPage'
import { ErrorPage } from '@pages/ErrorPage'
import { LoadingPage } from '@pages/LoadingPage'
import { PlayerDetailPage } from '@pages/PlayerDetailPage'
import type { AnalysisData } from '@/types'

// Create context for sharing data across routes
const DataContext = createContext<AnalysisData | null>(null)

export function useData() {
  return useContext(DataContext)
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration
        getKey={location => {
          // Preserve scroll position for back/forward navigation
          return location.key
        }}
      />
    </>
  )
}

// Create router once - static configuration
// Data will be provided via Context
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'archetype/:archetypeName',
        element: <ArchetypeDetailPage />,
      },
      {
        path: 'player/:playerName',
        element: <PlayerDetailPage />,
      },
      {
        path: 'card/:cardName',
        element: <CardDetailPage />,
      },
    ],
  },
])

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
        throw new Error(
          "Failed to load analysis data. Make sure you've run the spider and analysis scripts first."
        )
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
  }, [])

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return <ErrorPage message={error} onRetry={loadData} />
  }

  // Provide data via Context, router is static and created once
  return (
    <DataContext.Provider value={data}>
      <RouterProvider router={router} />
    </DataContext.Provider>
  )
}

function App() {
  return <AppContent />
}

export default App
