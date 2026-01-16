#!/bin/bash
#
# Initialize a new project in the supervisor directory
# Usage: ./init-project.sh <project-name> <github-repo-url>
#
# Example: ./init-project.sh consilio https://github.com/gpt153/consilio-planning.git

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <project-name> [github-repo-url]"
    echo "Example: $0 consilio https://github.com/gpt153/consilio-planning.git"
    exit 1
fi

PROJECT_NAME="$1"
GITHUB_REPO="$2"
SUPERVISOR_DIR="/home/samuel/supervisor"
PROJECT_DIR="$SUPERVISOR_DIR/$PROJECT_NAME"

echo -e "${BLUE}🚀 Initializing supervisor project: $PROJECT_NAME${NC}"

# Check if project already exists
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Project directory already exists: $PROJECT_DIR${NC}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    rm -rf "$PROJECT_DIR"
fi

# Create directory structure
echo -e "${GREEN}📁 Creating directory structure...${NC}"
mkdir -p "$PROJECT_DIR/.bmad"/{epics,adr,prd,architecture,discussions,feature-requests}

# Copy and customize CLAUDE.md from template
echo -e "${GREEN}📋 Creating project CLAUDE.md from template...${NC}"
sed "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" "$SUPERVISOR_DIR/templates/CLAUDE-project-template.md" > "$PROJECT_DIR/CLAUDE.md"
sed -i "s/\[GITHUB_USERNAME\]/gpt153/g" "$PROJECT_DIR/CLAUDE.md"

# Copy templates and customize
echo -e "${GREEN}📄 Copying and customizing templates...${NC}"

# Project Brief
sed "s/\[Project Name\]/$PROJECT_NAME/g" "$SUPERVISOR_DIR/templates/project-brief.md" > .bmad/project-brief.md
sed -i "s|\[GitHub URL\]|$GITHUB_REPO|g" .bmad/project-brief.md
sed -i "s|\[project\]|$PROJECT_NAME|g" .bmad/project-brief.md

# Workflow Status
cp "$SUPERVISOR_DIR/templates/workflow-status.yaml" .bmad/workflow-status.yaml
sed -i "s/project-name/$PROJECT_NAME/g" .bmad/workflow-status.yaml
sed -i "s/YYYY-MM-DD/$(date +%Y-%m-%d)/g" .bmad/workflow-status.yaml

# Initialize Git repo
echo -e "${GREEN}🌲 Initializing Git repository...${NC}"
git init

# Create .gitignore
cat > .gitignore <<EOF
# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary
tmp/
temp/
*.tmp
EOF

# Add remote if provided
if [ -n "$GITHUB_REPO" ]; then
    echo -e "${GREEN}🔗 Adding GitHub remote...${NC}"
    git remote add origin "$GITHUB_REPO"
fi

# Initial commit
echo -e "${GREEN}💾 Creating initial commit...${NC}"
git add .
git commit -m "feat: Initialize $PROJECT_NAME planning structure

- Created .bmad directory structure
- Added project brief template
- Added workflow status tracking
- Created project-specific CLAUDE.md with SCAR verification protocols

Repository: $GITHUB_REPO
Planning framework: BMAD-inspired for SCAR platform"

# Instructions
echo
echo -e "${BLUE}✅ Project initialized successfully!${NC}"
echo
echo -e "${GREEN}Next steps:${NC}"
echo "1. Edit project brief:"
echo "   vim $PROJECT_DIR/.bmad/project-brief.md"
echo
echo "2. Push to GitHub (if remote configured):"
echo "   cd $PROJECT_DIR"
echo "   git push -u origin main"
echo
echo "3. Start planning with supervisor:"
echo "   cd $PROJECT_DIR"
echo "   /analyze \"First feature description\""
echo
echo -e "${GREEN}Available commands:${NC}"
echo "  /analyze <feature>       - Start requirements analysis"
echo "  /create-epic <name>      - Create epic file"
echo "  /create-adr <decision>   - Document technical decision"
echo "  /plan-feature <desc>     - Full planning workflow"
echo
echo -e "${BLUE}📂 Project location: $PROJECT_DIR${NC}"
echo -e "${BLUE}🌐 GitHub repo: ${GITHUB_REPO:-"(not configured)"}${NC}"
echo
