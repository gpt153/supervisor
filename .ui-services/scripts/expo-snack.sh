#!/bin/bash
# Expo Snack Integration Script for Supervisor UI Workflow

SNACK_DIR="/home/samuel/supervisor/.ui-services/expo-snack"
TEMPLATES_DIR="$SNACK_DIR/templates"

# Ensure directories exist
mkdir -p "$SNACK_DIR/generated" "$TEMPLATES_DIR"

case "$1" in
  create)
    if [ -z "$2" ]; then
      echo "❌ Please provide a component name"
      echo "Usage: $0 create <component-name> [template]"
      exit 1
    fi

    COMPONENT_NAME="$2"
    TEMPLATE="${3:-basic}"
    OUTPUT_DIR="$SNACK_DIR/generated/$COMPONENT_NAME"

    echo "📱 Creating Expo Snack: $COMPONENT_NAME"
    echo "📋 Using template: $TEMPLATE"

    # Create project directory
    mkdir -p "$OUTPUT_DIR"

    # Copy template or create basic App.tsx
    if [ -f "$TEMPLATES_DIR/$TEMPLATE/App.tsx" ]; then
      cp -r "$TEMPLATES_DIR/$TEMPLATE"/* "$OUTPUT_DIR/"
    else
      # Create basic template
      cat > "$OUTPUT_DIR/App.tsx" << 'EOF'
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from Expo Snack!</Text>
      <Text style={styles.subtitle}>Component: COMPONENT_NAME</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setCount(count + 1)}
      >
        <Text style={styles.buttonText}>Tap me! ({count})</Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        Edit this component in:
        {'\n'}$OUTPUT_DIR/App.tsx
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
EOF

      # Replace placeholders
      sed -i "s/COMPONENT_NAME/$COMPONENT_NAME/g" "$OUTPUT_DIR/App.tsx"
      sed -i "s|\$OUTPUT_DIR|$OUTPUT_DIR|g" "$OUTPUT_DIR/App.tsx"

      # Create package.json
      cat > "$OUTPUT_DIR/package.json" << EOF
{
  "name": "$COMPONENT_NAME",
  "version": "1.0.0",
  "main": "App.tsx",
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.76.6",
    "expo": "~52.0.29",
    "expo-status-bar": "~2.0.0"
  }
}
EOF
    fi

    echo "✅ Expo Snack created at: $OUTPUT_DIR"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open https://snack.expo.dev/"
    echo "2. Upload the files from: $OUTPUT_DIR"
    echo "3. Or use: $0 upload $COMPONENT_NAME"
    echo ""
    echo "💡 Edit App.tsx to customize your component"
    ;;

  upload)
    if [ -z "$2" ]; then
      echo "❌ Please provide a component name"
      echo "Usage: $0 upload <component-name>"
      exit 1
    fi

    COMPONENT_NAME="$2"
    COMPONENT_DIR="$SNACK_DIR/generated/$COMPONENT_NAME"

    if [ ! -d "$COMPONENT_DIR" ]; then
      echo "❌ Component '$COMPONENT_NAME' not found"
      echo "💡 Create it first with: $0 create $COMPONENT_NAME"
      exit 1
    fi

    echo "📤 Uploading $COMPONENT_NAME to Expo Snack..."
    echo ""
    echo "⚠️  Automatic upload requires Expo Snack API (coming soon)"
    echo ""
    echo "Manual upload:"
    echo "1. Visit: https://snack.expo.dev/"
    echo "2. Click 'New Snack'"
    echo "3. Replace App.tsx with contents from:"
    echo "   $COMPONENT_DIR/App.tsx"
    echo "4. Click 'Save' to get a shareable link"
    echo ""
    echo "💡 The link will look like: https://snack.expo.dev/@username/abc123"
    ;;

  list)
    echo "📱 Generated Expo Snacks:"
    if [ -d "$SNACK_DIR/generated" ]; then
      ls -1 "$SNACK_DIR/generated" 2>/dev/null || echo "  (none)"
    else
      echo "  (none)"
    fi
    ;;

  open)
    if [ -z "$2" ]; then
      echo "❌ Please provide a component name"
      echo "Usage: $0 open <component-name>"
      exit 1
    fi

    COMPONENT_NAME="$2"
    COMPONENT_DIR="$SNACK_DIR/generated/$COMPONENT_NAME"

    if [ ! -d "$COMPONENT_DIR" ]; then
      echo "❌ Component '$COMPONENT_NAME' not found"
      exit 1
    fi

    echo "📂 Opening $COMPONENT_NAME"
    echo "📍 Location: $COMPONENT_DIR"
    echo ""
    cat "$COMPONENT_DIR/App.tsx"
    ;;

  delete)
    if [ -z "$2" ]; then
      echo "❌ Please provide a component name"
      echo "Usage: $0 delete <component-name>"
      exit 1
    fi

    COMPONENT_NAME="$2"
    COMPONENT_DIR="$SNACK_DIR/generated/$COMPONENT_NAME"

    if [ ! -d "$COMPONENT_DIR" ]; then
      echo "❌ Component '$COMPONENT_NAME' not found"
      exit 1
    fi

    read -p "⚠️  Delete '$COMPONENT_NAME'? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      rm -rf "$COMPONENT_DIR"
      echo "✅ Deleted $COMPONENT_NAME"
    else
      echo "❌ Cancelled"
    fi
    ;;

  info)
    echo "📱 Expo Snack Information"
    echo ""
    echo "Expo Snack is an online React Native playground that lets you:"
    echo "  • Write and preview React Native code in the browser"
    echo "  • Test on real devices using Expo Go app"
    echo "  • Share prototypes with shareable links"
    echo "  • No setup or installation required"
    echo ""
    echo "🌐 Access: https://snack.expo.dev/"
    echo "📱 Mobile: Download 'Expo Go' app (iOS/Android)"
    echo "📍 Info page: https://expo.153.se"
    ;;

  *)
    echo "Expo Snack Integration Script"
    echo ""
    echo "Usage: $0 {create|upload|list|open|delete|info}"
    echo ""
    echo "Commands:"
    echo "  create <name> [template] - Create new Expo Snack component"
    echo "  upload <name>            - Upload component to Expo Snack"
    echo "  list                     - List generated components"
    echo "  open <name>              - View component code"
    echo "  delete <name>            - Delete a component"
    echo "  info                     - Show Expo Snack information"
    echo ""
    echo "Examples:"
    echo "  $0 create LoginScreen"
    echo "  $0 upload LoginScreen"
    echo "  $0 list"
    exit 1
    ;;
esac
