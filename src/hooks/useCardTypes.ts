import { useState, useEffect } from 'react'
import { fetchCardTypes } from '@/utils/scryfall'

interface Card {
  name: string
}

/**
 * Hook to fetch card types (supertypes) for a list of cards
 */
export function useCardTypes(cards: Card[] | undefined) {
  const [cardTypes, setCardTypes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cards || cards.length === 0) {
      setCardTypes({})
      return
    }

    const uniqueCardNames = [...new Set(cards.map(c => c.name))]
    if (uniqueCardNames.length === 0) return

    setLoading(true)
    fetchCardTypes(uniqueCardNames)
      .then(typesMap => {
        setCardTypes(typesMap)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching card types:', err)
        setLoading(false)
      })
  }, [cards])

  return { cardTypes, loading }
}

