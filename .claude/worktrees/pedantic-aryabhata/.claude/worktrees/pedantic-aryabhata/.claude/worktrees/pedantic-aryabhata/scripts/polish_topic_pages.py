#!/usr/bin/env python3
"""
Systematically polish all ~272 non-core topic pages.

These pages were generated from templates and share common AI-looking patterns:
1. space-y-6 → space-y-4 (too much uniform spacing)
2. gap-6 → gap-3 in grid layouts (too puffy)
3. p-6 → p-4 on generic cards (skip lines with border-l-4)
4. text-2xl font-bold → text-lg font-medium for non-hero headers (skip first instance per file)
5. shadow-sm → removed (cards shouldn't have shadow)
6. text-xs without a color class → add text-muted-foreground
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

# Color classes that indicate text-xs already has a color applied
COLOR_PATTERNS = re.compile(
    r'text-(?:muted-foreground|foreground|'
    r'red|green|blue|yellow|amber|emerald|sky|indigo|violet|purple|pink|'
    r'orange|teal|cyan|lime|rose|fuchsia|slate|gray|zinc|neutral|stone|'
    r'white|black|primary|secondary|destructive|accent|'
    r'\[#[0-9a-fA-F]+\])'
)


def get_all_pages():
    """Find all page.tsx files under (dashboard)/*/ excluding core pages."""
    pages = []
    for path in glob.glob(os.path.join(DASHBOARD, "**", "page.tsx"), recursive=True):
        rel = os.path.relpath(path, DASHBOARD)
        parts = rel.split(os.sep)
        top_dir = parts[0]

        if top_dir in CORE_PAGES:
            # Skip the core page itself but allow sub-pages
            if len(parts) == 2:
                continue

        pages.append(path)
    return sorted(pages)


def has_color_class(class_string):
    """Check if a className string already has a text color class."""
    return bool(COLOR_PATTERNS.search(class_string))


def process_file(filepath):
    """Process a single file with all 6 polish rules."""
    with open(filepath, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    stats = {
        'space_y': 0,
        'gap': 0,
        'padding': 0,
        'headers': 0,
        'shadow': 0,
        'text_xs': 0,
    }

    # --- Rule 1: space-y-6 → space-y-4 ---
    for i, line in enumerate(lines):
        if 'space-y-6' in line:
            lines[i] = line.replace('space-y-6', 'space-y-4')
            stats['space_y'] += 1

    # --- Rule 2: gap-6 → gap-3 in grid layouts ---
    for i, line in enumerate(lines):
        if 'gap-6' in line:
            lines[i] = line.replace('gap-6', 'gap-3')
            stats['gap'] += 1

    # --- Rule 3: p-6 → p-4 (skip lines with border-l-4) ---
    for i, line in enumerate(lines):
        if 'p-6' in line and 'border-l-4' not in line:
            lines[i] = line.replace('p-6', 'p-4')
            stats['padding'] += 1

    # --- Rule 4: text-2xl font-bold → text-lg font-medium (skip first instance) ---
    first_found = False
    for i, line in enumerate(lines):
        if 'text-2xl font-bold' in line:
            if not first_found:
                first_found = True
                continue  # Keep the first (hero) instance
            lines[i] = line.replace('text-2xl font-bold', 'text-lg font-medium')
            stats['headers'] += 1

    # --- Rule 5: Remove shadow-sm ---
    for i, line in enumerate(lines):
        if 'shadow-sm' in line:
            # Remove " shadow-sm" or "shadow-sm " to avoid double spaces
            new_line = line.replace(' shadow-sm', '')
            if new_line == line:
                new_line = line.replace('shadow-sm ', '')
            if new_line == line:
                new_line = line.replace('shadow-sm', '')
            if new_line != line:
                lines[i] = new_line
                stats['shadow'] += 1

    # --- Rule 6: Add text-muted-foreground to standalone text-xs ---
    for i, line in enumerate(lines):
        # Find className attributes containing text-xs
        # Match patterns like className="... text-xs ..." or className={cn("... text-xs ...")}
        if 'text-xs' not in line:
            continue

        # Extract the full class context around text-xs
        # We look at the surrounding className string content
        # Skip if the line already has a color class
        if has_color_class(line):
            continue

        # Skip SVG text elements (fontSize attribute, not className)
        if 'fontSize' in line:
            continue

        # Skip if text-xs is inside a template literal or complex expression
        # that already contains color info
        if 'style={{' in line and 'color' in line:
            continue

        # Add text-muted-foreground after text-xs
        lines[i] = line.replace('text-xs', 'text-xs text-muted-foreground')
        stats['text_xs'] += 1

    new_content = '\n'.join(lines)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return stats, True

    return stats, False


def main():
    pages = get_all_pages()
    print(f"Found {len(pages)} non-core pages to process\n")

    totals = {
        'space_y': 0,
        'gap': 0,
        'padding': 0,
        'headers': 0,
        'shadow': 0,
        'text_xs': 0,
    }
    files_modified = 0
    details = []

    for path in pages:
        rel = os.path.relpath(path, BASE)
        stats, modified = process_file(path)

        if modified:
            files_modified += 1
            for k in totals:
                totals[k] += stats[k]
            total_changes = sum(stats.values())
            details.append((rel, stats, total_changes))

    # Print summary
    total_all = sum(totals.values())
    print(f"{'='*70}")
    print(f"TOPIC PAGE POLISH SUMMARY")
    print(f"{'='*70}")
    print(f"Pages scanned:              {len(pages)}")
    print(f"Pages modified:             {files_modified}")
    print(f"")
    print(f"Rule 1: space-y-6 → 4:     {totals['space_y']}")
    print(f"Rule 2: gap-6 → 3:         {totals['gap']}")
    print(f"Rule 3: p-6 → p-4:         {totals['padding']}")
    print(f"Rule 4: text-2xl bold→med:  {totals['headers']}")
    print(f"Rule 5: shadow-sm removed:  {totals['shadow']}")
    print(f"Rule 6: text-xs +muted:     {totals['text_xs']}")
    print(f"{'─'*70}")
    print(f"Total replacements:         {total_all}")
    print(f"{'='*70}\n")

    if details:
        print(f"{'File':<58} {'sp':>3} {'gp':>3} {'pd':>3} {'hd':>3} {'sh':>3} {'xs':>3} {'tot':>4}")
        print(f"{'-'*58} {'---':>3} {'---':>3} {'---':>3} {'---':>3} {'---':>3} {'---':>3} {'----':>4}")
        for rel, s, total in sorted(details, key=lambda x: -x[2])[:50]:
            print(f"{rel:<58} {s['space_y']:>3} {s['gap']:>3} {s['padding']:>3} {s['headers']:>3} {s['shadow']:>3} {s['text_xs']:>3} {total:>4}")
        if len(details) > 50:
            print(f"  ... and {len(details) - 50} more files")


if __name__ == "__main__":
    main()
