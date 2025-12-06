import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

import { Card } from '@atoms/Card'
import { Text } from '@atoms/Text'
import { Grid } from '@atoms/Grid'
import { VStack } from '@atoms/VStack'
import { HStack } from '@atoms/HStack'
import { Container } from '@atoms/Container'
import { Box } from '@atoms/Box'
import { Button } from '@atoms/Button'
import { Link } from '@atoms/Link'
import { Badge } from '@atoms/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Divider } from '@atoms/Divider'
import { SortIcon } from '@atoms/SortIcon'
import CardTooltip from '@molecules/CardTooltip'
import type { AnalysisData } from '@/types'

interface PlayerDetailProps {
  data: AnalysisData | null
}

interface DecklistData {
  player: string
  archetype: string
  main_deck?: Array<{ count: number; name: string }>
  sideboard?: Array<{ count: number; name: string }>
}

interface MatchResult {
  round: number
  player1: string
  player2: string
  p1_wins: number
  p2_wins: number
}

// Normalize player name for matching - handles both 'First Last' and 'Last, First' formats
function normalizePlayerName(name: string): string {
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

type SortColumn = 'round' | 'opponent' | 'result' | 'archetype'
type SortDirection = 'asc' | 'desc'

function PlayerDetail({ data }: PlayerDetailProps) {
  const { playerName } = useParams<{ playerName: string }>()
  const decodedName = decodeURIComponent(playerName || '')
  const [decklist, setDecklist] = useState<DecklistData | null>(null)
  const [playerMatches, setPlayerMatches] = useState<MatchResult[]>([])
  const [decklists, setDecklists] = useState<Record<string, DecklistData>>({})
  const [sortColumn, setSortColumn] = useState<SortColumn>('round')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Load decklist data
    fetch('/decklists.json')
      .then(res => res.json())
      .then(decklistsData => {
        const decklistsMap: Record<string, DecklistData> = {}
        for (const dl of Object.values(decklistsData)) {
          const d = dl as DecklistData
          decklistsMap[d.player] = d
          if (d.player === decodedName) {
            setDecklist(d)
          }
        }
        setDecklists(decklistsMap)
      })
      .catch(err => console.error('Error loading decklist:', err))
  }, [decodedName])

  useEffect(() => {
    // Load match results
    fetch('/results.json')
      .then(res => res.json())
      .then((results: MatchResult[]) => {
        const normalizedPlayerName = normalizePlayerName(decodedName)
        const matches = results.filter((r: MatchResult) => {
          const p1Normalized = normalizePlayerName(r.player1)
          const p2Normalized = normalizePlayerName(r.player2)
          return p1Normalized === normalizedPlayerName || p2Normalized === normalizedPlayerName
        })
        setPlayerMatches(matches)
      })
      .catch(err => console.error('Error loading results:', err))
  }, [decodedName])

  if (!data) {
    return (
      <Container variant="page" padding="md">
        <Card variant="page" padding="lg">
          <Text>Loading...</Text>
        </Card>
      </Container>
    )
  }

  // Separate draft and constructed rounds
  const DRAFT_ROUNDS = new Set([1, 2, 3, 8, 9, 10])
  
  const draftStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    gamesWon: 0,
    gamesLost: 0,
  }
  
  const constructedStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    gamesWon: 0,
    gamesLost: 0,
  }

  const normalizedPlayerName = normalizePlayerName(decodedName)
  playerMatches.forEach((match: MatchResult) => {
    const isDraft = DRAFT_ROUNDS.has(match.round)
    const stats = isDraft ? draftStats : constructedStats
    
    const p1Normalized = normalizePlayerName(match.player1)
    const isPlayer1 = p1Normalized === normalizedPlayerName
    if (isPlayer1) {
      if (match.p1_wins > match.p2_wins) stats.wins++
      else if (match.p2_wins > match.p1_wins) stats.losses++
      else stats.draws++
      stats.gamesWon += match.p1_wins
      stats.gamesLost += match.p2_wins
    } else {
      if (match.p2_wins > match.p1_wins) stats.wins++
      else if (match.p1_wins > match.p2_wins) stats.losses++
      else stats.draws++
      stats.gamesWon += match.p2_wins
      stats.gamesLost += match.p1_wins
    }
  })

  const draftWinRate =
    draftStats.wins + draftStats.losses > 0
      ? draftStats.wins / (draftStats.wins + draftStats.losses)
      : 0
      
  const constructedWinRate =
    constructedStats.wins + constructedStats.losses > 0
      ? constructedStats.wins / (constructedStats.wins + constructedStats.losses)
      : 0
      
  const totalStats = {
    wins: draftStats.wins + constructedStats.wins,
    losses: draftStats.losses + constructedStats.losses,
    draws: draftStats.draws + constructedStats.draws,
    gamesWon: draftStats.gamesWon + constructedStats.gamesWon,
    gamesLost: draftStats.gamesLost + constructedStats.gamesLost,
  }
  
  const totalWinRate =
    totalStats.wins + totalStats.losses > 0
      ? totalStats.wins / (totalStats.wins + totalStats.losses)
      : 0

  // Sort matches
  const sortedMatches = [...playerMatches].sort((a, b) => {
    const p1Normalized = normalizePlayerName(decodedName)
    const aIsPlayer1 = normalizePlayerName(a.player1) === p1Normalized
    const bIsPlayer1 = normalizePlayerName(b.player1) === p1Normalized
    const aOpponent = aIsPlayer1 ? a.player2 : a.player1
    const bOpponent = bIsPlayer1 ? b.player2 : b.player1
    const aPlayerWins = aIsPlayer1 ? a.p1_wins : a.p2_wins
    const bPlayerWins = bIsPlayer1 ? b.p1_wins : b.p2_wins
    const aOpponentWins = aIsPlayer1 ? a.p2_wins : a.p1_wins
    const bOpponentWins = bIsPlayer1 ? b.p2_wins : b.p1_wins

    // Try to find opponent archetypes
    const aOpponentNormalized = normalizePlayerName(aOpponent)
    const bOpponentNormalized = normalizePlayerName(bOpponent)
    let aOpponentArchetype = 'Unknown'
    let bOpponentArchetype = 'Unknown'
    for (const dl of Object.values(decklists)) {
      if (normalizePlayerName(dl.player) === aOpponentNormalized) {
        aOpponentArchetype = dl.archetype
      }
      if (normalizePlayerName(dl.player) === bOpponentNormalized) {
        bOpponentArchetype = dl.archetype
      }
    }

    let comparison = 0
    switch (sortColumn) {
      case 'round':
        comparison = a.round - b.round
        break
      case 'opponent':
        comparison = aOpponent.localeCompare(bOpponent)
        break
      case 'result':
        comparison = aPlayerWins - aOpponentWins - (bPlayerWins - bOpponentWins)
        break
      case 'archetype':
        comparison = aOpponentArchetype.localeCompare(bOpponentArchetype)
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const formatDecklistForArena = (decklist: DecklistData): string => {
    const lines: string[] = []
    
    // Main deck
    if (decklist.main_deck && decklist.main_deck.length > 0) {
      decklist.main_deck.forEach(card => {
        lines.push(`${card.count} ${card.name}`)
      })
    }
    
    // Sideboard
    if (decklist.sideboard && decklist.sideboard.length > 0) {
      lines.push('') // Blank line separator
      decklist.sideboard.forEach(card => {
        lines.push(`${card.count} ${card.name}`)
      })
    }
    
    return lines.join('\n')
  }

  const handleExportToArena = async () => {
    if (!decklist) return
    
    const arenaFormat = formatDecklistForArena(decklist)
    
    try {
      await navigator.clipboard.writeText(arenaFormat)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Fallback: select text in a textarea
      const textarea = document.createElement('textarea')
      textarea.value = arenaFormat
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textarea)
    }
  }

  return (
    <Container variant="page" padding="md">
      <Card variant="page">
        <Box padding="lg" background="gradient-slate-blue" className="rounded-none" style={{ marginTop: '-4px', marginLeft: '-4px', marginRight: '-4px', marginBottom: '0' }}>
          <VStack spacing="sm" align="start">
            <Link to="/" variant="nav">
              ← Back to Dashboard
            </Link>
            <Text variant="h1" color="inverse">{decodedName}</Text>
            {decklist && (
              <Link
                to={`/archetype/${encodeURIComponent(decklist.archetype)}`}
                variant="badge"
              >
                {decklist.archetype}
              </Link>
            )}
          </VStack>
        </Box>

        <Box padding="lg">
          <VStack spacing="md">
            <Box padding="none" margin="none">
              <Text variant="h2" borderBottom borderBottomColor="primary" paddingBottom="sm">
                Match Statistics
              </Text>
            </Box>
            
            {/* Condensed Stats - All in one row */}
            <Grid columns={{ sm: 1, md: 3 }} spacing="md">
              {/* Overall Stats */}
              <Card background="neutral" padding="md">
                <VStack spacing="sm">
                  <Text variant="label">Overall</Text>
                  <Text variant="h2" color="primary">
                    {totalStats.draws > 0
                      ? `${totalStats.wins}-${totalStats.losses}-${totalStats.draws}`
                      : `${totalStats.wins}-${totalStats.losses}`}
                  </Text>
                  <Text variant="small" color="secondary">
                    {(totalWinRate * 100).toFixed(1)}% WR • {totalStats.gamesWon}-{totalStats.gamesLost} Games • {playerMatches.length} Matches
                  </Text>
                </VStack>
              </Card>
              
              {/* Draft Stats */}
              <Card background="info" padding="md">
                <VStack spacing="sm">
                  <Text variant="label">Draft</Text>
                  <Text variant="h2" color="info">
                    {draftStats.draws > 0
                      ? `${draftStats.wins}-${draftStats.losses}-${draftStats.draws}`
                      : `${draftStats.wins}-${draftStats.losses}`}
                  </Text>
                  <Text variant="small" color="secondary">
                    {draftStats.wins + draftStats.losses > 0
                      ? (draftWinRate * 100).toFixed(1) + '% WR'
                      : 'N/A'} • {draftStats.gamesWon}-{draftStats.gamesLost} Games • {playerMatches.filter(m => DRAFT_ROUNDS.has(m.round)).length} Matches
                  </Text>
                </VStack>
              </Card>
              
              {/* Constructed Stats */}
              <Card background="accent" padding="md">
                <VStack spacing="sm">
                  <Text variant="label">Constructed</Text>
                  <Text variant="h2" color="accent">
                    {constructedStats.draws > 0
                      ? `${constructedStats.wins}-${constructedStats.losses}-${constructedStats.draws}`
                      : `${constructedStats.wins}-${constructedStats.losses}`}
                  </Text>
                  <Text variant="small" color="secondary">
                    {constructedStats.wins + constructedStats.losses > 0
                      ? (constructedWinRate * 100).toFixed(1) + '% WR'
                      : 'N/A'} • {constructedStats.gamesWon}-{constructedStats.gamesLost} Games • {playerMatches.filter(m => !DRAFT_ROUNDS.has(m.round)).length} Matches
                  </Text>
                </VStack>
              </Card>
            </Grid>
          </VStack>
        </Box>
        
        <Divider />

        <Box padding="lg">
          <VStack spacing="md">
            <Box padding="none" margin="none">
              <Text variant="h2" borderBottom borderBottomColor="primary" paddingBottom="sm">
                Matches
              </Text>
            </Box>
            <Card overflow shadow="lg" rounded="xl">
              <Table>
                <TableHead>
                  <TableRow variant="header">
                    <TableHeader
                      onClick={() => handleSort('round')}
                      active={sortColumn === 'round'}
                      textColor="inverse"
                    >
                      Round{' '}
                      <SortIcon
                        column="round"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('opponent')}
                      active={sortColumn === 'opponent'}
                      textColor="inverse"
                    >
                      Opponent{' '}
                      <SortIcon
                        column="opponent"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('result')}
                      active={sortColumn === 'result'}
                      textColor="inverse"
                    >
                      Result{' '}
                      <SortIcon
                        column="result"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                    <TableHeader
                      onClick={() => handleSort('archetype')}
                      active={sortColumn === 'archetype'}
                      textColor="inverse"
                    >
                      Opponent Archetype{' '}
                      <SortIcon
                        column="archetype"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                      />
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedMatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} textAlign="center" padding="lg" textColor="muted">
                        No matches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedMatches.map((match: MatchResult, idx: number) => {
                      const p1Normalized = normalizePlayerName(match.player1)
                      const isPlayer1 = p1Normalized === normalizedPlayerName
                      const opponent = isPlayer1 ? match.player2 : match.player1
                      const playerWins = isPlayer1 ? match.p1_wins : match.p2_wins
                      const opponentWins = isPlayer1 ? match.p2_wins : match.p1_wins
                      const won = playerWins > opponentWins
                      const draw = playerWins === opponentWins
                      const isDraft = DRAFT_ROUNDS.has(match.round)

                      // Try to find opponent's decklist using normalized matching
                      let opponentDecklist: DecklistData | undefined
                      const opponentNormalized = normalizePlayerName(opponent)
                      for (const dl of Object.values(decklists)) {
                        if (normalizePlayerName(dl.player) === opponentNormalized) {
                          opponentDecklist = dl
                          break
                        }
                      }
                      const opponentArchetype = opponentDecklist?.archetype || 'Unknown'

                      // Determine result badge variant
                      let resultVariant: 'success' | 'warning' | 'danger' = 'danger'
                      if (won) {
                        resultVariant = 'success'
                      } else if (draw) {
                        resultVariant = 'warning'
                      }

                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Text>{match.round}</Text>
                          </TableCell>
                          <TableCell>
                            <Link to={`/player/${encodeURIComponent(opponent)}`}>
                              {opponent}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={resultVariant}>
                              {playerWins}-{opponentWins}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isDraft ? (
                              <Text color="info">Draft</Text>
                            ) : (
                              <Link to={`/archetype/${encodeURIComponent(opponentArchetype)}`}>
                                {opponentArchetype}
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </VStack>
        </Box>
        
        <Divider />

        {decklist && (
          <Box padding="lg">
            <VStack spacing="md">
              <HStack spacing="md" align="center" justify="between">
                <Box padding="none" margin="none">
                  <Text variant="h2" borderBottom borderBottomColor="primary" paddingBottom="sm">
                    Decklist
                  </Text>
                </Box>
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
                    <VStack spacing="xs">
                      {decklist.main_deck && decklist.main_deck.length > 0 ? (
                        decklist.main_deck.map((card, idx) => (
                          <Box key={idx} whitespace="nowrap">
                            <HStack spacing="xs" align="center">
                              <Text>{card.count}</Text>
                              <CardTooltip cardName={card.name}>
                                <Link to={`/card/${encodeURIComponent(card.name)}`}>
                                  {card.name}
                                </Link>
                              </CardTooltip>
                            </HStack>
                          </Box>
                        ))
                      ) : (
                        <Text variant="small" color="secondary">No main deck data available</Text>
                      )}
                    </VStack>
                  </VStack>
                </Box>
                {decklist.sideboard && decklist.sideboard.length > 0 && (
                  <Box grow>
                    <VStack spacing="sm">
                      <Text variant="h3">
                        Sideboard ({decklist.sideboard.reduce((sum, c) => sum + c.count, 0)} cards)
                      </Text>
                      <VStack spacing="xs">
                        {decklist.sideboard.map((card, idx) => (
                          <Box key={idx} whitespace="nowrap">
                            <HStack spacing="xs" align="center">
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
        )}
      </Card>
    </Container>
  )
}

export default PlayerDetail
