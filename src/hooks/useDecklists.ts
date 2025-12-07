import { useState, useEffect } from 'react'
import { normalizePlayerName } from '@/utils/playerName'

export interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

/**
 * Hook to fetch all decklists
 */
export function useDecklists() {
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        setDecklists(decklistsData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading decklists:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { decklists, loading, error }
}

/**
 * Hook to fetch a specific player's decklist
 */
export function usePlayerDecklist(playerName: string) {
  const { decklists, loading, error } = useDecklists()
  const [decklist, setDecklist] = useState<DecklistData | null>(null)

  useEffect(() => {
    if (!playerName || Object.keys(decklists).length === 0) {
      setDecklist(null)
      return
    }

    const normalizedPlayerName = normalizePlayerName(playerName)
    let foundDecklist: DecklistData | null = null

    for (const dl of Object.values(decklists)) {
      if (normalizePlayerName(dl.player) === normalizedPlayerName) {
        foundDecklist = dl
        break
      }
    }

    setDecklist(foundDecklist)
  }, [playerName, decklists])

  return { decklist, loading, error }
}

