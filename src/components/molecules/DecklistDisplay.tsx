import { useState, useEffect } from 'react'

import { Box } from '@atoms/Box'
import { Button } from '@atoms/Button'
import { HStack } from '@atoms/HStack'
import { Link } from '@atoms/Link'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import CardTooltip from '@molecules/CardTooltip'
import { SectionHeader } from '@molecules/SectionHeader'
import { extractSupertype, normalizeCardNameForScryfall, fetchCardTypes } from '@/utils/scryfall'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { Icon } from '@atoms/Icon'
import type { DecklistData } from '@/types'

interface DecklistDisplayProps {
  decklist: DecklistData
}

export function DecklistDisplay({ decklist }: DecklistDisplayProps) {
  const [cardTypes, setCardTypes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  // Fetch card types from Scryfall when decklist is loaded
  useEffect(() => {
    if (!decklist?.main_deck || decklist.main_deck.length === 0) return

    const loadCardTypes = async () => {
      const uniqueCardNames = [...new Set(decklist.main_deck!.map(c => c.name))]
      const typesMap = await fetchCardTypes(uniqueCardNames)
      setCardTypes(typesMap)
    }

    loadCardTypes()
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
              <Icon>
                <ArrowDownTrayIcon />
              </Icon>
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

