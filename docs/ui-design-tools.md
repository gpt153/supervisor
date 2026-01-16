# UI Design Tools - MCP Server Usage Guide

This guide covers the three MCP servers available for UI/UX design workflows in Claude Code and Claude Desktop.

---

## Overview

You have three powerful design tools integrated via MCP (Model Context Protocol):

1. **Nano Banana** - AI-powered photorealistic UI mockups and creative designs
2. **Frame0** - Clean wireframes and professional diagrams (Balsamiq alternative)
3. **Figma** - Design-to-code conversion and Figma file integration

---

## 1. Nano Banana MCP Server

**Purpose:** Generate photorealistic UI mockups, creative designs, and marketing materials using Google Gemini's image generation.

### When to Use Nano Banana

- Creating high-fidelity UI mockups for presentations
- Generating hero images and marketing materials
- Exploring creative design concepts
- Producing realistic product screenshots
- Creating visual prototypes for user testing

### Capabilities

- **Image Generation**: Create images from text descriptions
- **Image Editing**: Modify existing images with text prompts
- **Iterative Editing**: Continue editing previously generated images
- **Style Transfer**: Use multiple reference images for guidance
- **Session Management**: Maintains context across edits

### Example Prompts

```
"Generate a modern dashboard interface with a sidebar navigation,
dark theme, data visualizations, and card-based layout"

"Create a mobile app login screen with a gradient background,
minimalist design, social login buttons, and floating input fields"

"Generate a landing page hero section with a 3D illustration,
modern typography, and call-to-action button"

"Edit the previous image to change the color scheme to blue and white"
```

### Best Practices

1. **Be Specific**: Include details about style, colors, layout, and components
2. **Iterate**: Start broad, then refine with edit commands
3. **Reference Context**: Mention specific design systems or existing apps for style guidance
4. **Use Sessions**: Build up complex designs through multiple iterations
5. **Save Outputs**: Images are automatically saved with organized naming

### Configuration Requirements

- **API Key**: Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Free Tier**: Available for testing and development
- **Environment Variable**: `GEMINI_API_KEY`

### Getting Your Gemini API Key

1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Accept the Terms of Service
4. Click "Get API Key" in the bottom left
5. Create a new project or select an existing one
6. Click "Create API Key"
7. Copy the generated key
8. Add to your config: Replace `YOUR_GEMINI_API_KEY_HERE` in `~/.config/Claude/claude_desktop_config.json`

**Documentation**: [Google AI Studio API Key Guide](https://ai.google.dev/gemini-api/docs/api-key)

---

## 2. Frame0 MCP Server

**Purpose:** Create clean, professional wireframes and diagrams - a modern alternative to Balsamiq.

### When to Use Frame0

- Building low-fidelity wireframes
- Creating user flow diagrams
- Sketching interface layouts quickly
- Collaborative design sessions
- Prototyping before high-fidelity design

### Capabilities

- **Page Management**: Add, update, duplicate, delete pages
- **Shape Creation**: Frames, rectangles, ellipses, text, lines, polygons, connectors, icons, images
- **Shape Editing**: Update properties, move, duplicate, delete, align
- **Shape Organization**: Group/ungroup elements
- **Linking**: Create interactive prototypes with page links
- **Export**: Export shapes or pages as images

### Example Prompts

```
"Create a login screen for Phone in Frame0"

"Create an Instagram home screen for Phone in Frame0"

"Add a navigation bar with Home, Profile, and Settings buttons"

"Change the color of the Login button to blue"

"Remove the Twitter social login option"

"Set a link from the Google login button to the Google website"

"Export the current page as an image"
```

### Best Practices

1. **Start Simple**: Begin with basic shapes and layout
2. **Use Templates**: Leverage device frames (Phone, Tablet, Desktop)
3. **Natural Language**: Describe what you want in plain English
4. **Iterative Design**: Build up complexity gradually
5. **Link Flows**: Create interactive prototypes by linking elements to pages

### Configuration Requirements

- **Frame0 Desktop App**: Version 1.0.0-beta.17 or higher (optional, for desktop server)
- **Node.js**: Version 22 or higher
- **No API Key**: Works out of the box with npx

### Installation Notes

Frame0 MCP server runs via npx - no separate installation needed. It will download automatically when Claude Desktop starts.

**Documentation**: [Frame0 MCP Server GitHub](https://github.com/niklauslee/frame0-mcp-server)

---

## 3. Figma MCP Server

**Purpose:** Connect Figma designs to your development workflow for pixel-perfect implementation.

### When to Use Figma

- Converting Figma designs to code
- Extracting design tokens and variables
- Accessing component libraries
- Maintaining design-code consistency
- Building from existing Figma files

### Capabilities

- **Design-to-Code**: Generate code from Figma frames
- **Component Access**: Pull in variables, components, and layout data
- **Design Tokens**: Extract colors, typography, spacing
- **Frame Selection**: Convert specific frames to code
- **Design Context**: Understand existing design systems

### Example Prompts

```
"Generate React code for the login frame in this Figma file:
https://www.figma.com/file/ABC123..."

"Extract all color variables from this Figma design system"

"Convert this Figma component to a TypeScript React component
with Tailwind CSS"

"Show me the design tokens from this Figma file"

"Build a page matching this Figma mockup exactly"
```

### Best Practices

1. **Share Links**: Always provide the full Figma file URL
2. **Be Specific**: Name the exact frame or component you want
3. **Choose Stack**: Specify your tech stack (React, Vue, HTML/CSS, etc.)
4. **Design Systems**: Extract tokens first for consistency
5. **Iterate**: Start with structure, then refine styling

### Configuration Requirements

- **Authentication**: OAuth via Figma (no manual token needed for remote server)
- **Figma Account**: Free or paid plan
- **Access Type**: Remote server (no desktop app required)

### Authentication Setup

1. In Claude Desktop/Code, type `/mcp`
2. Select "figma" from the MCP servers list
3. Click "Authenticate"
4. Click "Allow Access" in the Figma OAuth dialog
5. You should see "Authentication successful"

### Alternative: Personal Access Token (Local Projects)

If you need a personal access token for API access:

1. Go to [figma.com](https://www.figma.com)
2. Click your profile avatar → Settings
3. Select the "Security" tab
4. In "Personal access tokens", click "Generate new token"
5. Set expiration and scopes
6. Click "Generate token"
7. Copy the token immediately (only shown once)

**Documentation**: [Figma Personal Access Tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)

---

## Workflow Recommendations

### Early-Stage Design

1. **Frame0** for initial wireframes and user flows
2. **Nano Banana** for exploring visual concepts
3. **Figma** for final high-fidelity designs

### Design-to-Code

1. **Figma** to extract design system tokens
2. **Figma** to generate component code
3. **Nano Banana** for missing visual assets

### Rapid Prototyping

1. **Frame0** for structure and layout
2. **Nano Banana** for realistic mockups
3. **Figma** for production-ready implementation

### Marketing & Presentations

1. **Nano Banana** for hero images and screenshots
2. **Frame0** for diagrams and flows
3. **Figma** for brand-consistent assets

---

## Combining Tools

### Example: Building a New Feature

```
Step 1: Wireframe (Frame0)
"Create a user profile page wireframe with header, avatar,
bio section, and activity feed"

Step 2: Visual Mockup (Nano Banana)
"Generate a modern user profile page with gradient header,
circular avatar, card-based activity feed, dark mode"

Step 3: Implementation (Figma)
"Extract the color palette and typography from our
Figma design system for this profile page"
```

### Example: Redesigning Existing UI

```
Step 1: Extract Current Design (Figma)
"Show me the components used in the dashboard layout
from [Figma URL]"

Step 2: Explore New Concepts (Nano Banana)
"Generate 3 variations of a dashboard with improved
data visualization and modern aesthetics"

Step 3: Document New Flow (Frame0)
"Create wireframes showing the new dashboard navigation
and information hierarchy"
```

---

## Tips & Tricks

### Nano Banana Tips

- Use "edit previous image" for incremental changes
- Provide reference images for consistent styling
- Specify dimensions for different screen sizes
- Mention specific design systems (Material Design, iOS, etc.)

### Frame0 Tips

- Start with device frames for proper sizing
- Use connectors to show interaction flows
- Group related elements for easier manipulation
- Export pages for documentation

### Figma Tips

- Share the specific frame URL, not just the file
- Request design tokens before components
- Specify your preferred CSS framework
- Ask for responsive breakpoints when needed

---

## Troubleshooting

### Nano Banana Issues

**Problem**: "GEMINI_API_KEY not found"
- **Solution**: Add your API key to `~/.config/Claude/claude_desktop_config.json`

**Problem**: Rate limiting or quota errors
- **Solution**: Check your Google AI Studio quota at [aistudio.google.com](https://aistudio.google.com)

### Frame0 Issues

**Problem**: Server not responding
- **Solution**: Ensure Node.js v22+ is installed: `node --version`

**Problem**: Frame0 app not found
- **Solution**: The remote npx version works without the desktop app

### Figma Issues

**Problem**: Authentication failed (403 error)
- **Solution**: Re-authenticate using `/mcp` command in Claude

**Problem**: Cannot access private files
- **Solution**: Ensure you have view/edit access to the Figma file

---

## API Key Summary

| Tool | API Key Required | Where to Get It | Cost |
|------|------------------|-----------------|------|
| Nano Banana | Yes (Gemini) | [Google AI Studio](https://aistudio.google.com/app/apikey) | Free tier available |
| Frame0 | No | N/A | Free |
| Figma | Yes (OAuth) | Automatic via Claude | Free for basic use |

---

## References

- [Nano Banana MCP GitHub](https://github.com/ConechoAI/Nano-Banana-MCP)
- [Frame0 MCP GitHub](https://github.com/niklauslee/frame0-mcp-server)
- [Figma MCP Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Last Updated**: 2026-01-16
**Config Location**: `~/.config/Claude/claude_desktop_config.json` (Linux)
