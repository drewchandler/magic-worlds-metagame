import { useMemo } from 'react'

import { Box } from '@atoms/Box'
import { Card } from '@atoms/Card'
import { Link } from '@atoms/Link'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@atoms/Table'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import { SectionHeader } from '@molecules/SectionHeader'
import type { AnalysisData, MatchupStats } from '@/types'

interface MatchupGridProps {
  data: AnalysisData | null
}

function MatchupGrid({ data }: MatchupGridProps) {
  const matchupStats = useMemo(() => data?.matchup_stats || {}, [data?.matchup_stats])
  const archetypeCounts = useMemo(() => data?.archetype_counts || {}, [data?.archetype_counts])

  // Get all unique archetypes, sorted
  const archetypes = useMemo(() => {
    const archSet = new Set<string>()
    Object.keys(archetypeCounts).forEach(arch => archSet.add(arch))
    Object.values(matchupStats).forEach((matchup: MatchupStats) => {
      archSet.add(matchup.archetype1)
      archSet.add(matchup.archetype2)
    })
    return Array.from(archSet).sort()
  }, [archetypeCounts, matchupStats])

  // Create a lookup map for matchups
  const matchupMap = useMemo(() => {
    const map = new Map<string, MatchupStats>()
    Object.values(matchupStats).forEach((matchup: MatchupStats) => {
      const key = `${matchup.archetype1} vs ${matchup.archetype2}`
      map.set(key, matchup)
    })
    return map
  }, [matchupStats])

  const getMatchup = (arch1: string, arch2: string): MatchupStats | null => {
    if (arch1 === arch2) return null // Mirror match
    const key1 = `${arch1} vs ${arch2}`
    const key2 = `${arch2} vs ${arch1}`
    return matchupMap.get(key1) || matchupMap.get(key2) || null
  }

  const getWinRateColor = (rate: number): 'success' | 'warning' | 'danger' => {
    if (rate >= 0.6) return 'success'
    if (rate >= 0.4) return 'warning'
    return 'danger'
  }

  const getWinRateBackground = (rate: number): 'success-light' | 'warning-light' | 'danger-light' => {
    if (rate >= 0.6) return 'success-light'
    if (rate >= 0.4) return 'warning-light'
    return 'danger-light'
  }

  if (!data || archetypes.length === 0) return null

  return (
    <Box padding="lg">
      <VStack spacing="md">
        <SectionHeader>Matchup Grid</SectionHeader>
        <Text variant="small" italic color="secondary">
          Win rates shown from the row archetype&apos;s perspective. Mirror matches are excluded.
        </Text>
        <Card overflow shadow="lg" rounded="xl">
          <Box overflow="auto" maxHeight="600px">
            <Table minWidth="800px">
              <TableHead sticky>
                <TableRow variant="header">
                  <TableHeader
                    textColor="inverse"
                    background="gradient-dark"
                    sticky
                    left="0"
                    zIndex={60}
                    minWidth="150px"
                  >
                    <Text variant="label" color="inverse">
                      Archetype
                    </Text>
                  </TableHeader>
                  {archetypes.map(arch => (
                    <TableHeader key={arch} textColor="inverse" textAlign="center">
                      <Link to={`/archetype/${encodeURIComponent(arch)}`} variant="nav">
                        <Box
                          maxHeight="30px"
                          overflow="hidden"
                          whitespace="nowrap"
                          marginX="auto"
                          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                        >
                          <Text variant="label" color="inverse">
                            {arch}
                          </Text>
                        </Box>
                      </Link>
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {archetypes.map(rowArch => (
                  <TableRow key={rowArch}>
                    <TableCell
                      background="gradient-dark"
                      textColor="inverse"
                      sticky
                      left="0"
                      zIndex={40}
                      minWidth="150px"
                    >
                      <Link to={`/archetype/${encodeURIComponent(rowArch)}`} variant="nav">
                        <Text variant="body" color="inverse" className="font-semibold">
                          {rowArch}
                        </Text>
                      </Link>
                    </TableCell>
                    {archetypes.map(colArch => {
                      if (rowArch === colArch) {
                        return (
                          <TableCell
                            key={colArch}
                            background="neutral-100"
                            textColor="muted"
                            textAlign="center"
                            border
                            italic
                          >
                            <Text>—</Text>
                          </TableCell>
                        )
                      }

                      const matchup = getMatchup(rowArch, colArch)
                      if (!matchup) {
                        return (
                          <TableCell
                            key={colArch}
                            background="neutral-50"
                            textColor="muted"
                            textAlign="center"
                            border
                          >
                            <Text>—</Text>
                          </TableCell>
                        )
                      }

                      // Determine which archetype is which
                      const isRowFirst = matchup.archetype1 === rowArch
                      const wins = isRowFirst ? matchup.arch1_wins : matchup.arch2_wins
                      const losses = isRowFirst ? matchup.arch2_wins : matchup.arch1_wins
                      const winRate = isRowFirst ? matchup.arch1_win_rate : matchup.arch2_win_rate
                      const totalMatches = matchup.total_matches
                      const winRateColor = getWinRateColor(winRate)
                      const winRateBg = getWinRateBackground(winRate)

                      return (
                        <TableCell
                          key={colArch}
                          background={winRateBg}
                          textAlign="center"
                          border
                          cursor="pointer"
                          hover
                          title={`${rowArch} vs ${colArch}: ${wins}-${losses} (${(winRate * 100).toFixed(1)}%)`}
                        >
                          <VStack spacing="xs" align="center">
                            <Text variant="small" className="font-bold">
                              {wins}-{losses}
                            </Text>
                            <Text variant="body" color={winRateColor} className="font-bold">
                              {(winRate * 100).toFixed(0)}%
                            </Text>
                            <Text variant="small" color="secondary">
                              ({totalMatches})
                            </Text>
                          </VStack>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </VStack>
    </Box>
  )
}

export default MatchupGrid
