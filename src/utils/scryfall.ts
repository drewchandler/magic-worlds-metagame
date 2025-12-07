/**
 * Scryfall API utilities
 */

// Normalize card name for Scryfall query (handle split cards and variations)
export function normalizeCardNameForScryfall(name: string): string {
  // Handle split cards - normalize " // " to " // " (with spaces)
  // Scryfall uses " // " (space-slash-slash-space) for split cards
  return name.replace(/\s*\/\/\s*/g, ' // ')
}

// Extract supertype from type_line (e.g., "Creature — Human Wizard" -> "Creature")
export function extractSupertype(typeLine: string): string {
  if (!typeLine) return 'Other'
  
  // Common supertypes
  const supertypes = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Planeswalker', 'Land']
  for (const supertype of supertypes) {
    if (typeLine.includes(supertype)) {
      return supertype
    }
  }
  
  return 'Other'
}

interface ScryfallCard {
  name: string
  type_line?: string
  image_uris?: {
    normal?: string
  }
  card_faces?: Array<{
    image_uris?: {
      normal?: string
    }
  }>
}

/**
 * Fetch a single card image URL from Scryfall
 */
export async function fetchCardImage(cardName: string): Promise<string | null> {
  try {
    const searchName = cardName.replace(/\/\/.*$/, '').trim()
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(searchName)}`)
    
    if (!response.ok) return null
    
    const data: ScryfallCard = await response.json()
    
    if (data.image_uris?.normal) {
      return data.image_uris.normal
    } else if (data.card_faces?.[0]?.image_uris?.normal) {
      return data.card_faces[0].image_uris.normal
    }
    
    return null
  } catch (err) {
    console.error(`Error fetching card image for ${cardName}:`, err)
    return null
  }
}

/**
 * Fetch card types (supertypes) for multiple cards in batch
 * Returns a map of card name -> supertype
 */
export async function fetchCardTypes(cardNames: string[]): Promise<Record<string, string>> {
  const typesMap: Record<string, string> = {}
  const nameMapping: Record<string, string> = {} // Map original name to normalized name

  // Normalize card names and create mapping
  cardNames.forEach(originalName => {
    const normalized = normalizeCardNameForScryfall(originalName)
    nameMapping[normalized] = originalName
  })

  const normalizedNames = Object.keys(nameMapping)

  // Scryfall collection API allows up to 75 cards per request
  const batchSize = 75
  for (let i = 0; i < normalizedNames.length; i += batchSize) {
    const batch = normalizedNames.slice(i, i + batchSize)
    const identifiers = batch.map(name => ({ name }))

    try {
      const response = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifiers }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          data.data.forEach((card: ScryfallCard) => {
            const supertype = extractSupertype(card.type_line || '')
            // Map back to original name
            const originalName = nameMapping[card.name] || card.name
            typesMap[originalName] = supertype
          })
        }
        
        // Handle cards not found - try fuzzy matching for split cards
        if (data.not_found && data.not_found.length > 0) {
          for (const notFound of data.not_found) {
            const normalizedName = notFound.name
            const originalName = nameMapping[normalizedName]
            
            // Try querying with fuzzy search for split cards
            try {
              const fuzzyResponse = await fetch(
                `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(normalizedName)}`
              )
              if (fuzzyResponse.ok) {
                const fuzzyCard: ScryfallCard = await fuzzyResponse.json()
                const supertype = extractSupertype(fuzzyCard.type_line || '')
                if (originalName) {
                  typesMap[originalName] = supertype
                }
              }
              await new Promise(resolve => setTimeout(resolve, 100))
            } catch (err) {
              console.error(`Error fetching card ${normalizedName}:`, err)
            }
          }
        }
      }
      // Add a small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (err) {
      console.error('Error fetching card types:', err)
    }
  }

  return typesMap
}

