import { useState, useEffect } from 'react'
import { normalizePlayerName } from '@/utils/playerName'

export interface MatchResult {
  round: number
  player1: string
  player2: string
  p1_wins: number
  p2_wins: number
}

/**
 * Hook to fetch all match results
 */
export function useResults() {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/results.json')
      .then(res => res.json())
      .then((resultsData: MatchResult[]) => {
        setResults(resultsData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading results:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { results, loading, error }
}

/**
 * Hook to fetch matches for a specific player
 */
export function usePlayerMatches(playerName: string) {
  const { results, loading, error } = useResults()
  const [playerMatches, setPlayerMatches] = useState<MatchResult[]>([])

  useEffect(() => {
    if (!playerName || results.length === 0) {
      setPlayerMatches([])
      return
    }

    const normalizedPlayerName = normalizePlayerName(playerName)
    const matches = results.filter((r: MatchResult) => {
      const p1Normalized = normalizePlayerName(r.player1)
      const p2Normalized = normalizePlayerName(r.player2)
      return p1Normalized === normalizedPlayerName || p2Normalized === normalizedPlayerName
    })

    setPlayerMatches(matches)
  }, [playerName, results])

  return { playerMatches, loading, error }
}

