# UI Workflow System - Complete Guide

**Version:** 1.0
**Last Updated:** 2026-01-17
**Status:** Production Ready

---

## Overview

The UI Workflow System provides a complete, structured approach to designing and implementing user interfaces for web, desktop, and mobile applications. It's integrated into the Supervisor and accessible via Claude Code CLI.

### Key Features

- **Interactive Prototyping** with Penpot (open-source Figma alternative)
- **Component Playground** with Storybook (for web/PWA/desktop)
- **Mobile Mockups** with Expo Snack (React Native)
- **Cloud Access** via Cloudflare Tunnel (all services accessible via HTTPS)
- **No Local Tools Needed** - Everything runs on the server, accessible from browser

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User (CLI/Browser)                   │
└────────────┬───────────────┬────────────────┬───────────┘
             │               │                │
    ┌────────▼───────┐  ┌────▼─────┐  ┌──────▼────────┐
    │ penpot.153.se  │  │storybook │  │ expo.153.se   │
    │   (Port 9001)  │  │.153.se   │  │  (Port 6007)  │
    │                │  │(Port6006)│  │               │
    └────────┬───────┘  └────┬─────┘  └──────┬────────┘
             │               │                │
    ┌────────▼───────────────▼────────────────▼────────┐
    │         Cloudflare Tunnel (tummen)               │
    └──────────────────────────────────────────────────┘
             │               │                │
    ┌────────▼───────┐  ┌────▼─────┐  ┌──────▼────────┐
    │  Penpot        │  │Storybook │  │ Expo Info     │
    │  (Docker)      │  │ (Node.js)│  │ (Static HTML) │
    └────────────────┘  └──────────┘  └───────────────┘
```

---

## 3-Phase Workflow

### Phase 1: Discussion (Natural Conversation)

**What happens:**
- User describes the UI they want to build
- You ask clarifying questions
- Together you define requirements
- Decide on platform (web, mobile, desktop)

**No tools needed** - Just conversation in Claude Code CLI

---

### Phase 2: Interactive Prototype

**Tool:** Penpot
**Access:** https://penpot.153.se
**Purpose:** Create clickable prototypes and designs

**Process:**
1. Start Penpot service
2. User creates account (first time)
3. User designs screens and flows
4. User links screens together (clickable prototype)
5. User shares feedback with you
6. Ready for Phase 3

**Advantages:**
- Visual design without code
- Test user flows interactively
- Export designs as SVG/PNG
- Collaborate with team members

---

### Phase 3a: Coded Mockup (Web/Desktop)

**Tool:** Storybook
**Access:** https://storybook.153.se
**Purpose:** Interactive component playground with real code

**Process:**
1. You generate React components based on design
2. Create Storybook stories for each component
3. User interacts with live components
4. User gives feedback on behavior/styling
5. You iterate until approved

**Result:** Working UI components, no backend needed

---

### Phase 3b: Coded Mockup (Mobile)

**Tool:** Expo Snack
**Access:** https://expo.153.se (info page)
**Snack:** https://snack.expo.dev
**Purpose:** Test React Native components on real devices

**Process:**
1. You generate React Native component
2. Component uploaded to Expo Snack
3. User scans QR code with Expo Go app
4. User tests on real phone
5. You iterate based on feedback

**Result:** Working mobile UI, testable on real devices

---

### Phase 4: Export to Production

**What happens:**
- You copy approved components to the actual project
- Adapt code to match project structure
- Create placeholder API calls
- Document components
- Commit to git

**Result:** Production-ready UI code in the project

---

## Services & URLs

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| **Penpot** | https://penpot.153.se | 9001 | Interactive prototypes |
| **Storybook** | https://storybook.153.se | 6006 | Web component playground |
| **Expo Info** | https://expo.153.se | 6007 | Mobile workflow info |
| **Mailcatcher** | http://localhost:1080 | 1080 | Penpot email testing |

All services are accessible via Cloudflare Tunnel for secure HTTPS access from anywhere.

---

## Management Scripts

All scripts located in: `/home/samuel/supervisor/.ui-services/scripts/`

### Penpot (`penpot.sh`)

```bash
# Start Penpot
./penpot.sh start

# Stop Penpot
./penpot.sh stop

# Restart Penpot
./penpot.sh restart

# Check status
./penpot.sh status

# View logs
./penpot.sh logs

# Update to latest version
./penpot.sh update

# Delete all data (WARNING)
./penpot.sh clean
```

**First Start:** Takes 1-2 minutes (database initialization)
**Subsequent Starts:** ~20 seconds

---

### Storybook (`storybook.sh`)

```bash
# Start Storybook
./storybook.sh start

# Stop Storybook
./storybook.sh stop

# Check status
./storybook.sh status

# Create new project
./storybook.sh new <project-name>

# Switch to project
./storybook.sh use <project-name>

# List projects
./storybook.sh list
```

**Startup Time:** ~10-15 seconds
**Auto-reload:** Yes (watches for file changes)

---

### Expo Snack (`expo-snack.sh`)

```bash
# Create component
./expo-snack.sh create <component-name>

# Upload to Expo Snack
./expo-snack.sh upload <component-name>

# List components
./expo-snack.sh list

# View component code
./expo-snack.sh open <component-name>

# Delete component
./expo-snack.sh delete <component-name>

# Show info
./expo-snack.sh info
```

---

### Expo Web Server (`expo-web.sh`)

```bash
# Start info page
./expo-web.sh start

# Stop info page
./expo-web.sh stop

# Check status
./expo-web.sh status
```

---

## Usage Examples

### Example 1: Building a Web Dashboard

```
User: "I want to create a dashboard for my app"

1. You: Start Penpot, user creates design
2. You: Generate React components in new Storybook project
3. User: Reviews at https://storybook.153.se
4. You: Iterate based on feedback
5. You: Export to project when approved
```

### Example 2: Mobile Login Screen

```
User: "Need a login screen for my mobile app"

1. You: Start Penpot, user designs login flow
2. You: Create React Native component with Expo Snack
3. User: Tests on phone via QR code
4. You: Adjust styling based on feedback
5. You: Export to React Native project
```

### Example 3: Component Library

```
User: "Building a design system with reusable components"

1. You: Create Penpot designs for each component
2. You: Generate Storybook project with all components
3. User: Reviews and tests interactions
4. You: Export entire component library to npm package
```

---

## File Structure

```
/home/samuel/supervisor/.ui-services/
├── scripts/
│   ├── penpot.sh
│   ├── storybook.sh
│   ├── expo-snack.sh
│   └── expo-web.sh
├── penpot/
│   ├── docker-compose.custom.yaml
│   └── (Docker volumes)
├── storybook-templates/
│   ├── react-vite/  (template)
│   └── <project-name>/  (user projects)
└── expo-snack/
    ├── generated/
    │   └── <component-name>/
    │       ├── App.tsx
    │       └── package.json
    └── web/
        └── index.html
```

---

## Cloudflare Tunnel Configuration

**Config File:** `/etc/cloudflared/config.yml`

```yaml
ingress:
  # UI Workflow Services
  - hostname: penpot.153.se
    service: http://localhost:9001
  - hostname: storybook.153.se
    service: http://localhost:6006
  - hostname: expo.153.se
    service: http://localhost:6007

  # ... other services ...

  - service: http_status:404
```

**Restart tunnel after config changes:**
```bash
sudo systemctl restart cloudflared
```

---

## Penpot Configuration

### First-Time Setup

1. Visit https://penpot.153.se
2. Create account (use any email, verification disabled)
3. Start creating designs

### Key Features

- **Password Login:** Enabled (no OAuth needed)
- **Registration:** Open (internal use only)
- **Email Verification:** Disabled for convenience
- **Secure Session:** Disabled (behind Cloudflare tunnel)
- **Storage:** Local filesystem (Docker volume)
- **Database:** PostgreSQL 15
- **Cache:** Valkey (Redis alternative)

### Security Note

Penpot is configured for internal use with relaxed security settings. It's protected by Cloudflare Tunnel and should only be accessible to team members.

---

## Storybook Configuration

### Template: React + Vite + TypeScript

**Package.json:**
- React 18.3.1
- Storybook 8.5.3
- TypeScript 5.7.2
- Vite 6.0.5

### Creating Components

**Component Pattern:**
```typescript
// src/components/Button.tsx
import React from 'react';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button = ({
  label,
  variant = 'primary',
  onClick
}: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};
```

**Story Pattern:**
```typescript
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Click me', variant: 'primary' },
};
```

---

## Expo Snack Workflow

### Component Generation

Components are generated locally and then uploaded to Expo Snack manually or automatically (API integration coming soon).

**Generated Structure:**
```
expo-snack/generated/<component-name>/
├── App.tsx          # React Native component
└── package.json     # Dependencies
```

### Testing on Device

1. Download "Expo Go" app on iOS/Android
2. Visit https://snack.expo.dev
3. Upload component code
4. Scan QR code with Expo Go
5. Component runs on real device

---

## Troubleshooting

### Penpot Issues

**Problem:** Penpot won't start
**Solution:**
```bash
# Check Docker
docker ps

# View logs
./penpot.sh logs

# Restart
./penpot.sh restart
```

**Problem:** Can't access Penpot at URL
**Solution:**
```bash
# Check tunnel
sudo systemctl status cloudflared

# Restart tunnel
sudo systemctl restart cloudflared

# Check Penpot is running
curl http://localhost:9001
```

---

### Storybook Issues

**Problem:** Storybook won't start
**Solution:**
```bash
# Check for port conflict
lsof -ti:6006

# Reinstall dependencies
cd /home/samuel/supervisor/.ui-services/storybook-templates/react-vite
npm install

# Try starting again
./storybook.sh start
```

**Problem:** Components not updating
**Solution:** Storybook has hot reload, but sometimes you need to refresh the browser.

---

### Cloudflare Tunnel Issues

**Problem:** Services not accessible via *.153.se
**Solution:**
```bash
# Check tunnel status
sudo systemctl status cloudflared

# Check logs
sudo journalctl -u cloudflared -n 50

# Restart
sudo systemctl restart cloudflared
```

---

## Best Practices

### For Prototyping

1. **Start Simple:** Basic layouts first, then add details
2. **Test Flows:** Link pages in Penpot to test navigation
3. **Get Feedback Early:** Don't over-design before showing user
4. **Export Often:** Save SVG/PNG exports for documentation

### For Component Development

1. **One Component at a Time:** Don't build everything at once
2. **Stories for States:** Create stories for different component states
3. **Use TypeScript:** Proper types prevent bugs
4. **Document Props:** Add comments explaining what each prop does

### For Mobile Development

1. **Test on Real Device:** Simulators don't show real performance
2. **Consider Screen Sizes:** Test on both phone and tablet
3. **Touch Targets:** Make buttons big enough for fingers
4. **Native Feel:** Use native components when possible

---

## Integration with Supervisor

### Using the /ui-workflow Command

The `/ui-workflow` command (located at `.claude/commands/ui-workflow.md`) provides a specialized agent for the UI workflow.

**Automatic behaviors:**
- Starts appropriate services based on project type
- Generates components from designs
- Manages Storybook/Expo projects
- Exports code to production

**Example:**
```
User: "/ui-workflow"
Supervisor: "What type of UI are we building today?"
User: "Mobile app login screen"
Supervisor: [Starts Penpot, guides through workflow]
```

---

## Tech Stack

### Penpot
- **Frontend:** ClojureScript + React
- **Backend:** Clojure
- **Database:** PostgreSQL 15
- **Cache:** Valkey 8.1
- **Assets:** Local filesystem
- **Email:** Mailcatcher (dev mode)

### Storybook
- **Framework:** React 18
- **Bundler:** Vite 6
- **Language:** TypeScript 5.7
- **Stories:** CSF 3.0 format

### Expo Snack
- **Framework:** React Native 0.76
- **Runtime:** Expo 52
- **Platform:** Web-based (snack.expo.dev)

---

## Maintenance

### Updating Services

**Penpot:**
```bash
./penpot.sh update
```
Pulls latest Docker images and restarts.

**Storybook:**
```bash
cd storybook-templates/react-vite
npm update
```

**Expo Snack:**
No updates needed (cloud service).

### Backup & Restore

**Penpot Data:**
```bash
# Backup
docker run --rm -v penpot_postgres_v15:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/penpot-db-backup.tar.gz /data

# Restore
docker run --rm -v penpot_postgres_v15:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/penpot-db-backup.tar.gz -C /
```

**Storybook Projects:**
```bash
# Backup
tar czf storybook-projects-backup.tar.gz \
  /home/samuel/supervisor/.ui-services/storybook-templates/

# Restore
tar xzf storybook-projects-backup.tar.gz -C /
```

---

## Resources

### Official Documentation

- **Penpot:** https://help.penpot.app/
- **Storybook:** https://storybook.js.org/docs
- **Expo Snack:** https://docs.expo.dev/workflow/snack/

### Related Supervisor Docs

- `docs/supervisor-learnings/` - Collective knowledge base
- `docs/bmad-workflow.md` - BMAD methodology
- `.claude/commands/ui-workflow.md` - UI Workflow agent role

### Source Code

- Penpot: https://github.com/penpot/penpot
- Storybook: https://github.com/storybookjs/storybook
- Expo Snack: https://github.com/expo/snack

---

## Support

**Questions or Issues?**
- Check this documentation first
- Review troubleshooting section
- Ask Supervisor via `/ui-workflow` command
- Check service logs

**Feature Requests?**
- Discuss with Supervisor
- Update `.claude/commands/ui-workflow.md` for new patterns
- Document learnings in `docs/supervisor-learnings/`

---

**System Status:** Production Ready ✅
**Last Updated:** 2026-01-17
**Maintained By:** Supervisor System
