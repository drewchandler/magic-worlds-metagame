import { useState, useEffect } from 'react'

import { Box } from '@atoms/Box'
import { Button } from '@atoms/Button'
import { HStack } from '@atoms/HStack'
import { Link } from '@atoms/Link'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import CardTooltip from '@molecules/CardTooltip'
import { SectionHeader } from '@molecules/SectionHeader'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

// Extract supertype from type_line (e.g., "Creature — Human Wizard" -> "Creature")
function extractSupertype(typeLine: string): string {
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

// Normalize card name for Scryfall query (handle split cards and variations)
function normalizeCardNameForScryfall(name: string): string {
  // Handle split cards - normalize " // " to " // " (with spaces)
  // Scryfall uses " // " (space-slash-slash-space) for split cards
  return name.replace(/\s*\/\/\s*/g, ' // ')
}

interface DecklistDisplayProps {
  decklist: DecklistData
}

export function DecklistDisplay({ decklist }: DecklistDisplayProps) {
  const [cardTypes, setCardTypes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  // Fetch card types from Scryfall when decklist is loaded
  useEffect(() => {
    if (!decklist?.main_deck || decklist.main_deck.length === 0) return

    const fetchCardTypes = async () => {
      const uniqueCardNames = [...new Set(decklist.main_deck!.map(c => c.name))]
      const typesMap: Record<string, string> = {}
      const nameMapping: Record<string, string> = {} // Map original name to normalized name

      // Normalize card names and create mapping
      uniqueCardNames.forEach(originalName => {
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
              data.data.forEach((card: any) => {
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
                    const fuzzyCard = await fuzzyResponse.json()
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

      setCardTypes(typesMap)
    }

    fetchCardTypes()
  }, [decklist])

  const formatDecklistForArena = (decklist: DecklistData): string => {
    let arenaFormat = ''
    
    if (decklist.main_deck && decklist.main_deck.length > 0) {
      decklist.main_deck.forEach(card => {
        arenaFormat += `${card.count} ${card.name}\n`
      })
    }
    
    if (decklist.sideboard && decklist.sideboard.length > 0) {
      arenaFormat += '\n'
      decklist.sideboard.forEach(card => {
        arenaFormat += `${card.count} ${card.name}\n`
      })
    }
    
    return arenaFormat.trim()
  }

  const handleExportToArena = async () => {
    if (!decklist) return

    const arenaFormat = formatDecklistForArena(decklist)
    
    try {
      await navigator.clipboard.writeText(arenaFormat)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy decklist:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = arenaFormat
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Box padding="lg">
      <VStack spacing="md">
        <HStack spacing="md" align="center" justify="between">
          <SectionHeader>Decklist</SectionHeader>
          <Button onClick={handleExportToArena} title="Copy decklist to clipboard in Magic Arena format">
            <HStack spacing="sm" align="center">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <Text variant="body" color="inverse">{copied ? 'Copied!' : 'Export to Arena'}</Text>
            </HStack>
          </Button>
        </HStack>
        <HStack spacing="lg" align="start">
          <Box grow>
            <VStack spacing="sm">
              <Text variant="h3">
                Main Deck ({decklist.main_deck?.reduce((sum, c) => sum + c.count, 0) || 0} cards)
              </Text>
              {decklist.main_deck && decklist.main_deck.length > 0 ? (
                (() => {
                  // Group cards by supertype
                  const grouped = decklist.main_deck.reduce((acc, card) => {
                    const supertype = cardTypes[card.name] || 'Other'
                    if (!acc[supertype]) {
                      acc[supertype] = []
                    }
                    acc[supertype].push(card)
                    return acc
                  }, {} as Record<string, Array<{ count: number; name: string }>>)

                  // Sort supertypes in a preferred order
                  const supertypeOrder = ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Land', 'Other']
                  const sortedSupertypes = Object.keys(grouped).sort((a, b) => {
                    const aIndex = supertypeOrder.indexOf(a)
                    const bIndex = supertypeOrder.indexOf(b)
                    const aPos = aIndex === -1 ? 999 : aIndex
                    const bPos = bIndex === -1 ? 999 : bIndex
                    return aPos - bPos
                  })

                  return (
                    <VStack spacing="md">
                      {sortedSupertypes.map(supertype => {
                        const cards = grouped[supertype]
                        // Sort cards alphabetically by name
                        const sortedCards = [...cards].sort((a, b) => a.name.localeCompare(b.name))
                        const totalCount = sortedCards.reduce((sum, c) => sum + c.count, 0)
                        return (
                          <Box key={supertype}>
                            <Text variant="h4" className="font-semibold mb-2">
                              {supertype} ({totalCount})
                            </Text>
                            <VStack spacing="xs">
                              {sortedCards.map((card, idx) => (
                                <Box key={idx} whitespace="nowrap">
                                  <HStack spacing="sm" align="center">
                                    <Text>{card.count}</Text>
                                    <CardTooltip cardName={card.name}>
                                      <Link to={`/card/${encodeURIComponent(card.name)}`}>
                                        {card.name}
                                      </Link>
                                    </CardTooltip>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )
                      })}
                    </VStack>
                  )
                })()
              ) : (
                <Text variant="small" color="secondary">No main deck data available</Text>
              )}
            </VStack>
          </Box>
          {decklist.sideboard && decklist.sideboard.length > 0 && (
            <Box grow>
              <VStack spacing="sm">
                <Text variant="h3">
                  Sideboard ({decklist.sideboard.reduce((sum, c) => sum + c.count, 0)} cards)
                </Text>
                <VStack spacing="xs">
                  {[...decklist.sideboard]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((card, idx) => (
                      <Box key={idx} whitespace="nowrap">
                        <HStack spacing="sm" align="center">
                          <Text>{card.count}</Text>
                          <CardTooltip cardName={card.name}>
                            <Link to={`/card/${encodeURIComponent(card.name)}`}>
                              {card.name}
                            </Link>
                          </CardTooltip>
                        </HStack>
                      </Box>
                    ))}
                </VStack>
              </VStack>
            </Box>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}

