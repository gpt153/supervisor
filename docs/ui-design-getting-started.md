# Getting Started with UI Design Tools

Quick 5-minute setup guide for the MCP design tools.

---

## Step 1: Add Your Gemini API Key (2 minutes)

### Get the API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Get API Key"
4. Click "Create API Key"
5. Copy the key (starts with `AIzaSy...`)

### Add to Config
```bash
# Open config file
nano ~/.config/Claude/claude_desktop_config.json

# Find this line:
"GEMINI_API_KEY": "YOUR_GEMINI_API_KEY_HERE"

# Replace with your key:
"GEMINI_API_KEY": "AIzaSy..."

# Save: Ctrl+O, Enter, Ctrl+X
```

---

## Step 2: Restart Claude Desktop (30 seconds)

1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. Wait for MCP servers to initialize (you'll see a notification)

---

## Step 3: Test Each Tool (2 minutes)

### Test Nano Banana
In Claude Desktop, try:
```
"Generate a modern login page with a gradient background and floating input fields"
```

You should see an AI-generated image.

### Test Frame0
In Claude Desktop, try:
```
"Create a mobile app login screen wireframe in Frame0"
```

You should see a wireframe being created.

### Test Figma
In Claude Desktop, try:
```
/mcp
```
Select "figma" → Click "Authenticate" → Allow access

Then try (with a public Figma file):
```
"Extract design tokens from [Figma URL]"
```

---

## Quick Test Prompts

### Nano Banana Examples
```
"Generate a dark mode dashboard UI"
"Create a mobile app splash screen"
"Generate a hero section with 3D elements"
```

### Frame0 Examples
```
"Create a user flow diagram for signup"
"Create a dashboard wireframe with sidebar"
"Add a navigation bar with 5 menu items"
```

### Figma Examples
```
"Convert this Figma frame to React: [URL]"
"Extract color palette from [URL]"
"Show button components from [URL]"
```

---

## What If Something Goes Wrong?

### Nano Banana Not Working
**Error**: "GEMINI_API_KEY not found"
**Fix**: Double-check you added the key to the config file and restarted Claude

### Frame0 Not Responding
**Error**: Timeout or no response
**Fix**: Check Node.js version: `node --version` (need v20+)

### Figma 403 Error
**Error**: "Authentication failed"
**Fix**: Type `/mcp` in Claude, select Figma, authenticate again

---

## Next Steps

### Read the Full Guides
- **Comprehensive Guide**: `/home/samuel/supervisor/docs/ui-design-tools.md`
- **Quick Reference**: `/home/samuel/supervisor/docs/ui-design-quick-reference.md`
- **Installation Details**: `/home/samuel/supervisor/docs/mcp-installation-summary.md`

### Try a Complete Workflow
1. **Wireframe** with Frame0: "Create login wireframe"
2. **Mockup** with Nano Banana: "Generate modern login UI"
3. **Code** with Figma: "Convert to React component"

---

## Configuration Files

**Claude Desktop Config**: `~/.config/Claude/claude_desktop_config.json`

**Documentation Location**: `/home/samuel/supervisor/docs/`
- `ui-design-tools.md` - Full guide with examples
- `ui-design-quick-reference.md` - Command cheat sheet
- `mcp-installation-summary.md` - Technical details
- `ui-design-getting-started.md` - This file

---

## Resources

- **Google AI Studio**: https://aistudio.google.com
- **Nano Banana GitHub**: https://github.com/ConechoAI/Nano-Banana-MCP
- **Frame0 GitHub**: https://github.com/niklauslee/frame0-mcp-server
- **Figma MCP Docs**: https://developers.figma.com/docs/figma-mcp-server/

---

**That's it! You're ready to design.** Start with a simple prompt and explore each tool.
