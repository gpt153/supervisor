#!/bin/bash
# Storybook Management Script for Supervisor UI Workflow

STORYBOOK_BASE="/home/samuel/supervisor/.ui-services/storybook-templates"
PROJECT_DIR=""

# Find the active Storybook project or use default
find_project() {
  if [ -f "/tmp/supervisor-storybook-project" ]; then
    PROJECT_DIR=$(cat /tmp/supervisor-storybook-project)
  else
    PROJECT_DIR="$STORYBOOK_BASE/react-vite"
  fi
}

case "$1" in
  start)
    find_project
    echo "🚀 Starting Storybook..."
    echo "📁 Project: $PROJECT_DIR"

    # Check if node_modules exists
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
      echo "📦 Installing dependencies (first time only)..."
      cd "$PROJECT_DIR" && npm install
    fi

    echo "🌐 Starting Storybook server..."
    cd "$PROJECT_DIR" && npm run storybook &
    STORYBOOK_PID=$!
    echo $STORYBOOK_PID > /tmp/supervisor-storybook-pid

    echo "✅ Storybook is starting..."
    echo "📍 Access at: https://storybook.153.se"
    echo "⏱️  Server will be ready in ~10-15 seconds"
    echo ""
    echo "💡 Use 'storybook.sh stop' to stop the server"
    ;;

  stop)
    if [ -f "/tmp/supervisor-storybook-pid" ]; then
      PID=$(cat /tmp/supervisor-storybook-pid)
      echo "🛑 Stopping Storybook (PID: $PID)..."

      # Kill the process and its children
      pkill -P $PID 2>/dev/null
      kill $PID 2>/dev/null

      rm /tmp/supervisor-storybook-pid
      echo "✅ Storybook stopped"
    else
      echo "⚠️  No running Storybook instance found"
      # Try to kill any storybook processes
      pkill -f "storybook dev" 2>/dev/null && echo "✅ Killed orphan Storybook processes"
    fi
    ;;

  restart)
    $0 stop
    sleep 2
    $0 start
    ;;

  status)
    if [ -f "/tmp/supervisor-storybook-pid" ]; then
      PID=$(cat /tmp/supervisor-storybook-pid)
      if ps -p $PID > /dev/null; then
        find_project
        echo "✅ Storybook is running (PID: $PID)"
        echo "📁 Project: $PROJECT_DIR"
        echo "📍 Access at: https://storybook.153.se"
      else
        echo "⚠️  Storybook PID file exists but process is not running"
        rm /tmp/supervisor-storybook-pid
      fi
    else
      echo "❌ Storybook is not running"
    fi
    ;;

  new)
    if [ -z "$2" ]; then
      echo "❌ Please provide a project name"
      echo "Usage: $0 new <project-name>"
      exit 1
    fi

    PROJECT_NAME="$2"
    NEW_PROJECT="$STORYBOOK_BASE/$PROJECT_NAME"

    if [ -d "$NEW_PROJECT" ]; then
      echo "⚠️  Project '$PROJECT_NAME' already exists"
      exit 1
    fi

    echo "📦 Creating new Storybook project: $PROJECT_NAME"
    cp -r "$STORYBOOK_BASE/react-vite" "$NEW_PROJECT"

    # Update package.json name
    sed -i "s/\"name\": \"storybook-mockup\"/\"name\": \"$PROJECT_NAME\"/" "$NEW_PROJECT/package.json"

    # Set as active project
    echo "$NEW_PROJECT" > /tmp/supervisor-storybook-project

    echo "✅ Project created at: $NEW_PROJECT"
    echo "💡 Run '$0 start' to launch it"
    ;;

  use)
    if [ -z "$2" ]; then
      echo "Available projects:"
      ls -1 "$STORYBOOK_BASE"
      exit 1
    fi

    PROJECT_NAME="$2"
    TARGET_PROJECT="$STORYBOOK_BASE/$PROJECT_NAME"

    if [ ! -d "$TARGET_PROJECT" ]; then
      echo "❌ Project '$PROJECT_NAME' not found"
      echo "Available projects:"
      ls -1 "$STORYBOOK_BASE"
      exit 1
    fi

    echo "$TARGET_PROJECT" > /tmp/supervisor-storybook-project
    echo "✅ Switched to project: $PROJECT_NAME"
    echo "💡 Run '$0 restart' to apply changes"
    ;;

  list)
    echo "📚 Available Storybook Templates:"
    ls -1 "$STORYBOOK_BASE"
    echo ""
    find_project
    echo "🎯 Active project: $(basename $PROJECT_DIR)"
    ;;

  *)
    echo "Storybook Management Script"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|new|use|list}"
    echo ""
    echo "Commands:"
    echo "  start           - Start Storybook server"
    echo "  stop            - Stop Storybook server"
    echo "  restart         - Restart Storybook server"
    echo "  status          - Check if Storybook is running"
    echo "  new <name>      - Create new Storybook project from template"
    echo "  use <name>      - Switch to different project"
    echo "  list            - List available projects"
    exit 1
    ;;
esac
