# Magic World Championship 31 Metagame Analyzer

A web scraper and interactive dashboard for analyzing the Magic: The Gathering World Championship 31 metagame.

## Features

- **Web Scraping**: Automatically fetches decklists and match results from magic.gg
- **Metagame Analysis**: Calculates archetype win rates, matchup statistics, and card usage
- **Interactive Dashboard**: React/TypeScript dashboard with:
  - Archetype performance tables
  - Matchup grid
  - Card statistics
  - Player and archetype detail pages
  - Card image tooltips from Scryfall

## Setup

### Prerequisites

- Python 3.8+ (managed via `mise`)
- Node.js 20+ (managed via `mise`)
- Homebrew (for installing `mise`)

### Installation

1. Install `mise` (if not already installed):
   ```bash
   brew install mise
   ```

2. Trust the mise configuration:
   ```bash
   mise trust
   ```

3. Install Python and Node.js:
   ```bash
   mise install
   ```

4. Install Python dependencies:
   ```bash
   pip install requests beautifulsoup4
   ```

5. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Usage

### Collecting Data

Run the spider to collect decklists and match results:

```bash
python main.py
```

This will:
1. Scrape decklists from magic.gg
2. Scrape match results for all rounds (excluding draft rounds 1-3 and 8-10)
3. Analyze the metagame and generate statistics
4. Save data to `data/` directory as JSON files

### Running the Dashboard

Start the development server:

```bash
npm run dev
```

The dashboard will automatically open in your browser at http://localhost:3000. The dashboard loads data dynamically from the JSON files and auto-refreshes every 30 seconds, so you can see updated data without manually refreshing.

To build for production:

```bash
npm run build
npm run preview
```

## Deployment to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Add New Project"

4. Import your GitHub repository

5. Vercel will auto-detect the Vite configuration. The settings should be:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. Add environment variables if needed (none required for this project)

7. Click "Deploy"

The `vercel.json` file is already configured for proper routing. Make sure to commit the `data/` directory with your JSON files, or set up a build process that generates them.

### Important Notes for Vercel

- The `data/` directory with JSON files needs to be included in your repository
- Vercel will serve files from the `public` directory (which we've configured as `data`)
- The app uses client-side routing, so all routes are rewritten to `index.html` (configured in `vercel.json`)

## Output

- **Data files** (in `data/` directory):
  - `decklists.json`: Player names, archetypes, and decklists
  - `results.json`: Match results with game scores
  - `analysis.json`: Processed statistics

- **Dashboard**: Interactive React application with:
  - Archetype representation and performance
  - Matchup win rates
  - Card statistics
  - Searchable tables
  - Color-coded win rates
  - Auto-refreshes every 30 seconds

## Notes

- Draft rounds (1-3 and 8-10) are automatically ignored
- The script is designed to be run incrementally - it won't re-fetch data that's already cached
- Some players may be eliminated after each day, so not all players will have results for all rounds
- The script respects rate limits with delays between requests

## Troubleshooting

If the spider can't find data:
1. Check that the event URL is correct
2. The site structure may have changed - you may need to update the parsing logic
3. Some data may be loaded via JavaScript - you might need to use Selenium for dynamic content
