#!/bin/bash
# Expo Info Page Web Server

WEB_DIR="/home/samuel/supervisor/.ui-services/expo-snack/web"
PORT=6007

case "$1" in
  start)
    echo "🌐 Starting Expo info page..."

    # Kill any existing server on this port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null

    # Start simple HTTP server
    cd "$WEB_DIR" && python3 -m http.server $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > /tmp/supervisor-expo-web-pid

    echo "✅ Expo info page running"
    echo "📍 Local: http://localhost:$PORT"
    echo "📍 Public: https://expo.153.se"
    ;;

  stop)
    if [ -f "/tmp/supervisor-expo-web-pid" ]; then
      PID=$(cat /tmp/supervisor-expo-web-pid)
      kill $PID 2>/dev/null
      rm /tmp/supervisor-expo-web-pid
      echo "✅ Expo info page stopped"
    else
      # Try to kill by port
      lsof -ti:$PORT | xargs kill -9 2>/dev/null && echo "✅ Stopped server on port $PORT"
    fi
    ;;

  restart)
    $0 stop
    sleep 1
    $0 start
    ;;

  status)
    if [ -f "/tmp/supervisor-expo-web-pid" ]; then
      PID=$(cat /tmp/supervisor-expo-web-pid)
      if ps -p $PID > /dev/null; then
        echo "✅ Expo info page is running (PID: $PID)"
        echo "📍 Access at: https://expo.153.se"
      else
        echo "⚠️  PID file exists but process is not running"
        rm /tmp/supervisor-expo-web-pid
      fi
    else
      echo "❌ Expo info page is not running"
    fi
    ;;

  *)
    echo "Expo Info Page Server"
    echo ""
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
