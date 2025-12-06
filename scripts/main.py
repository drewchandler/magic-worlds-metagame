#!/usr/bin/env python3
"""
Main script to run spider, analysis, and generate dashboard
"""

import sys
from pathlib import Path

# Add scripts directory to path so imports work
sys.path.insert(0, str(Path(__file__).parent))

from analyze import main as analyze_main
from spider import MagicSpider


def main():
    """Run the full pipeline"""
    print("=" * 60)
    print("Magic World Championship 31 Metagame Analyzer")
    print("=" * 60)
    print()
    
    # Step 1: Spider the site
    print("Step 1: Spidering magic.gg...")
    print("-" * 60)
    try:
        spider = MagicSpider()
        spider.run()
        print()
    except Exception as e:
        print(f"Error during spidering: {e}")
        print("Continuing with existing data...")
        print()
    
    # Step 2: Analyze data
    print("Step 2: Analyzing metagame...")
    print("-" * 60)
    try:
        analyze_main()
        print()
    except Exception as e:
        print(f"Error during analysis: {e}")
        sys.exit(1)
    
    print("=" * 60)
    print("Complete! Data has been collected and analyzed.")
    print("=" * 60)
    print()
    print("To view the dashboard:")
    print("  npm run dev")
    print()
    print("Then open http://localhost:5173 in your browser")


if __name__ == "__main__":
    main()

