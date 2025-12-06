#!/usr/bin/env python3
"""
Analyze Magic World Championship 31 data and generate statistics
"""

import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

# Data directory relative to project root
DATA_DIR = Path(__file__).parent.parent / "data"
DECKLISTS_FILE = DATA_DIR / "decklists.json"
RESULTS_FILE = DATA_DIR / "results.json"
OUTPUT_FILE = DATA_DIR / "analysis.json"

# Draft rounds to exclude from archetype statistics
DRAFT_ROUNDS = {1, 2, 3, 8, 9, 10}


def load_data() -> Tuple[Dict, List]:
    """Load decklists and results from cache"""
    decklists = {}
    if DECKLISTS_FILE.exists():
        decklists = json.load(open(DECKLISTS_FILE))
    
    results = []
    if RESULTS_FILE.exists():
        results = json.load(open(RESULTS_FILE))
    
    return decklists, results


def normalize_player_name(name: str) -> str:
    """Normalize player name for matching - handles both 'First Last' and 'Last, First' formats"""
    import unicodedata
    
    name = name.strip()
    if not name:
        return ''
    
    # Remove accents/diacritics for better matching
    nfd = unicodedata.normalize('NFD', name)
    name = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    
    # If it's in "Last, First" format, convert to "First Last"
    if ',' in name:
        parts = [p.strip() for p in name.split(',')]
        if len(parts) == 2:
            # Convert "Last, First" to "First Last"
            name = f"{parts[1]} {parts[0]}"
        elif len(parts) > 2:
            # Handle "Last, First Middle" format
            name = f"{' '.join(parts[1:])} {parts[0]}"
    
    # Normalize to lowercase and remove extra spaces
    return ' '.join(name.lower().split())


def get_player_archetype(player_name: str, decklists: Dict) -> str:
    """Get archetype for a player"""
    normalized = normalize_player_name(player_name)
    if not normalized:
        return 'Unknown'
    
    # Try exact match first
    for decklist in decklists.values():
        decklist_player = normalize_player_name(decklist.get('player', ''))
        if decklist_player == normalized:
            return decklist.get('archetype', 'Unknown')
    
    # Try matching by last name (for cases with middle names, etc.)
    # Extract last name from normalized name
    name_parts = normalized.split()
    if len(name_parts) >= 2:
        last_name = name_parts[-1]
        for decklist in decklists.values():
            decklist_player = normalize_player_name(decklist.get('player', ''))
            decklist_parts = decklist_player.split()
            if len(decklist_parts) >= 2 and decklist_parts[-1] == last_name:
                # Also check first name matches
                if name_parts[0] == decklist_parts[0]:
                    return decklist.get('archetype', 'Unknown')
    
    # Try partial match as fallback
    for decklist in decklists.values():
        decklist_player = normalize_player_name(decklist.get('player', ''))
        if normalized in decklist_player or decklist_player in normalized:
            return decklist.get('archetype', 'Unknown')
    
    return 'Unknown'


def analyze_metagame(decklists: Dict, results: List) -> Dict:
    """Analyze the metagame and generate statistics"""
    
    # Build player -> archetype mapping
    player_archetypes = {}
    for decklist in decklists.values():
        player = decklist.get('player', '')
        if player:
            player_archetypes[normalize_player_name(player)] = decklist.get('archetype', 'Unknown')
    
    # Archetype statistics
    archetype_counts = defaultdict(int)
    for archetype in player_archetypes.values():
        archetype_counts[archetype] += 1
    
    # Match statistics
    match_stats = defaultdict(lambda: {
        'wins': 0,
        'losses': 0,
        'draws': 0,
        'games_won': 0,
        'games_lost': 0,
        'matches': []
    })
    
    # Matchup statistics: archetype1 vs archetype2
    matchup_stats = defaultdict(lambda: {
        'wins': 0,
        'losses': 0,
        'draws': 0,
        'games_won': 0,
        'games_lost': 0,
        'matches': []
    })
    
    # Process each match result
    for result in results:
        round_num = result.get('round', 0)
        p1_name = result.get('player1', '').strip()
        p2_name = result.get('player2', '').strip()
        p1_wins = result.get('p1_wins', 0)
        p2_wins = result.get('p2_wins', 0)
        
        if not p1_name or not p2_name:
            continue
        
        # Skip draft rounds for archetype statistics
        if round_num in DRAFT_ROUNDS:
            continue
        
        # Get archetypes
        p1_arch = get_player_archetype(p1_name, decklists)
        p2_arch = get_player_archetype(p2_name, decklists)
        
        # Update archetype match stats
        arch1_key = f"{p1_arch} vs {p2_arch}"
        arch2_key = f"{p2_arch} vs {p1_arch}"
        
        # Skip mirror matches for win rate calculations
        is_mirror = p1_arch == p2_arch
        
        # Determine winner
        if p1_wins > p2_wins:
            # Player 1 won
            if not is_mirror:
                match_stats[p1_arch]['wins'] += 1
                match_stats[p2_arch]['losses'] += 1
            matchup_stats[arch1_key]['wins'] += 1
            matchup_stats[arch2_key]['losses'] += 1
        elif p2_wins > p1_wins:
            # Player 2 won
            if not is_mirror:
                match_stats[p2_arch]['wins'] += 1
                match_stats[p1_arch]['losses'] += 1
            matchup_stats[arch2_key]['wins'] += 1
            matchup_stats[arch1_key]['losses'] += 1
        else:
            # Draw - count draws even for mirror matches
            match_stats[p1_arch]['draws'] += 1
            match_stats[p2_arch]['draws'] += 1
            matchup_stats[arch1_key]['draws'] = matchup_stats[arch1_key].get('draws', 0) + 1
            matchup_stats[arch2_key]['draws'] = matchup_stats[arch2_key].get('draws', 0) + 1
        
        # Update game stats (mirrors still count for game stats)
        match_stats[p1_arch]['games_won'] += p1_wins
        match_stats[p1_arch]['games_lost'] += p2_wins
        match_stats[p2_arch]['games_won'] += p2_wins
        match_stats[p2_arch]['games_lost'] += p1_wins
        
        matchup_stats[arch1_key]['games_won'] += p1_wins
        matchup_stats[arch1_key]['games_lost'] += p2_wins
        matchup_stats[arch2_key]['games_won'] += p2_wins
        matchup_stats[arch2_key]['games_lost'] += p1_wins
        
        # Store match details
        match_info = {
            'round': round_num,
            'player1': p1_name,
            'player2': p2_name,
            'archetype1': p1_arch,
            'archetype2': p2_arch,
            'p1_wins': p1_wins,
            'p2_wins': p2_wins
        }
        
        match_stats[p1_arch]['matches'].append(match_info)
        match_stats[p2_arch]['matches'].append(match_info)
        matchup_stats[arch1_key]['matches'].append(match_info)
        matchup_stats[arch2_key]['matches'].append(match_info)
    
    # Calculate win rates
    for arch, stats in match_stats.items():
        total = stats['wins'] + stats['losses']
        if total > 0:
            stats['win_rate'] = stats['wins'] / total
            stats['game_win_rate'] = stats['games_won'] / (stats['games_won'] + stats['games_lost']) if (stats['games_won'] + stats['games_lost']) > 0 else 0
        else:
            stats['win_rate'] = 0
            stats['game_win_rate'] = 0
        stats['total_matches'] = total
    
    # Calculate matchup win rates
    matchup_summary = {}
    for matchup_key, stats in matchup_stats.items():
        total = stats['wins'] + stats['losses']
        if total > 0:
            arch1, arch2 = matchup_key.split(' vs ', 1)
            # Use canonical form (alphabetically sorted)
            canonical = ' vs '.join(sorted([arch1, arch2]))
            
            if canonical not in matchup_summary:
                matchup_summary[canonical] = {
                    'archetype1': arch1,
                    'archetype2': arch2,
                    'arch1_wins': 0,
                    'arch2_wins': 0,
                    'arch1_games': 0,
                    'arch2_games': 0,
                    'total_matches': 0
                }
            
            if arch1 == matchup_summary[canonical]['archetype1']:
                matchup_summary[canonical]['arch1_wins'] += stats['wins']
                matchup_summary[canonical]['arch1_games'] += stats['games_won']
                matchup_summary[canonical]['arch2_wins'] += stats['losses']
                matchup_summary[canonical]['arch2_games'] += stats['games_lost']
            else:
                matchup_summary[canonical]['arch2_wins'] += stats['wins']
                matchup_summary[canonical]['arch2_games'] += stats['games_won']
                matchup_summary[canonical]['arch1_wins'] += stats['losses']
                matchup_summary[canonical]['arch1_games'] += stats['games_lost']
            
            matchup_summary[canonical]['total_matches'] += total
    
    # Calculate matchup win rates
    for matchup_key, matchup in matchup_summary.items():
        total = matchup['total_matches']
        if total > 0:
            matchup['arch1_win_rate'] = matchup['arch1_wins'] / total
            matchup['arch2_win_rate'] = matchup['arch2_wins'] / total
            total_games = matchup['arch1_games'] + matchup['arch2_games']
            if total_games > 0:
                matchup['arch1_game_win_rate'] = matchup['arch1_games'] / total_games
                matchup['arch2_game_win_rate'] = matchup['arch2_games'] / total_games
            else:
                matchup['arch1_game_win_rate'] = 0
                matchup['arch2_game_win_rate'] = 0
    
    return {
        'archetype_counts': dict(archetype_counts),
        'archetype_stats': dict(match_stats),
        'matchup_stats': matchup_summary,
        'total_players': len(player_archetypes),
        'total_matches': len(results)
    }


def main():
    """Main analysis function"""
    print("Loading data...")
    decklists, results = load_data()
    
    print(f"Loaded {len(decklists)} decklists")
    print(f"Loaded {len(results)} match results")
    
    print("\nAnalyzing metagame...")
    analysis = analyze_metagame(decklists, results)
    
    print(f"\nFound {analysis['total_players']} players")
    print(f"Found {len(analysis['archetype_counts'])} archetypes")
    print(f"Processed {analysis['total_matches']} matches")
    
    print("\nArchetype Representation:")
    for arch, count in sorted(analysis['archetype_counts'].items(), key=lambda x: -x[1]):
        print(f"  {arch}: {count}")
    
    print("\nArchetype Win Rates:")
    for arch, stats in sorted(analysis['archetype_stats'].items(), key=lambda x: -x[1].get('win_rate', 0)):
        if stats['total_matches'] > 0:
            print(f"  {arch}: {stats['wins']}-{stats['losses']} ({stats['win_rate']:.1%})")
    
    # Save analysis
    json.dump(analysis, open(OUTPUT_FILE, 'w'), indent=2)
    print(f"\nAnalysis saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

