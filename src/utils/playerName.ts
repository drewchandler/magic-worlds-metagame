/**
 * Player name normalization utilities
 */

// Normalize player name for matching - handles both 'First Last' and 'Last, First' formats
export function normalizePlayerName(name: string): string {
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

