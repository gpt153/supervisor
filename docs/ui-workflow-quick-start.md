# UI Workflow - Quick Start Guide

**5-Minute Guide to Get Started**

---

## What You Get

Three tools for designing and building UIs:

1. **Penpot** - Design interactive prototypes (like Figma)
2. **Storybook** - Build web components interactively
3. **Expo Snack** - Test mobile components on your phone

All accessible via browser, no local setup needed.

---

## Quick Links

| Tool | URL | Use For |
|------|-----|---------|
| **Penpot** | https://penpot.153.se | Design mockups & prototypes |
| **Storybook** | https://storybook.153.se | Web component playground |
| **Expo Info** | https://expo.153.se | Mobile workflow info |

---

## 3-Step Workflow

### 1. Design in Penpot

- Visit https://penpot.153.se
- Create account (first time)
- Design your UI screens
- Link them together for clickable prototype

### 2. Code in Storybook (Web) or Expo (Mobile)

**For Web Apps:**
- Supervisor generates React components
- View at https://storybook.153.se
- Test interactions, give feedback

**For Mobile Apps:**
- Supervisor creates React Native component
- Upload to https://snack.expo.dev
- Scan QR code, test on phone

### 3. Export to Project

- Approve the design
- Supervisor moves code to your project
- Ready to connect to backend

---

## Starting Services

### Start Penpot

```bash
cd /home/samuel/supervisor/.ui-services/scripts
./penpot.sh start
```

Wait ~60 seconds, then visit https://penpot.153.se

### Start Storybook

```bash
cd /home/samuel/supervisor/.ui-services/scripts
./storybook.sh start
```

Wait ~15 seconds, then visit https://storybook.153.se

### Expo Info Page

```bash
cd /home/samuel/supervisor/.ui-services/scripts
./expo-web.sh start
```

Visit https://expo.153.se for mobile workflow info

---

## Stopping Services

```bash
cd /home/samuel/supervisor/.ui-services/scripts

# Stop Penpot
./penpot.sh stop

# Stop Storybook
./storybook.sh stop

# Stop Expo page
./expo-web.sh stop
```

---

## Using with Supervisor

Just say:

```
/ui-workflow
```

Supervisor will:
1. Ask what you're building
2. Start the right services
3. Guide you through the workflow
4. Generate code for you
5. Export when you're happy

---

## Example Session

```
You: "/ui-workflow"

Supervisor: "What type of UI are we building?"

You: "A dashboard for my web app"

Supervisor: "Starting Penpot... Visit https://penpot.153.se
             to create your design. Tell me when ready."

You: "Done designing"

Supervisor: "Great! I'll create Storybook components now..."
            [Generates code]
            "Check https://storybook.153.se"

You: "Looks good!"

Supervisor: "Exporting to your project..."
            [Exports code]
            "Done! Components are in src/components/"
```

---

## Common Commands

### Check What's Running

```bash
# Penpot
docker compose -f /home/samuel/supervisor/.ui-services/penpot/docker-compose.custom.yaml ps

# Storybook
./storybook.sh status

# Expo
./expo-web.sh status
```

### Create New Storybook Project

```bash
./storybook.sh new my-project-name
```

### Generate Expo Snack Component

```bash
./expo-snack.sh create LoginScreen
```

---

## Tips

1. **Penpot takes 1-2 minutes to start** (first time)
2. **Storybook auto-reloads** when you edit components
3. **Expo Snack** - Download "Expo Go" app for testing
4. **All services run on server** - Access via browser
5. **Behind Cloudflare Tunnel** - Secure HTTPS access

---

## Help

**Need detailed guide?**
Read: `/home/samuel/supervisor/docs/ui-workflow-system.md`

**Something not working?**
Check the troubleshooting section in the full guide.

**Want to learn more?**
Use `/ui-workflow` command and ask Supervisor.

---

**Ready to build!** 🎨
