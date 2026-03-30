#!/usr/bin/env python3
"""
Systematically reduce font-bold and font-semibold overuse across dashboard pages.

Rules:
- Skip 12 core pages (already hand-polished)
- For font-bold: if > 3 occurrences, keep first 2, convert rest to font-medium
  EXCEPT: skip lines containing text-2xl or text-3xl (hero text)
- For font-semibold: if > 5 occurrences, convert instances after 3rd to font-medium
"""

import os
import re
import glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASHBOARD = os.path.join(BASE, "src", "app", "(dashboard)")

CORE_PAGES = {
    "home", "trade", "learn", "portfolio", "predictions", "backtest",
    "options", "challenges", "arena", "quests", "earnings", "flashcards"
}

# Also skip learn subdirectories (lesson pages handled separately from learn core)
# Actually the task says skip core pages, learn sub-pages ARE topic/lesson pages and should be processed

def get_all_pages():
    """Find all page.tsx files under (dashboard)/*/"""
    pages = []
    for path in glob.glob(os.path.join(DASHBOARD, "**", "page.tsx"), recursive=True):
        # Get the first directory segment after (dashboard)/
        rel = os.path.relpath(path, DASHBOARD)
        parts = rel.split(os.sep)
        top_dir = parts[0]

        if top_dir in CORE_PAGES:
            # Skip the core page itself (page.tsx directly in the core dir)
            # But allow sub-pages like learn/*/page.tsx
            if len(parts) == 2:
                # This is e.g. learn/page.tsx — skip
                continue
            # Sub-pages of core dirs: process them (e.g., learn/budgeting101/page.tsx)

        pages.append(path)
    return sorted(pages)


def process_file(filepath):
    """Process a single file, reducing font-bold and font-semibold overuse."""
    with open(filepath, 'r') as f:
        content = f.read()

    lines = content.split('\n')

    # --- Pass 1: font-bold reduction ---
    # Find all lines with font-bold
    bold_indices = []
    for i, line in enumerate(lines):
        if 'font-bold' in line:
            bold_indices.append(i)

    bold_converted = 0
    if len(bold_indices) > 3:
        # Keep first 2, convert rest (unless hero text)
        for idx in bold_indices[2:]:
            line = lines[idx]
            # Skip if hero text (text-2xl or text-3xl)
            if 'text-2xl' in line or 'text-3xl' in line or 'text-4xl' in line:
                continue
            # Replace font-bold with font-medium on this line
            lines[idx] = line.replace('font-bold', 'font-medium')
            bold_converted += 1

    # --- Pass 2: font-semibold reduction ---
    semi_indices = []
    for i, line in enumerate(lines):
        if 'font-semibold' in line:
            semi_indices.append(i)

    semi_converted = 0
    if len(semi_indices) > 5:
        # Keep first 3, convert rest
        for idx in semi_indices[3:]:
            line = lines[idx]
            lines[idx] = line.replace('font-semibold', 'font-medium')
            semi_converted += 1

    if bold_converted > 0 or semi_converted > 0:
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))

    return bold_converted, semi_converted, len(bold_indices), len(semi_indices)


def main():
    pages = get_all_pages()
    print(f"Found {len(pages)} non-core pages to process\n")

    total_bold = 0
    total_semi = 0
    files_modified = 0
    skipped_low = 0

    details = []

    for path in pages:
        rel = os.path.relpath(path, BASE)
        bold_conv, semi_conv, bold_total, semi_total = process_file(path)

        if bold_conv > 0 or semi_conv > 0:
            files_modified += 1
            total_bold += bold_conv
            total_semi += semi_conv
            details.append((rel, bold_conv, semi_conv, bold_total, semi_total))
        elif bold_total <= 3 and semi_total <= 5:
            skipped_low += 1

    # Print summary
    print(f"{'='*70}")
    print(f"FONT WEIGHT REDUCTION SUMMARY")
    print(f"{'='*70}")
    print(f"Pages scanned:        {len(pages)}")
    print(f"Pages modified:       {files_modified}")
    print(f"Pages already light:  {skipped_low}")
    print(f"font-bold → medium:   {total_bold}")
    print(f"font-semi → medium:   {total_semi}")
    print(f"Total replacements:   {total_bold + total_semi}")
    print(f"{'='*70}\n")

    if details:
        print(f"{'File':<65} {'bold':>5} {'semi':>5}")
        print(f"{'-'*65} {'-'*5} {'-'*5}")
        for rel, bc, sc, bt, st in sorted(details, key=lambda x: -(x[1]+x[2])):
            print(f"{rel:<65} {bc:>5} {sc:>5}")


if __name__ == "__main__":
    main()
