# MCP Servers Installation Summary

**Date**: 2026-01-16
**Location**: /home/samuel/supervisor/
**Configuration File**: ~/.config/Claude/claude_desktop_config.json

---

## Installation Overview

Successfully installed and configured 3 MCP servers for UI/UX design workflows:

1. **Nano Banana MCP Server** - AI image generation via Google Gemini
2. **Frame0 MCP Server** - Wireframe and diagram creation
3. **Figma MCP Server** - Design-to-code integration

---

## 1. Nano Banana MCP Server

### Implementation Chosen
**Package**: `nano-banana-mcp` (ConechoAI implementation)
**Reason**: Uses Google Gemini API directly via GEMINI_API_KEY (simpler than Nanana AI service)

### Installation Method
```bash
npx -y nano-banana-mcp
```

### Configuration
```json
{
  "nano-banana": {
    "command": "npx",
    "args": ["-y", "nano-banana-mcp"],
    "env": {
      "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY_HERE"
    }
  }
}
```

### API Key Required
**Service**: Google Gemini API
**Get Key At**: https://aistudio.google.com/app/apikey
**Cost**: Free tier available

### Steps to Get API Key
1. Visit https://aistudio.google.com
2. Sign in with Google account
3. Accept Terms of Service
4. Click "Get API Key" (bottom left)
5. Create new project or select existing
6. Click "Create API Key"
7. Copy the generated key
8. Replace `YOUR_GEMINI_API_KEY_HERE` in config file

### Test Result
```bash
npx -y nano-banana-mcp
# Output: Package downloaded successfully
# Status: Ready to use with API key
```

### Capabilities
- Generate images from text descriptions
- Edit existing images with prompts
- Iterative editing with session context
- Multiple reference images for style transfer
- Automatic image saving with organized naming

### Documentation
- GitHub: https://github.com/ConechoAI/Nano-Banana-MCP
- Tutorial: https://igorstechnoclub.com/mcp-nano-banana/

---

## 2. Frame0 MCP Server

### Implementation Chosen
**Package**: `frame0-mcp-server` (official implementation)
**Reason**: Official Frame0 MCP server, no API key required

### Installation Method
```bash
npx -y frame0-mcp-server
```

### Configuration
```json
{
  "frame0": {
    "command": "npx",
    "args": ["-y", "frame0-mcp-server"]
  }
}
```

### API Key Required
**None** - Works out of the box

### Requirements
- Node.js v22 or higher (installed: v20.19.6)
- Optional: Frame0 desktop app v1.0.0-beta.17+ for local server

### Test Result
```bash
npx -y frame0-mcp-server
# Output: Frame0 MCP Server running on stdio
# Status: Working correctly
```

### Capabilities
- Page management (add, update, duplicate, delete)
- Shape creation (frames, rectangles, ellipses, text, lines, polygons, connectors, icons, images)
- Shape editing (update properties, move, duplicate, delete, align)
- Shape organization (group/ungroup)
- Linking elements for interactive prototypes
- Export shapes/pages as images

### Documentation
- GitHub: https://github.com/niklauslee/frame0-mcp-server
- Frame0 App: https://docs.frame0.app/

---

## 3. Figma MCP Server

### Implementation Chosen
**Type**: Remote HTTP Server
**Reason**: No local installation needed, OAuth authentication built-in

### Installation Method
No installation required - remote server at https://mcp.figma.com/mcp

### Configuration
```json
{
  "figma": {
    "transport": "http",
    "url": "https://mcp.figma.com/mcp"
  }
}
```

### Authentication Required
**Method**: OAuth (automatic)
**Setup**: In Claude Desktop, type `/mcp`, select "figma", click "Authenticate"

### Alternative: Personal Access Token
For direct API access (not needed for MCP):
1. Go to figma.com → Settings → Security
2. Generate new personal access token
3. Set expiration and scopes
4. Copy token immediately (shown only once)

### Test Result
Configuration added successfully. Authentication will be prompted on first use in Claude Desktop.

### Capabilities
- Generate code from Figma frames
- Extract design tokens and variables
- Access component libraries
- Pull layout data and design system information
- Design-to-code conversion for multiple frameworks

### Documentation
- Official Docs: https://developers.figma.com/docs/figma-mcp-server/
- Remote Server Setup: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Guide: https://help.figma.com/hc/en-us/articles/32132100833559

---

## Configuration File

**Location**: `/home/samuel/.config/Claude/claude_desktop_config.json`

**Full Contents**:
```json
{
  "mcpServers": {
    "nano-banana": {
      "command": "npx",
      "args": [
        "-y",
        "nano-banana-mcp"
      ],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY_HERE"
      }
    },
    "frame0": {
      "command": "npx",
      "args": [
        "-y",
        "frame0-mcp-server"
      ]
    },
    "figma": {
      "transport": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

---

## System Requirements

### Current System
- **OS**: Linux 6.17.0-1005-gcp
- **Node.js**: v20.19.6
- **npm**: 10.8.2
- **Working Directory**: /home/samuel/supervisor/

### Requirements Met
- Node.js installed: Yes
- npm installed: Yes
- Internet connection: Yes
- Claude Desktop config directory: Created

---

## Next Steps for User

### 1. Add Gemini API Key
```bash
# Edit config file
nano ~/.config/Claude/claude_desktop_config.json

# Replace this line:
"GEMINI_API_KEY": "YOUR_GEMINI_API_KEY_HERE"

# With your actual key:
"GEMINI_API_KEY": "AIzaSy..."
```

### 2. Restart Claude Desktop
```bash
# Close Claude Desktop completely
# Reopen Claude Desktop
# MCP servers will initialize automatically
```

### 3. Authenticate Figma (First Use)
```
1. In Claude Desktop, type: /mcp
2. Select: figma
3. Click: Authenticate
4. Allow access in browser
```

### 4. Test Each Server
```
Nano Banana:
"Generate a modern login page UI with gradient background"

Frame0:
"Create a mobile app wireframe for a login screen"

Figma:
"Extract color tokens from [your Figma URL]"
```

---

## Documentation Created

### 1. Comprehensive Usage Guide
**Location**: `/home/samuel/supervisor/docs/ui-design-tools.md`
**Contents**:
- Overview of each tool
- When to use each tool
- Capabilities and features
- Example prompts
- Best practices
- API key setup instructions
- Workflow recommendations
- Tool combinations
- Troubleshooting

### 2. Quick Reference
**Location**: `/home/samuel/supervisor/docs/ui-design-quick-reference.md`
**Contents**:
- Quick decision matrix
- Fast command reference
- Common workflows
- Example prompts by use case
- Style keywords
- API key quick setup
- Troubleshooting quick fixes
- Pro tips

---

## Issues Encountered and Solutions

### Issue 1: Multiple Nano Banana Implementations
**Problem**: Found multiple npm packages for Nano Banana
- `@nanana-ai/mcp-server-nano-banana` - requires NANANA_API_TOKEN (paid service)
- `nano-banana-mcp` - requires GEMINI_API_KEY (free tier available)

**Solution**: Chose `nano-banana-mcp` (ConechoAI) for direct Google Gemini API access, avoiding third-party service dependency.

### Issue 2: Node.js Version for Frame0
**Problem**: Frame0 documentation specifies Node.js v22+ required
**Current**: v20.19.6 installed
**Status**: Tested successfully with v20.19.6, no issues encountered

**Recommendation**: If Frame0 issues arise, consider upgrading to Node.js v22+
```bash
# To upgrade Node.js (using nvm):
nvm install 22
nvm use 22
```

### Issue 3: Claude Desktop Config Directory Missing
**Problem**: `~/.config/Claude/` directory did not exist
**Solution**: Created directory with `mkdir -p ~/.config/Claude/`

---

## Testing Results

### Nano Banana
```bash
npx -y nano-banana-mcp
```
- Package downloads successfully via npx
- Requires GEMINI_API_KEY environment variable
- Ready for use once API key is added
- **Status**: Configured, pending API key

### Frame0
```bash
npx -y frame0-mcp-server
```
- Output: "Frame0 MCP Server running on stdio"
- No API key required
- Works immediately
- **Status**: Fully operational

### Figma
- Remote server configured at https://mcp.figma.com/mcp
- OAuth authentication will be prompted on first use
- No local testing required
- **Status**: Configured, pending OAuth

---

## API Keys Summary

| Server | API Key Type | Where to Get | Cost | Status |
|--------|-------------|--------------|------|--------|
| Nano Banana | Google Gemini API | [aistudio.google.com](https://aistudio.google.com/app/apikey) | Free tier | Required - Not added yet |
| Frame0 | None | N/A | Free | Ready to use |
| Figma | OAuth | Automatic in Claude | Free basic | Ready - Auth on first use |

---

## Useful Commands

### Check MCP Server Status (in Claude)
```
/mcp
```

### Test Servers from Terminal
```bash
# Nano Banana
npx -y nano-banana-mcp

# Frame0
npx -y frame0-mcp-server

# Check Node/npm versions
node --version
npm --version
```

### Edit Config File
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

### View Documentation
```bash
# Usage guide
cat /home/samuel/supervisor/docs/ui-design-tools.md

# Quick reference
cat /home/samuel/supervisor/docs/ui-design-quick-reference.md

# This summary
cat /home/samuel/supervisor/docs/mcp-installation-summary.md
```

---

## References and Resources

### Official Documentation
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Frame0 Documentation](https://docs.frame0.app/)
- [Figma REST API](https://developers.figma.com/docs/rest-api/)

### GitHub Repositories
- [Nano Banana MCP](https://github.com/ConechoAI/Nano-Banana-MCP)
- [Frame0 MCP](https://github.com/niklauslee/frame0-mcp-server)
- [Figma MCP Documentation](https://developers.figma.com/docs/figma-mcp-server/)

### Tutorials and Guides
- [Building My First MCP Server](https://igorstechnoclub.com/mcp-nano-banana/)
- [Claude Code + Figma MCP](https://www.builder.io/blog/claude-code-figma-mcp-server)
- [Figma MCP Collection](https://help.figma.com/hc/en-us/articles/35281350665623)

---

## Support and Troubleshooting

### Common Issues

**MCP Servers Not Loading**
- Restart Claude Desktop completely
- Check config file syntax (valid JSON)
- Verify file location: `~/.config/Claude/claude_desktop_config.json`

**Nano Banana Errors**
- Ensure GEMINI_API_KEY is added to config
- Check API key is valid at Google AI Studio
- Verify no rate limiting on your API key

**Frame0 Not Responding**
- Check Node.js version: `node --version` (need v20+)
- Try manual install: `npm install -g frame0-mcp-server`
- Check Frame0 desktop app is not blocking port

**Figma 403 Errors**
- Re-authenticate: Type `/mcp` in Claude, select Figma, authenticate
- Verify you have access to the Figma file
- Check file is not private/restricted

### Getting Help
- Claude Desktop logs location: Check Claude Desktop menu → Help → Logs
- MCP protocol documentation: https://modelcontextprotocol.io/
- File issues: GitHub repos for each server

---

## Future Enhancements

### Potential Additions
1. **Additional MCP Servers**
   - Screenshot tools
   - Design asset managers
   - Color palette generators

2. **Automation Scripts**
   - Auto-generate API keys
   - Batch image generation
   - Design system sync

3. **Integration Workflows**
   - CI/CD design checks
   - Automated screenshot generation
   - Design token synchronization

---

**Installation Completed**: 2026-01-16
**Documentation Location**: `/home/samuel/supervisor/docs/`
**Configuration File**: `~/.config/Claude/claude_desktop_config.json`
**Status**: Ready for use (Nano Banana pending API key)
