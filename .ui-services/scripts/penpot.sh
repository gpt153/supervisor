#!/bin/bash
# Penpot Management Script for Supervisor UI Workflow

PENPOT_DIR="/home/samuel/supervisor/.ui-services/penpot"
COMPOSE_FILE="$PENPOT_DIR/docker-compose.custom.yaml"

case "$1" in
  start)
    echo "🚀 Starting Penpot..."
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" up -d
    echo "✅ Penpot is starting..."
    echo "📍 Access at: https://penpot.153.se"
    echo "📧 Mailcatcher: http://localhost:1080"
    echo ""
    echo "⏱️  First startup may take 1-2 minutes to initialize the database."
    echo "💡 Create an account at https://penpot.153.se to get started"
    ;;

  stop)
    echo "🛑 Stopping Penpot..."
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" down
    echo "✅ Penpot stopped"
    ;;

  restart)
    echo "🔄 Restarting Penpot..."
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" restart
    echo "✅ Penpot restarted"
    ;;

  status)
    echo "📊 Penpot Status:"
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" ps
    ;;

  logs)
    echo "📋 Penpot Logs (Ctrl+C to exit):"
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" logs -f
    ;;

  update)
    echo "⬆️  Updating Penpot to latest version..."
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" pull
    echo "🔄 Restarting services..."
    cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" up -d
    echo "✅ Penpot updated"
    ;;

  clean)
    echo "⚠️  WARNING: This will delete all Penpot data including designs!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "🧹 Stopping and removing Penpot..."
      cd "$PENPOT_DIR" && docker compose -f "$COMPOSE_FILE" down -v
      echo "✅ Penpot data deleted"
    else
      echo "❌ Cancelled"
    fi
    ;;

  *)
    echo "Penpot Management Script"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|update|clean}"
    echo ""
    echo "Commands:"
    echo "  start    - Start Penpot services"
    echo "  stop     - Stop Penpot services"
    echo "  restart  - Restart Penpot services"
    echo "  status   - Show service status"
    echo "  logs     - View service logs"
    echo "  update   - Pull latest images and restart"
    echo "  clean    - Delete all data (WARNING: destructive)"
    exit 1
    ;;
esac
