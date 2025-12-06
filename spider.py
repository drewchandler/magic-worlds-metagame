#!/usr/bin/env python3
"""
Spider script to collect Magic World Championship 31 data from magic.gg
"""

import json
import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://magic.gg"
EVENT_URL = f"{BASE_URL}/events/magic-world-championship-31"
DRAFT_ROUNDS = {1, 2, 3, 8, 9, 10}  # Rounds to ignore
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# Cache files
DECKLISTS_FILE = DATA_DIR / "decklists.json"
RESULTS_FILE = DATA_DIR / "results.json"
PAIRINGS_FILE = DATA_DIR / "pairings.json"


class MagicSpider:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    
    def fetch_page(self, url: str) -> BeautifulSoup:
        """Fetch and parse a page"""
        print(f"Fetching: {url}")
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    
    def fetch_json(self, url: str) -> Optional[Dict]:
        """Fetch JSON data from an API endpoint"""
        try:
            print(f"Fetching JSON: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching JSON from {url}: {e}")
            return None
    
    def find_api_endpoints(self) -> Dict[str, str]:
        """Try to find API endpoints from the main page"""
        soup = self.fetch_page(EVENT_URL)
        endpoints = {}
        
        # Look for script tags with API URLs
        for script in soup.find_all('script'):
            if script.string:
                # Look for API URLs in JavaScript
                api_match = re.search(r'["\']([^"\']*api[^"\']*decklist[^"\']*)["\']', script.string, re.I)
                if api_match:
                    endpoints['decklists'] = urljoin(BASE_URL, api_match.group(1))
                
                api_match = re.search(r'["\']([^"\']*api[^"\']*result[^"\']*)["\']', script.string, re.I)
                if api_match:
                    endpoints['results'] = urljoin(BASE_URL, api_match.group(1))
        
        return endpoints
    
    def get_decklist_links(self) -> List[str]:
        """Get all decklist page URLs"""
        soup = self.fetch_page(EVENT_URL)
        decklist_links = []
        
        # Look for decklist links in navigation and content
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True).lower()
            if 'decklist' in text or 'deck' in text or '/decklist' in href.lower():
                full_url = urljoin(BASE_URL, href)
                if full_url not in decklist_links and 'magic-world-championship-31' in full_url:
                    decklist_links.append(full_url)
        
        # Try to find the decklists article/page
        decklist_article = soup.find('a', href=re.compile('decklist', re.I))
        if decklist_article:
            decklist_url = urljoin(BASE_URL, decklist_article['href'])
            try:
                decklist_soup = self.fetch_page(decklist_url)
                # Find all links to individual decklists
                for link in decklist_soup.find_all('a', href=True):
                    href = link['href']
                    if '/decklist/' in href or '/deck/' in href or 'decklist' in href.lower():
                        full_url = urljoin(BASE_URL, href)
                        if full_url not in decklist_links:
                            decklist_links.append(full_url)
            except:
                pass
        
        return decklist_links
    
    def extract_decklist_info(self, url: str) -> Optional[Dict]:
        """Extract player name and archetype from a decklist page"""
        try:
            soup = self.fetch_page(url)
            
            player_name = None
            archetype = None
            
            # First, check for JSON data in script tags
            for script in soup.find_all('script'):
                if script.string:
                    # Look for JSON-LD or embedded JSON
                    script_type = script.get('type', '').lower()
                    if 'application/json' in script_type or 'application/ld+json' in script_type:
                        try:
                            data = json.loads(script.string)
                            if isinstance(data, dict):
                                player_name = data.get('player') or data.get('playerName') or data.get('name') or data.get('author')
                                archetype = data.get('archetype') or data.get('deckType') or data.get('deck') or data.get('deckName')
                        except:
                            pass
                    
                    # Look for JavaScript object with decklist data
                    # Pattern: {player: "...", archetype: "..."}
                    js_obj_match = re.search(r'\{\s*["\']?player["\']?\s*:\s*["\']([^"\']+)["\']', script.string, re.I | re.DOTALL)
                    if js_obj_match and not player_name:
                        player_name = js_obj_match.group(1)
                    
                    archetype_obj_match = re.search(r'\{\s*[^}]*["\']?archetype["\']?\s*:\s*["\']([^"\']+)["\']', script.string, re.I | re.DOTALL)
                    if archetype_obj_match and not archetype:
                        archetype = archetype_obj_match.group(1)
            
            # Look for structured data in HTML
            # Player name might be in a specific class or data attribute
            for tag in soup.find_all(['div', 'span', 'h1', 'h2', 'h3'], class_=re.compile('player|name|author', re.I)):
                text = tag.get_text(strip=True)
                if text and len(text) < 60 and not player_name:
                    # Check if it looks like a name (not a title)
                    if not any(word in text.lower() for word in ['decklist', 'deck', 'magic', 'championship', 'standard']):
                        player_name = text
                        break
            
            # Look in headings - but be more selective
            for heading in soup.find_all(['h1', 'h2', 'h3']):
                text = heading.get_text(strip=True)
                # Skip if it's clearly a page title
                if any(word in text.lower() for word in ['decklist', 'deck', 'magic world championship', 'standard']):
                    continue
                if not player_name and text and 5 < len(text) < 50:
                    player_name = text
                    break
            
            # Look for archetype - often labeled explicitly
            for tag in soup.find_all(['div', 'span', 'p', 'li', 'dt', 'dd']):
                text = tag.get_text(strip=True)
                class_attr = ' '.join(tag.get('class', []))
                
                # Look for "Archetype:" label
                if re.search(r'archetype\s*:?\s*', text, re.I):
                    # Extract value after colon or in next element
                    if ':' in text:
                        archetype = text.split(':')[-1].strip()
                    else:
                        next_elem = tag.find_next(['div', 'span', 'p', 'dd'])
                        if next_elem:
                            archetype = next_elem.get_text(strip=True)
                    if archetype:
                        break
                
                # Look for deck type in class names
                if 'archetype' in class_attr.lower() and not archetype:
                    archetype = text.strip() if text and len(text) < 50 else None
            
            # Also check for data attributes
            for tag in soup.find_all(attrs={'data-archetype': True}):
                if not archetype:
                    archetype = tag.get('data-archetype')
            
            for tag in soup.find_all(attrs={'data-player': True}):
                if not player_name:
                    player_name = tag.get('data-player')
            
            # Look for meta tags
            for meta in soup.find_all('meta'):
                prop = meta.get('property', '').lower()
                content = meta.get('content', '')
                if 'player' in prop or 'author' in prop:
                    if not player_name and content:
                        player_name = content
                if 'archetype' in prop or 'deck.type' in prop:
                    if not archetype and content:
                        archetype = content
            
            # Clean up extracted values
            if player_name:
                player_name = player_name.strip()
                # Remove common prefixes/suffixes
                player_name = re.sub(r'^.*decklist.*?:?\s*', '', player_name, flags=re.I)
                player_name = re.sub(r'\s*decklist.*$', '', player_name, flags=re.I)
            
            if archetype:
                archetype = archetype.strip()
                # Remove common prefixes
                archetype = re.sub(r'^.*archetype.*?:?\s*', '', archetype, flags=re.I)
            
            if player_name and len(player_name) > 2:
                return {
                    'player': player_name,
                    'archetype': archetype if archetype and len(archetype) < 100 else 'Unknown',
                    'url': url
                }
        except Exception as e:
            print(f"Error extracting decklist from {url}: {e}")
        
        return None
    
    def parse_decklist_index_page(self, url: str) -> List[Dict]:
        """Parse a decklist index page to extract player names, archetypes, and decklists"""
        soup = self.fetch_page(url)
        decklists = []
        
        # Parse the raw HTML for deck-list tags (BeautifulSoup might not parse custom tags)
        html_content = str(soup)
        
        # Find all deck-list elements with their content
        deck_list_pattern = r'<deck-list[^>]*deck-title=["\']([^"\']+)["\'][^>]*subtitle=["\']([^"\']+)["\']([^>]*)>([\s\S]*?)</deck-list>'
        matches = re.findall(deck_list_pattern, html_content, re.I)
        
        for player, archetype, attrs, content in matches:
            player = player.strip()
            archetype = archetype.strip()
            
            if not player or not archetype:
                continue
            
            # Parse the decklist content
            main_deck = []
            sideboard = []
            
            # Extract main deck
            main_match = re.search(r'<main-deck>([\s\S]*?)</main-deck>', content, re.I)
            if main_match:
                main_content = main_match.group(1)
                # Parse card lines (format: "4 Card Name" or "1 Card Name")
                for line in main_content.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('<'):
                        card_match = re.match(r'(\d+)\s+(.+)', line)
                        if card_match:
                            count = int(card_match.group(1))
                            card_name = card_match.group(2).strip()
                            main_deck.append({'count': count, 'name': card_name})
            
            # Extract sideboard
            side_match = re.search(r'<side-board>([\s\S]*?)</side-board>', content, re.I)
            if side_match:
                side_content = side_match.group(1)
                for line in side_content.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('<'):
                        card_match = re.match(r'(\d+)\s+(.+)', line)
                        if card_match:
                            count = int(card_match.group(1))
                            card_name = card_match.group(2).strip()
                            sideboard.append({'count': count, 'name': card_name})
            
            decklists.append({
                'player': player,
                'archetype': archetype,
                'url': url,
                'main_deck': main_deck,
                'sideboard': sideboard
            })
        
        return decklists
    
    def get_all_decklists(self) -> Dict[str, Dict]:
        """Get all decklists with player names and archetypes"""
        existing = {}
        if DECKLISTS_FILE.exists():
            existing = json.load(open(DECKLISTS_FILE))
        
        # Find the decklist index pages (A-L and M-Z)
        soup = self.fetch_page(EVENT_URL)
        index_pages = []
        
        # Look for links to decklist index pages
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True).lower()
            if 'decklist' in href and 'magic-world-championship-31' in href:
                full_url = urljoin(BASE_URL, href)
                if 'standard-decklists' in href and full_url not in index_pages:
                    index_pages.append(full_url)
        
        # Also try the known index pages
        known_indexes = [
            f"{BASE_URL}/decklists/magic-world-championship-31-standard-decklists-a-l",
            f"{BASE_URL}/decklists/magic-world-championship-31-standard-decklists-m-z",
        ]
        for idx_url in known_indexes:
            if idx_url not in index_pages:
                index_pages.append(idx_url)
        
        # Parse each index page to extract decklist info directly
        for index_url in index_pages:
            print(f"Parsing index page: {index_url}")
            decklists_from_page = self.parse_decklist_index_page(index_url)
            for decklist in decklists_from_page:
                player = decklist.get('player', '')
                # Use player name as key (normalized)
                key = f"{index_url}::{player}"
                if key not in existing:
                    existing[key] = decklist
                    print(f"  Found: {player} - {decklist.get('archetype', 'Unknown')}")
            time.sleep(0.5)
        
        json.dump(existing, open(DECKLISTS_FILE, 'w'), indent=2)
        return existing
    
    def get_round_results(self, round_num: int) -> List[Dict]:
        """Get results for a specific round"""
        if round_num in DRAFT_ROUNDS:
            return []
        
        # Try to find JSON API endpoint first
        api_urls = [
            f"{BASE_URL}/api/events/magic-world-championship-31/results?round={round_num}",
            f"{BASE_URL}/api/results?event=magic-world-championship-31&round={round_num}",
            f"{BASE_URL}/api/v1/events/magic-world-championship-31/results?round={round_num}",
        ]
        
        for api_url in api_urls:
            data = self.fetch_json(api_url)
            if data and isinstance(data, (list, dict)):
                results = []
                matches = data if isinstance(data, list) else data.get('matches', []) or data.get('data', [])
                for match in matches:
                    if isinstance(match, dict):
                        p1 = match.get('player1') or match.get('player_one') or match.get('player_1') or match.get('playerOne')
                        p2 = match.get('player2') or match.get('player_two') or match.get('player_2') or match.get('playerTwo')
                        p1_wins = match.get('p1_wins') or match.get('player1_wins') or match.get('wins1') or match.get('wins', {}).get('player1', 0)
                        p2_wins = match.get('p2_wins') or match.get('player2_wins') or match.get('wins2') or match.get('wins', {}).get('player2', 0)
                        
                        # Also try score format
                        if not p1_wins and 'score' in match:
                            score = match.get('score', '')
                            score_match = re.match(r'(\d+)-(\d+)', str(score))
                            if score_match:
                                p1_wins = int(score_match.group(1))
                                p2_wins = int(score_match.group(2))
                        
                        if p1 and p2:
                            results.append({
                                'round': round_num,
                                'player1': str(p1),
                                'player2': str(p2),
                                'p1_wins': int(p1_wins or 0),
                                'p2_wins': int(p2_wins or 0),
                                'p1_games': int(p1_wins or 0),
                                'p2_games': int(p2_wins or 0)
                            })
                if results:
                    return results
        
        # Try the main event page - results might be embedded there
        try:
            soup = self.fetch_page(EVENT_URL)
            # Look for results data in script tags
            for script in soup.find_all('script'):
                if script.string and f'round-{round_num}' in script.string.lower():
                    # Try to extract JSON data
                    json_match = re.search(r'(\{.*?"round".*?' + str(round_num) + r'.*?\})', script.string, re.DOTALL | re.I)
                    if json_match:
                        try:
                            data = json.loads(json_match.group(1))
                            # Process if it looks like match data
                            if 'player1' in str(data) or 'player' in str(data).lower():
                                # Similar processing as above
                                pass
                        except:
                            pass
        except:
            pass
        
        # Results are at /news/magic-world-championship-31-round-{N}-results
        results_url = f"{BASE_URL}/news/magic-world-championship-31-round-{round_num}-results"
        
        try:
            soup = self.fetch_page(results_url)
            results = []
            
            # Parse HTML tables - results are in tables
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 4:
                        # Format: Player1 | vs. | Player2 | Result
                        player1 = cells[0].get_text(strip=True)
                        vs_text = cells[1].get_text(strip=True)
                        player2 = cells[2].get_text(strip=True)
                        result_text = cells[3].get_text(strip=True)
                        
                        # Skip header rows
                        if player1.lower() in ['player', 'player 1', ''] or vs_text.lower() != 'vs.':
                            continue
                        
                        # Parse result text like "Dang, Nam won 2-0-0" or "Garcia-Romo, Andy won 2-1-0"
                        # Format: "{Winner} won {wins}-{losses}-{draws}"
                        result_match = re.search(r'(\w+(?:\s+\w+)*)\s+won\s+(\d+)-(\d+)-(\d+)', result_text)
                        if result_match:
                            winner = result_match.group(1)
                            winner_wins = int(result_match.group(2))
                            loser_wins = int(result_match.group(3))
                            draws = int(result_match.group(4))
                            
                            # Determine which player won
                            if winner in player1:
                                p1_wins = winner_wins
                                p2_wins = loser_wins
                            elif winner in player2:
                                p1_wins = loser_wins
                                p2_wins = winner_wins
                            else:
                                # Try fuzzy matching - check if winner's last name matches
                                winner_parts = winner.split()
                                player1_parts = player1.split(',')
                                player2_parts = player2.split(',')
                                
                                # Check if winner matches player1 (format is usually "Last, First")
                                if len(player1_parts) > 0 and winner_parts[-1] in player1_parts[0]:
                                    p1_wins = winner_wins
                                    p2_wins = loser_wins
                                elif len(player2_parts) > 0 and winner_parts[-1] in player2_parts[0]:
                                    p1_wins = loser_wins
                                    p2_wins = winner_wins
                                else:
                                    # Default: assume first player won (shouldn't happen often)
                                    p1_wins = winner_wins
                                    p2_wins = loser_wins
                            
                            results.append({
                                'round': round_num,
                                'player1': player1,
                                'player2': player2,
                                'p1_wins': p1_wins,
                                'p2_wins': p2_wins,
                                'p1_games': p1_wins,
                                'p2_games': p2_wins
                            })
            
            return results
        except Exception as e:
            print(f"Error fetching round {round_num} from {results_url}: {e}")
            return []
    
    def parse_results_from_event_page(self) -> List[Dict]:
        """Try to parse results from the main event page"""
        soup = self.fetch_page(EVENT_URL)
        results = []
        
        # Look for results tables or data
        # Results might be in tabs or sections
        for section in soup.find_all(['div', 'section'], class_=re.compile('result|match|pairing', re.I)):
            # Look for tables with match results
            tables = section.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows[1:]:  # Skip header
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 3:
                        # Try to extract round number, players, and score
                        row_text = ' '.join([c.get_text(strip=True) for c in cells])
                        # Look for round indicator
                        round_match = re.search(r'round\s*(\d+)', row_text, re.I)
                        round_num = int(round_match.group(1)) if round_match else None
                        
                        if round_num and round_num not in DRAFT_ROUNDS:
                            player1 = cells[0].get_text(strip=True) if len(cells) > 0 else None
                            player2 = cells[1].get_text(strip=True) if len(cells) > 1 else None
                            result_text = cells[2].get_text(strip=True) if len(cells) > 2 else ''
                            
                            score_match = re.match(r'(\d+)-(\d+)', result_text)
                            if player1 and player2 and score_match:
                                results.append({
                                    'round': round_num,
                                    'player1': player1,
                                    'player2': player2,
                                    'p1_wins': int(score_match.group(1)),
                                    'p2_wins': int(score_match.group(2)),
                                    'p1_games': int(score_match.group(1)),
                                    'p2_games': int(score_match.group(2))
                                })
        
        # Also check script tags for embedded results data
        for script in soup.find_all('script'):
            if script.string and ('result' in script.string.lower() or 'match' in script.string.lower()):
                # Look for JSON arrays or objects with match data
                json_matches = re.findall(r'\[.*?"round".*?\]', script.string, re.DOTALL | re.I)
                for json_str in json_matches:
                    try:
                        data = json.loads(json_str)
                        if isinstance(data, list):
                            for match in data:
                                if isinstance(match, dict) and match.get('round') not in DRAFT_ROUNDS:
                                    p1 = match.get('player1') or match.get('player_one')
                                    p2 = match.get('player2') or match.get('player_two')
                                    p1_wins = match.get('p1_wins') or match.get('wins1', 0)
                                    p2_wins = match.get('p2_wins') or match.get('wins2', 0)
                                    if p1 and p2:
                                        results.append({
                                            'round': match.get('round'),
                                            'player1': str(p1),
                                            'player2': str(p2),
                                            'p1_wins': int(p1_wins),
                                            'p2_wins': int(p2_wins),
                                            'p1_games': int(p1_wins),
                                            'p2_games': int(p2_wins)
                                        })
                    except:
                        pass
        
        return results
    
    def get_all_results(self) -> List[Dict]:
        """Get all results for all rounds"""
        existing = []
        if RESULTS_FILE.exists():
            existing = json.load(open(RESULTS_FILE))
        
        # Get existing rounds
        existing_rounds = {r['round'] for r in existing}
        
        # First, try to get results from the main event page
        print("Checking main event page for results...")
        page_results = self.parse_results_from_event_page()
        if page_results:
            print(f"Found {len(page_results)} results on main page")
            for result in page_results:
                if result['round'] not in existing_rounds:
                    existing.append(result)
            existing_rounds.update({r['round'] for r in page_results})
        
        # Try rounds 1-15 (covering all possible rounds)
        all_results = existing.copy()
        for round_num in range(1, 16):
            if round_num in existing_rounds:
                print(f"Skipping round {round_num} (already cached)")
                continue
            
            if round_num in DRAFT_ROUNDS:
                continue
            
            results = self.get_round_results(round_num)
            all_results.extend(results)
            time.sleep(1)  # Be polite
        
        json.dump(all_results, open(RESULTS_FILE, 'w'), indent=2)
        return all_results
    
    def run(self):
        """Run the full spider"""
        print("Starting spider...")
        print("Fetching decklists...")
        decklists = self.get_all_decklists()
        print(f"Found {len(decklists)} decklists")
        
        print("\nFetching results...")
        results = self.get_all_results()
        print(f"Found {len(results)} match results")
        
        print("\nSpider complete!")


if __name__ == "__main__":
    spider = MagicSpider()
    spider.run()

