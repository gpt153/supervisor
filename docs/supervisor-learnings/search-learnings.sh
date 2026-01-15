#!/bin/bash
# Supervisor Learning System - Search Helper
# Usage: ./search-learnings.sh [keyword|category|tag|recent]

LEARNINGS_DIR="/home/samuel/supervisor/docs/supervisor-learnings"
INDEX_FILE="$LEARNINGS_DIR/index.yaml"
LEARNINGS_SUBDIR="$LEARNINGS_DIR/learnings"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

show_help() {
    echo "Supervisor Learning System - Search Helper"
    echo ""
    echo "Usage:"
    echo "  ./search-learnings.sh search <keyword>     - Full text search in all learnings"
    echo "  ./search-learnings.sh category <name>      - List learnings by category"
    echo "  ./search-learnings.sh tag <name>           - List learnings by tag"
    echo "  ./search-learnings.sh recent [n]           - Show N most recent learnings (default: 5)"
    echo "  ./search-learnings.sh list                 - List all learnings"
    echo "  ./search-learnings.sh high                 - Show only high severity learnings"
    echo "  ./search-learnings.sh stats                - Show learning system statistics"
    echo ""
    echo "Examples:"
    echo "  ./search-learnings.sh search subagent"
    echo "  ./search-learnings.sh category context-management"
    echo "  ./search-learnings.sh tag rate-limit"
    echo "  ./search-learnings.sh recent 10"
}

search_keyword() {
    local keyword="$1"
    echo -e "${BLUE}Searching for: '$keyword'${NC}"
    echo ""

    grep -rin "$keyword" "$LEARNINGS_SUBDIR/" | while IFS=: read -r file line content; do
        filename=$(basename "$file")
        echo -e "${GREEN}$filename${NC}:${YELLOW}$line${NC}"
        echo "  $content"
        echo ""
    done
}

list_all() {
    echo -e "${BLUE}All Learnings:${NC}"
    echo ""

    if command -v yq &> /dev/null; then
        yq '.learnings[] | "[\(.id)] \(.title) - \(.severity)"' "$INDEX_FILE" 2>/dev/null || list_without_yq
    else
        list_without_yq
    fi
}

list_without_yq() {
    echo -e "${YELLOW}(yq not installed - showing file list)${NC}"
    echo ""
    for file in "$LEARNINGS_SUBDIR"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file" .md)
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            echo "  $filename: $title"
        fi
    done
}

show_stats() {
    echo -e "${BLUE}Supervisor Learning System Statistics${NC}"
    echo ""

    total=$(find "$LEARNINGS_SUBDIR" -name "*.md" -type f | wc -l)
    echo "Total learnings: $total"

    if command -v yq &> /dev/null; then
        echo ""
        echo "By severity:"
        yq '.learnings[] | .severity' "$INDEX_FILE" 2>/dev/null | sort | uniq -c | while read count severity; do
            echo "  $severity: $count"
        done

        echo ""
        echo "By category:"
        yq '.learnings[] | .category' "$INDEX_FILE" 2>/dev/null | sort | uniq -c | while read count category; do
            echo "  $category: $count"
        done
    fi
}

list_by_category() {
    local category="$1"
    echo -e "${BLUE}Learnings in category: $category${NC}"
    echo ""

    if command -v yq &> /dev/null; then
        yq ".learnings[] | select(.category == \"$category\") | \"[\(.id)] \(.title)\"" "$INDEX_FILE" 2>/dev/null
    else
        echo -e "${RED}yq not installed - using grep fallback${NC}"
        grep -l "category: $category" "$LEARNINGS_SUBDIR"/*.md | while read file; do
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            echo "  $(basename "$file"): $title"
        done
    fi
}

list_by_tag() {
    local tag="$1"
    echo -e "${BLUE}Learnings with tag: $tag${NC}"
    echo ""

    if command -v yq &> /dev/null; then
        yq ".learnings[] | select(.tags[] == \"$tag\") | \"[\(.id)] \(.title)\"" "$INDEX_FILE" 2>/dev/null
    else
        echo -e "${RED}yq not installed - using grep fallback${NC}"
        grep -l "tags:.*$tag" "$LEARNINGS_SUBDIR"/*.md | while read file; do
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            echo "  $(basename "$file"): $title"
        done
    fi
}

show_recent() {
    local n="${1:-5}"
    echo -e "${BLUE}Most recent $n learnings:${NC}"
    echo ""

    if command -v yq &> /dev/null; then
        yq ".learnings[-$n:] | .[] | \"[\(.id)] \(.date) - \(.title)\"" "$INDEX_FILE" 2>/dev/null
    else
        echo -e "${YELLOW}(yq not installed - showing by file modification)${NC}"
        find "$LEARNINGS_SUBDIR" -name "*.md" -type f -printf '%T@ %p\n' | \
            sort -rn | head -n "$n" | while read timestamp file; do
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            echo "  $(basename "$file"): $title"
        done
    fi
}

show_high_severity() {
    echo -e "${RED}High Severity Learnings:${NC}"
    echo ""

    if command -v yq &> /dev/null; then
        yq '.learnings[] | select(.severity == "high") | "[\(.id)] \(.title)"' "$INDEX_FILE" 2>/dev/null
    else
        grep -l "severity: high" "$LEARNINGS_SUBDIR"/*.md | while read file; do
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            echo "  $(basename "$file"): $title"
        done
    fi
}

# Main command dispatcher
case "${1:-help}" in
    search)
        if [ -z "$2" ]; then
            echo "Error: Please provide a search keyword"
            echo "Usage: ./search-learnings.sh search <keyword>"
            exit 1
        fi
        search_keyword "$2"
        ;;
    category)
        if [ -z "$2" ]; then
            echo "Error: Please provide a category name"
            echo "Usage: ./search-learnings.sh category <name>"
            exit 1
        fi
        list_by_category "$2"
        ;;
    tag)
        if [ -z "$2" ]; then
            echo "Error: Please provide a tag name"
            echo "Usage: ./search-learnings.sh tag <name>"
            exit 1
        fi
        list_by_tag "$2"
        ;;
    recent)
        show_recent "$2"
        ;;
    list)
        list_all
        ;;
    high)
        show_high_severity
        ;;
    stats)
        show_stats
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
