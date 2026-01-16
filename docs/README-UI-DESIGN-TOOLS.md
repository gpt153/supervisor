# UI Design Tools Documentation

Documentation for the 3 MCP servers installed for UI/UX design workflows.

---

## Quick Navigation

### Just Want to Get Started?
**Read**: `ui-design-getting-started.md` (5-minute setup)

### Need Quick Commands?
**Read**: `ui-design-quick-reference.md` (command cheat sheet)

### Want Detailed Examples?
**Read**: `ui-design-tools.md` (comprehensive guide)

### Need Technical Details?
**Read**: `mcp-installation-summary.md` (installation and troubleshooting)

---

## Documentation Files

| File | Size | Purpose |
|------|------|---------|
| `ui-design-getting-started.md` | 3.4K | 5-minute quick start guide |
| `ui-design-quick-reference.md` | 6.4K | Fast command reference and cheat sheet |
| `ui-design-tools.md` | 11K | Comprehensive usage guide with examples |
| `mcp-installation-summary.md` | 12K | Installation details and troubleshooting |

**Total Documentation**: ~33KB

---

## What's Installed

### 1. Nano Banana MCP Server
- **Purpose**: AI-powered photorealistic UI mockups
- **API**: Google Gemini Image Generation
- **Key Required**: Yes (free tier available)
- **Status**: Configured, requires API key

### 2. Frame0 MCP Server
- **Purpose**: Clean wireframes and diagrams
- **API**: None required
- **Key Required**: No
- **Status**: Fully operational

### 3. Figma MCP Server
- **Purpose**: Design-to-code conversion
- **API**: Figma REST API via OAuth
- **Key Required**: OAuth (automatic)
- **Status**: Configured, auth on first use

---

## Configuration

**Location**: `~/.config/Claude/claude_desktop_config.json`

**Servers Configured**:
- `nano-banana` - Uses Google Gemini API
- `frame0` - No authentication needed
- `figma` - Remote HTTP server with OAuth

---

## Quick Start

### 1. Add Gemini API Key
```bash
# Get key from: https://aistudio.google.com/app/apikey
# Edit config:
nano ~/.config/Claude/claude_desktop_config.json
# Replace: YOUR_GEMINI_API_KEY_HERE
```

### 2. Restart Claude Desktop
```bash
# Close completely, then reopen
```

### 3. Test Tools
```
Nano Banana: "Generate a modern login page UI"
Frame0: "Create a login wireframe in Frame0"
Figma: Type /mcp, select figma, authenticate
```

---

## Common Use Cases

### Wireframing
Use **Frame0** for low-fidelity wireframes and user flows

### Visual Mockups
Use **Nano Banana** for high-fidelity photorealistic UI designs

### Design-to-Code
Use **Figma** to convert designs to production code

### Complete Workflow
1. Frame0 → wireframe structure
2. Nano Banana → visual mockup
3. Figma → extract design tokens and generate code

---

## API Keys Needed

### Google Gemini API Key (for Nano Banana)
- **Get it**: https://aistudio.google.com/app/apikey
- **Cost**: Free tier available
- **Add to**: `~/.config/Claude/claude_desktop_config.json`

### Figma OAuth (for Figma)
- **Setup**: Type `/mcp` in Claude, select "figma", authenticate
- **Cost**: Free for basic use
- **No manual config needed**

### Frame0 (no key needed)
- Works immediately
- No authentication required

---

## Troubleshooting

### Check MCP Status
In Claude Desktop: `/mcp`

### Common Issues

**"GEMINI_API_KEY not found"**
- Add key to config file and restart Claude Desktop

**"Frame0 timeout"**
- Check Node.js version: `node --version` (need v20+)

**"Figma 403 error"**
- Re-authenticate via `/mcp` command

**"MCP servers not loading"**
- Verify config file syntax (must be valid JSON)
- Restart Claude Desktop completely

---

## Documentation Usage

### For First-Time Setup
1. Read: `ui-design-getting-started.md`
2. Get Gemini API key
3. Update config file
4. Restart Claude Desktop
5. Test each tool

### For Daily Use
1. Keep open: `ui-design-quick-reference.md`
2. Reference commands as needed
3. Try example prompts

### For Deep Dives
1. Read: `ui-design-tools.md`
2. Study workflow recommendations
3. Explore advanced examples

### For Technical Issues
1. Check: `mcp-installation-summary.md`
2. Review test results
3. Follow troubleshooting steps

---

## Resources

### Official Documentation
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Frame0 Docs](https://docs.frame0.app/)
- [Figma MCP Docs](https://developers.figma.com/docs/figma-mcp-server/)

### GitHub Repositories
- [Nano Banana](https://github.com/ConechoAI/Nano-Banana-MCP)
- [Frame0](https://github.com/niklauslee/frame0-mcp-server)

### Tutorials
- [Building MCP Server](https://igorstechnoclub.com/mcp-nano-banana/)
- [Claude Code + Figma](https://www.builder.io/blog/claude-code-figma-mcp-server)

---

## File Locations

### Configuration
```
~/.config/Claude/claude_desktop_config.json
```

### Documentation
```
/home/samuel/supervisor/docs/ui-design-getting-started.md
/home/samuel/supervisor/docs/ui-design-quick-reference.md
/home/samuel/supervisor/docs/ui-design-tools.md
/home/samuel/supervisor/docs/mcp-installation-summary.md
/home/samuel/supervisor/docs/README-UI-DESIGN-TOOLS.md (this file)
```

---

## Next Steps

1. **Get Started**: Follow `ui-design-getting-started.md`
2. **Add to Projects**: Reference these tools in project planning
3. **Explore Workflows**: Try combining all three tools
4. **Share Knowledge**: Point team members to these docs

---

**Installation Date**: 2026-01-16
**Last Updated**: 2026-01-16
**Status**: Ready for use (pending Gemini API key)
