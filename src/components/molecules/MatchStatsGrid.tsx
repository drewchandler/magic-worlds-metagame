import { Card } from '@atoms/Card'
import { Grid } from '@atoms/Grid'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'

interface MatchStats {
  wins: number
  losses: number
  draws: number
  gamesWon: number
  gamesLost: number
  matches: number
}

interface MatchStatsGridProps {
  overall: MatchStats
  draft: MatchStats
  constructed: MatchStats
  overallWinRate: number
  draftWinRate: number
  constructedWinRate: number
}

export function MatchStatsGrid({
  overall,
  draft,
  constructed,
  overallWinRate,
  draftWinRate,
  constructedWinRate,
}: MatchStatsGridProps) {
  return (
    <Grid columns={{ sm: 1, md: 3 }} spacing="md">
      {/* Overall Stats */}
      <Card background="neutral" padding="md">
        <VStack spacing="sm">
          <Text variant="label">Overall</Text>
          <Text variant="h2" color="primary">
            {overall.draws > 0
              ? `${overall.wins}-${overall.losses}-${overall.draws}`
              : `${overall.wins}-${overall.losses}`}
          </Text>
          <Text variant="small" color="secondary">
            {(overallWinRate * 100).toFixed(1)}% WR • {overall.gamesWon}-{overall.gamesLost} Games • {overall.matches} Matches
          </Text>
        </VStack>
      </Card>

      {/* Draft Stats */}
      <Card background="info" padding="md">
        <VStack spacing="sm">
          <Text variant="label">Draft</Text>
          <Text variant="h2" color="info">
            {draft.draws > 0
              ? `${draft.wins}-${draft.losses}-${draft.draws}`
              : `${draft.wins}-${draft.losses}`}
          </Text>
          <Text variant="small" color="secondary">
            {draft.wins + draft.losses > 0
              ? `${(draftWinRate * 100).toFixed(1)}% WR • ${draft.gamesWon}-${draft.gamesLost} Games • ${draft.matches} Matches`
              : '(N/A)'}
          </Text>
        </VStack>
      </Card>

      {/* Constructed Stats */}
      <Card background="accent" padding="md">
        <VStack spacing="sm">
          <Text variant="label">Constructed</Text>
          <Text variant="h2" color="accent">
            {constructed.draws > 0
              ? `${constructed.wins}-${constructed.losses}-${constructed.draws}`
              : `${constructed.wins}-${constructed.losses}`}
          </Text>
          <Text variant="small" color="secondary">
            {constructed.wins + constructed.losses > 0
              ? `${(constructedWinRate * 100).toFixed(1)}% WR • ${constructed.gamesWon}-${constructed.gamesLost} Games • ${constructed.matches} Matches`
              : '(N/A)'}
          </Text>
        </VStack>
      </Card>
    </Grid>
  )
}

