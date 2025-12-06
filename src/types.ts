export interface ArchetypeStats {
  wins: number
  losses: number
  draws?: number
  games_won: number
  games_lost: number
  win_rate: number
  game_win_rate: number
  total_matches: number
  matches: MatchInfo[]
}

export interface MatchInfo {
  round: number
  player1: string
  player2: string
  archetype1: string
  archetype2: string
  p1_wins: number
  p2_wins: number
}

export interface MatchupStats {
  archetype1: string
  archetype2: string
  arch1_wins: number
  arch2_wins: number
  arch1_games: number
  arch2_games: number
  arch1_win_rate: number
  arch2_win_rate: number
  arch1_game_win_rate: number
  arch2_game_win_rate: number
  total_matches: number
}

export interface AnalysisData {
  archetype_counts: Record<string, number>
  archetype_stats: Record<string, ArchetypeStats>
  matchup_stats: Record<string, MatchupStats>
  total_players: number
  total_matches: number
}
