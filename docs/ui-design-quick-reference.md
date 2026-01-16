# UI Design Tools - Quick Reference

Fast command reference for Nano Banana, Frame0, and Figma MCP servers.

---

## Quick Decision Matrix

| Need | Use This Tool | Example |
|------|---------------|---------|
| Low-fidelity wireframe | Frame0 | "Create login wireframe" |
| High-fidelity mockup | Nano Banana | "Generate modern dashboard UI" |
| Design system code | Figma | "Extract color tokens from [URL]" |
| User flow diagram | Frame0 | "Create checkout flow diagram" |
| Hero image | Nano Banana | "Generate landing page hero" |
| Component code | Figma | "Convert button component to React" |

---

## Nano Banana Quick Commands

### Generate New Image
```
"Generate a [description] with [style] and [elements]"
```

### Edit Last Image
```
"Edit the previous image to change [what] to [new value]"
```

### Specific Styles
```
"Generate a [component] in [design system] style"
Examples: Material Design, iOS, Fluent Design, Glassmorphism
```

### Multiple Variations
```
"Generate 3 variations of [description] with different color schemes"
```

---

## Frame0 Quick Commands

### Create New Page
```
"Create a [screen name] for [device] in Frame0"
Devices: Phone, Tablet, Desktop
```

### Add Elements
```
"Add a [element] with [properties]"
Elements: button, text field, icon, image, navigation bar
```

### Modify Elements
```
"Change the [property] of [element] to [value]"
Properties: color, size, position, text
```

### Create Flow
```
"Set a link from [element] to [target]"
```

### Export
```
"Export the current page as an image"
```

---

## Figma Quick Commands

### Get Design Tokens
```
"Extract [type] from [Figma URL]"
Types: colors, typography, spacing, components
```

### Generate Code
```
"Convert [frame name] from [URL] to [tech stack]"
Stacks: React, Vue, HTML/CSS, React Native, Flutter
```

### Component Analysis
```
"Show me the components used in [frame] from [URL]"
```

### Design System
```
"List all variables in the design system at [URL]"
```

---

## Common Workflows

### New Feature Design
```
1. Frame0: "Create [feature] wireframe for mobile"
2. Nano Banana: "Generate modern [feature] UI with [style]"
3. Figma: "Extract design tokens from [URL] for implementation"
```

### Landing Page
```
1. Nano Banana: "Generate hero section with [description]"
2. Frame0: "Create page flow diagram showing navigation"
3. Figma: "Convert hero section to responsive HTML/CSS"
```

### Component Library
```
1. Figma: "List all button variants from [design system URL]"
2. Figma: "Generate React code for primary button"
3. Nano Banana: "Generate usage examples for button states"
```

---

## Example Prompts by Use Case

### Mobile App Design
```
Frame0:
- "Create a mobile app home screen wireframe"
- "Add a bottom navigation with 4 tabs"

Nano Banana:
- "Generate an iOS app home screen with modern design"
- "Create a mobile app splash screen with brand colors"

Figma:
- "Convert this mobile screen to React Native: [URL]"
```

### Dashboard Design
```
Frame0:
- "Create an analytics dashboard wireframe with charts"
- "Add a sidebar with navigation menu"

Nano Banana:
- "Generate a dark mode dashboard with data visualizations"
- "Create a modern admin panel interface"

Figma:
- "Extract chart components from dashboard at [URL]"
```

### Marketing Site
```
Nano Banana:
- "Generate a hero section with 3D illustration"
- "Create a pricing page with 3 tiers"

Frame0:
- "Create sitemap showing all pages and navigation"

Figma:
- "Convert hero section to responsive Tailwind components"
```

---

## Keyboard Shortcuts (Frame0)

When using Frame0 desktop app with MCP:

| Action | Command |
|--------|---------|
| New page | "Add a new page" |
| Duplicate | "Duplicate the current page" |
| Delete | "Delete [element]" |
| Group | "Group [elements]" |
| Align | "Align [elements] to [direction]" |

---

## Style Keywords

### Nano Banana Style Modifiers
- Modern, Minimalist, Flat, Material, Skeuomorphic
- Dark mode, Light mode, Gradient, Glassmorphism
- Corporate, Playful, Professional, Creative
- iOS style, Android style, Windows style

### Frame0 Element Types
- Frame, Rectangle, Ellipse, Text, Line, Polygon
- Connector, Icon, Image, Group
- Button, Input, Checkbox, Radio, Dropdown

### Figma Export Formats
- React, Vue, Svelte, Angular
- React Native, Flutter, SwiftUI
- HTML/CSS, Tailwind, SCSS, Styled Components

---

## API Key Quick Setup

### Gemini API Key (for Nano Banana)
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key
4. Edit: `~/.config/Claude/claude_desktop_config.json`
5. Replace: `YOUR_GEMINI_API_KEY_HERE`

### Figma OAuth (for Figma)
1. In Claude, type: `/mcp`
2. Select: "figma"
3. Click: "Authenticate"
4. Allow access

---

## Config File Location

**Linux**: `~/.config/Claude/claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

---

## Restart Required

After modifying `claude_desktop_config.json`:
1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. MCP servers will initialize automatically

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Nano Banana not working | Add GEMINI_API_KEY to config |
| Frame0 timeout | Check Node.js version (need v22+) |
| Figma 403 error | Re-authenticate with `/mcp` command |
| MCP not loading | Restart Claude Desktop |
| Config not found | Create directory: `~/.config/Claude/` |

---

## Getting Help

### Check MCP Status
```
In Claude: /mcp
```

### View Server Logs
```
Check Claude Desktop logs for errors
```

### Test Individual Servers
```
Terminal:
npx -y nano-banana-mcp
npx -y frame0-mcp-server
```

---

## Pro Tips

1. **Chain Tools**: Use Frame0 → Nano Banana → Figma for complete design-to-code workflow
2. **Save Context**: Reference previous outputs: "Based on the wireframe above..."
3. **Be Specific**: Include dimensions, colors, and component names
4. **Iterate**: Start simple, refine progressively
5. **Export Early**: Save intermediate results for documentation

---

## Resources

- Full Guide: `/home/samuel/supervisor/docs/ui-design-tools.md`
- Config File: `~/.config/Claude/claude_desktop_config.json`
- Nano Banana: https://github.com/ConechoAI/Nano-Banana-MCP
- Frame0: https://github.com/niklauslee/frame0-mcp-server
- Figma MCP: https://developers.figma.com/docs/figma-mcp-server/

---

**Last Updated**: 2026-01-16
