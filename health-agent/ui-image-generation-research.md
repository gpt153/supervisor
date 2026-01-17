# UI Image Generation for Claude Code Supervisors - Research Summary

**Date:** 2026-01-16
**Purpose:** Enable supervisors to generate UI design examples during planning discussions

---

## Executive Summary

After comprehensive research, there are **three primary approaches** to enabling image generation for Claude Code supervisors:

1. **MCP Server Integration** (Easiest) - Use existing MCP servers with cloud APIs
2. **Local ComfyUI + MCP** (Most powerful) - Run local Stable Diffusion via MCP
3. **Web-based Screenshot-to-Code** (Alternative) - Convert designs to code instead

**Recommended Solution:** Start with MCP Server Integration (#1) for immediate functionality, then optionally add Local ComfyUI (#2) for advanced users who need offline capabilities and custom workflows.

---

## Top 3 Recommended Solutions

### 1. MCP Image Generation Servers (RECOMMENDED FOR MOST USERS)

**What it is:** Pre-built MCP servers that connect Claude to cloud-based image generation APIs

**Integration Complexity:** ✅ **EASY**

**Pros:**
- No local GPU required
- Works immediately with Claude Desktop
- Multiple provider options (OpenAI, Replicate, Together AI, Google Imagen)
- Already compatible with MCP ecosystem
- Simple configuration via JSON file
- Can be used in Claude Code via MCP integration

**Cons:**
- Requires API keys and costs money per image
- Internet connection required
- Less control over generation parameters
- Not fully open source (relies on commercial APIs)

**Available Implementations:**
- **mcp-image-gen** ([sarthakkimtani](https://github.com/sarthakkimtani/mcp-image-gen)) - Supports OpenAI DALL-E and Google Imagen
- **Image MCP Server** ([iplanwebsites](https://mcpservers.org/servers/iplanwebsites/image-mcp)) - Uses ai-image npm module with OpenAI/Replicate
- **Image Generation MCP** ([lansespirit](https://github.com/lansespirit/image-gen-mcp)) - Supports GPT-Image-1, DALL-E-3, DALL-E-2, Imagen-4
- **Replicate Flux MCP** ([GongRzhe](https://mcpservers.org/servers/GongRzhe/Image-Generation-MCP-Server)) - Uses Replicate's Flux model

**Hardware Requirements:**
- None (cloud-based)
- Internet connection only

**Setup Steps:**
```bash
# 1. Install MCP server
npm install -g mcp-image-gen

# 2. Configure Claude Desktop
# Edit: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
# Or: %APPDATA%/Claude/claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "image-gen": {
      "command": "mcp-image-gen",
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}

# 3. Restart Claude Desktop
```

**Usage Workflow:**
```
User: "Generate a UI mockup for a dashboard with sidebar navigation"
Supervisor: [Uses MCP image generation tool]
→ Image appears in conversation
→ Continues discussion with visual reference
```

**Cost Estimate:**
- OpenAI DALL-E 3: ~$0.04-0.08 per image
- Replicate (various models): ~$0.001-0.02 per image
- Google Imagen: ~$0.02-0.04 per image

---

### 2. Local ComfyUI + MCP Server Integration

**What it is:** Run Stable Diffusion locally via ComfyUI, exposed to Claude through MCP server

**Integration Complexity:** ⚠️ **MEDIUM**

**Pros:**
- Fully open source and free to use
- Works offline once set up
- Complete control over models and parameters
- No per-image costs
- Best quality with SDXL/Flux models
- Can use specialized UI/wireframe models
- Privacy - no data sent to third parties

**Cons:**
- Requires powerful GPU (8-24GB VRAM recommended)
- Complex initial setup
- Large model downloads (5-15GB each)
- Need to manage model updates
- Higher technical barrier

**Available MCP Implementations:**
- **comfyui-mcp** ([alecc08](https://github.com/alecc08/comfyui-mcp)) - Simple text-to-image, img2img, resize
- **comfy-ui-mcp-server** ([jonpojonpo](https://github.com/jonpojonpo/comfy-ui-mcp-server)) - Full API control
- **mcp-comfyui** ([samuraibuddha](https://lobehub.com/mcp/samuraibuddha-mcp-comfyui)) - Enhanced edition with full control
- **claude-comfyui-mcp** ([nikolaibibo](https://lobehub.com/mcp/nikolaibibo-claude-comfyui-mcp)) - Local installation integration

**Hardware Requirements:**

| Component | Minimum | Recommended | Ideal |
|-----------|---------|-------------|-------|
| GPU VRAM | 8GB | 12GB | 16-24GB |
| System RAM | 16GB | 32GB | 64GB |
| Storage | 50GB | 100GB | 200GB+ |
| GPU Type | NVIDIA GTX 1660 | RTX 3060/4060 | RTX 4080/4090 |

**Supported Models:**
- **Stable Diffusion XL (SDXL)** - Best quality, requires 8-12GB VRAM
- **Flux.1 [schnell]** - Apache 2.0 licensed, very fast, requires 12GB+ VRAM
- **Flux.2 [dev]** - 32B parameters, best quality, requires 16-24GB VRAM
- **SD 1.5/2.1** - Lower quality but runs on 4-6GB VRAM

**Setup Steps:**

```bash
# 1. Install ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Download models (example: SDXL)
cd models/checkpoints
wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# 3. Start ComfyUI
cd ../..
python main.py
# Server starts at http://127.0.0.1:8188

# 4. Install MCP server
npm install -g comfyui-mcp

# 5. Configure Claude Desktop MCP
# Edit config file with ComfyUI connection details
{
  "mcpServers": {
    "comfyui": {
      "command": "comfyui-mcp",
      "env": {
        "COMFYUI_URL": "http://127.0.0.1:8188",
        "COMFYUI_CONFIG": "/path/to/comfyui/config.json"
      }
    }
  }
}

# 6. Restart Claude Desktop
```

**Alternative Easy Installation (Fooocus):**

For users who want simplicity over control:

```bash
# Windows one-click install
# Download from: https://github.com/lllyasviel/Fooocus
# Extract and run: run.bat

# Requirements: 4GB VRAM minimum, 8GB recommended
# Produces high-quality images with minimal configuration
```

**Usage Workflow:**
```
User: "Show me a dashboard design with dark mode"
Supervisor: [Calls ComfyUI via MCP]
→ ComfyUI generates image locally
→ Image returned to Claude
→ Displayed in conversation
→ Can iterate: "Make it more minimalist"
```

**Performance:**
- SDXL on RTX 3060 (12GB): ~20 seconds per 1024x1024 image
- SDXL on RTX 4090 (24GB): ~5-8 seconds per image
- Flux.2 on RTX 4090: ~10-15 seconds per image

---

### 3. Web-based Wireframe Tools (Alternative Approach)

**What it is:** Instead of generating images from text, use existing web-based wireframe tools or convert screenshots to code

**Integration Complexity:** ⚠️ **MEDIUM** (requires browser automation or API)

**Pros:**
- No AI model needed
- Fast and deterministic
- Produces actual code, not just images
- Many free options available
- Can be automated via browser tools

**Cons:**
- Less flexible than AI generation
- Still requires some manual design work
- May need screenshot → code conversion
- Limited to predefined styles

**Recommended Tools:**

**Web-Based Wireframe Generators (No Installation):**
- **Wireframe.cc** - Simple, fast, browser-based
- **Moqups** - Drag-and-drop with pre-built components
- **MockFlow** - AI-powered wireframe generation from text
- **Visily** - AI wireframes from text descriptions
- **UX Pilot** - Free AI wireframe generator

**Screenshot-to-Code Converters:**
- **UI2Code.ai** - Free, supports HTML/CSS/Flutter/Swift
- **Screenshot to Code** (screenshottocode.net) - Uses Gemini Vision AI
- **Fronty** - Image to HTML/CSS in minutes
- **UX Pilot** - Screenshot to production HTML
- **Windframe** - Design to Tailwind CSS code

**Integration Methods:**

**Option A: Playwright Browser Automation**
```python
# Use existing Playwright MCP in Claude Code
# 1. Navigate to wireframe tool
# 2. Generate wireframe via UI
# 3. Take screenshot
# 4. Return to conversation
```

**Option B: Screenshot-to-Code API**
```python
# 1. User provides design description
# 2. Claude generates basic wireframe via text
# 3. User approves
# 4. Supervisor uses screenshot-to-code API
# 5. Returns actual HTML/CSS code
```

**Setup Steps:**
```bash
# Already available in Claude Code via Playwright MCP
# No additional setup needed

# Usage:
# 1. Open browser via Playwright
# 2. Navigate to wireframe.cc or similar
# 3. Create wireframe programmatically
# 4. Screenshot and return
```

**Usage Workflow:**
```
User: "Show me what a settings page might look like"
Supervisor: [Opens Wireframe.cc via Playwright]
→ Creates wireframe programmatically
→ Takes screenshot
→ Returns image
→ Or converts to code via screenshot-to-code
→ Returns both image and code
```

---

## Comparison Matrix

| Solution | Setup Time | Ongoing Cost | Quality | Control | Offline | GPU Needed |
|----------|------------|--------------|---------|---------|---------|------------|
| **MCP + Cloud API** | 10 min | $0.02-0.08/img | High | Medium | No | No |
| **ComfyUI + MCP** | 2-4 hours | $0 | Very High | Full | Yes | Yes (8-24GB) |
| **Fooocus + MCP** | 30 min | $0 | High | Low | Yes | Yes (4-8GB) |
| **Web Wireframes** | 0 min | $0 | Medium | Low | Partial | No |
| **Screenshot-to-Code** | 15 min | $0-0.02/img | Medium | Low | No | No |

---

## Implementation Recommendations

### For Most Users: Start with Option 1 (MCP + Cloud API)

**Why:**
- Fastest to set up (10 minutes)
- Works on any hardware
- Good enough quality for planning discussions
- Can always upgrade later

**Recommended Provider:**
- **Replicate Flux** - Best balance of cost ($0.001-0.01) and quality
- Fallback: **OpenAI DALL-E 3** - More expensive but very reliable

**Next Steps:**
```bash
1. Install mcp-image-gen
2. Get Replicate API key (https://replicate.com)
3. Configure Claude Desktop MCP
4. Test with: "Generate a simple login page mockup"
5. Iterate and refine prompts
```

---

### For Advanced Users with GPU: Add Option 2 (ComfyUI)

**When to choose this:**
- You have NVIDIA GPU with 8GB+ VRAM
- You want maximum control and quality
- You need offline capabilities
- You'll generate many images (cost savings)
- You want to use specialized models

**Recommended Path:**
```bash
1. Start with Fooocus (easiest)
   - Download and run
   - Test basic generation
   - Verify GPU works

2. If satisfied, upgrade to ComfyUI
   - More control
   - Better workflows
   - Custom nodes

3. Install ComfyUI MCP server
   - Connect to Claude Desktop
   - Test integration

4. Download specialized models
   - UI/wireframe models
   - Design-focused checkpoints
```

**Recommended Models for UI Design:**
- **SDXL Base 1.0** - General purpose, good quality
- **Flux.1 Schnell** - Fast, Apache 2.0 licensed
- **RealVisXL** - Photorealistic UI mockups
- **DreamShaper XL** - Clean, modern designs

---

### For Screenshot-to-Code Workflows: Option 3

**When to choose this:**
- You want actual code, not just images
- You have existing designs/wireframes
- You prefer deterministic outputs
- You want to integrate with Playwright tools already in Claude Code

**Workflow:**
```
1. User describes UI
2. Claude creates text-based wireframe description
3. Claude uses Playwright to:
   - Open wireframe.cc
   - Generate visual wireframe
   - Screenshot result
4. Optionally: Pass screenshot to screenshot-to-code API
5. Return both image and code
```

---

## Detailed Setup Guide: Option 1 (Recommended)

### MCP Image Generation with Replicate

**Step 1: Get API Key**
```bash
# 1. Go to https://replicate.com
# 2. Sign up (free tier available)
# 3. Navigate to Account → API Tokens
# 4. Create new token
# 5. Copy token
```

**Step 2: Install MCP Server**
```bash
# Option A: Using npm
npm install -g mcp-image-gen

# Option B: Using specific implementation
git clone https://github.com/sarthakkimtani/mcp-image-gen.git
cd mcp-image-gen
npm install
npm link
```

**Step 3: Configure Claude Desktop**

**MacOS:**
```bash
# Edit config file
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Add this configuration:
{
  "mcpServers": {
    "image-generation": {
      "command": "node",
      "args": ["/path/to/mcp-image-gen/index.js"],
      "env": {
        "REPLICATE_API_KEY": "r8_your_api_key_here"
      }
    }
  }
}
```

**Windows:**
```bash
# Edit config file
notepad %APPDATA%\Claude\claude_desktop_config.json

# Add same configuration as above
```

**Step 4: Restart Claude Desktop**
```bash
# Quit Claude Desktop completely
# Restart application
# MCP server should connect automatically
```

**Step 5: Test Integration**
```
In Claude Desktop:
"Generate an image of a modern dashboard UI with sidebar navigation"

Expected behavior:
→ Claude calls MCP image generation tool
→ Image appears in conversation
→ Can iterate: "Make it darker" or "Add a header"
```

**Step 6: Integration with Claude Code Supervisors**

The supervisor would need to:
```markdown
1. Have access to MCP tools in its environment
2. Call image generation when discussing UI
3. Reference generated images in planning docs
4. Save images to project assets folder

Example supervisor prompt:
"When discussing UI design:
1. Ask user for design requirements
2. Generate mockup via MCP image tool
3. Save to /supervisor/[project]/assets/mockups/
4. Include in planning documentation
5. Iterate based on feedback"
```

---

## Detailed Setup Guide: Option 2 (Advanced)

### Local ComfyUI with MCP Integration

**Step 1: Install ComfyUI**

**Requirements Check:**
```bash
# Check NVIDIA GPU
nvidia-smi

# Should show:
# - GPU name
# - VRAM amount (need 8GB minimum)
# - Driver version (need 520+ for SDXL)

# Check Python
python --version  # Need 3.10 or 3.11
```

**Installation:**
```bash
# Clone repository
cd ~
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# For AMD GPU (optional)
pip install -r requirements_amd.txt

# For Apple Silicon (optional)
pip install -r requirements_macos.txt
```

**Step 2: Download Models**

**SDXL Base Model:**
```bash
cd models/checkpoints

# Option A: Direct download (Linux/Mac)
wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# Option B: Using Hugging Face CLI
pip install huggingface-hub
huggingface-cli download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors --local-dir .

# Option C: Manual download
# Go to: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
# Download sd_xl_base_1.0.safetensors
# Place in ComfyUI/models/checkpoints/
```

**Flux Model (Optional):**
```bash
# Flux.1 Schnell (Apache 2.0, free to use)
cd models/checkpoints
wget https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors
```

**Step 3: Start ComfyUI**
```bash
cd ~/ComfyUI
source venv/bin/activate  # if not already active
python main.py

# Should see:
# Starting server on http://127.0.0.1:8188
```

**Step 4: Test ComfyUI Web Interface**
```bash
# Open browser
# Navigate to: http://127.0.0.1:8188

# You should see:
# - Node-based workflow interface
# - Default text-to-image workflow
# - Queue button

# Try generating an image:
# 1. Enter prompt
# 2. Click "Queue Prompt"
# 3. Wait for generation
# 4. Image appears in output
```

**Step 5: Install ComfyUI MCP Server**

**Option A: alecc08/comfyui-mcp (Recommended for simplicity)**
```bash
# Clone MCP server
cd ~
git clone https://github.com/alecc08/comfyui-mcp.git
cd comfyui-mcp

# Install dependencies
npm install

# Create config file
cat > config.json << EOF
{
  "comfyui_url": "http://127.0.0.1:8188",
  "workflows_dir": "./workflows"
}
EOF

# Link globally
npm link
```

**Option B: jonpojonpo/comfy-ui-mcp-server (More features)**
```bash
cd ~
git clone https://github.com/jonpojonpo/comfy-ui-mcp-server.git
cd comfy-ui-mcp-server
npm install
npm link
```

**Step 6: Configure Claude Desktop**

```bash
# Edit config (MacOS)
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Edit config (Windows)
notepad %APPDATA%\Claude\claude_desktop_config.json

# Add configuration:
{
  "mcpServers": {
    "comfyui": {
      "command": "node",
      "args": ["/home/samuel/comfyui-mcp/index.js"],
      "env": {
        "COMFYUI_URL": "http://127.0.0.1:8188",
        "COMFYUI_CONFIG": "/home/samuel/comfyui-mcp/config.json"
      }
    }
  }
}
```

**Step 7: Create Basic Workflow**

ComfyUI uses JSON workflow files. Create a simple text-to-image workflow:

```bash
cd ~/comfyui-mcp/workflows
nano text-to-image.json
```

Paste this basic workflow:
```json
{
  "1": {
    "class_type": "CheckpointLoaderSimple",
    "inputs": {
      "ckpt_name": "sd_xl_base_1.0.safetensors"
    }
  },
  "2": {
    "class_type": "CLIPTextEncode",
    "inputs": {
      "text": "PROMPT_PLACEHOLDER",
      "clip": ["1", 1]
    }
  },
  "3": {
    "class_type": "CLIPTextEncode",
    "inputs": {
      "text": "bad quality, blurry, low resolution",
      "clip": ["1", 1]
    }
  },
  "4": {
    "class_type": "KSampler",
    "inputs": {
      "seed": 42,
      "steps": 20,
      "cfg": 7.0,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1.0,
      "model": ["1", 0],
      "positive": ["2", 0],
      "negative": ["3", 0],
      "latent_image": ["5", 0]
    }
  },
  "5": {
    "class_type": "EmptyLatentImage",
    "inputs": {
      "width": 1024,
      "height": 1024,
      "batch_size": 1
    }
  },
  "6": {
    "class_type": "VAEDecode",
    "inputs": {
      "samples": ["4", 0],
      "vae": ["1", 2]
    }
  },
  "7": {
    "class_type": "SaveImage",
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": ["6", 0]
    }
  }
}
```

**Step 8: Test Integration**

```bash
# 1. Ensure ComfyUI is running
cd ~/ComfyUI
python main.py

# 2. In another terminal, restart Claude Desktop

# 3. In Claude Desktop, try:
"Generate a UI mockup of a dashboard with ComfyUI"

# Expected:
# → MCP calls ComfyUI
# → ComfyUI generates image
# → Image returned to Claude
# → Displayed in conversation
```

**Step 9: Optimization**

**A. Model Management**
```bash
# Create symbolic links for easier model switching
cd ~/ComfyUI/models/checkpoints
ln -s sd_xl_base_1.0.safetensors default_sdxl.safetensors
```

**B. Performance Settings**
```bash
# Edit ComfyUI launch for better performance
nano ~/ComfyUI/launch.sh

# Add these flags:
python main.py --preview-method auto --use-split-cross-attention

# For low VRAM (8GB):
python main.py --lowvram --preview-method auto

# For very low VRAM (6GB):
python main.py --novram --preview-method auto
```

**C. Custom Nodes for UI Design**
```bash
cd ~/ComfyUI/custom_nodes

# Install ComfyUI Manager (helps install other nodes)
git clone https://github.com/ltdrdata/ComfyUI-Manager.git

# Restart ComfyUI
# Access via http://127.0.0.1:8188
# Use Manager UI to install:
# - ControlNet nodes (for layout control)
# - IP-Adapter nodes (for style reference)
# - Ultimate SD Upscale (for high-res outputs)
```

---

## Alternative: Fooocus Setup (Easiest Local Option)

**Why Fooocus:**
- One-click install on Windows
- Automatic prompt enhancement
- Works with 4GB VRAM
- Produces high-quality images
- Much simpler than ComfyUI

**Setup:**

**Windows:**
```bash
# 1. Download from GitHub
# https://github.com/lllyasviel/Fooocus/releases

# 2. Extract to folder
C:\Fooocus\

# 3. Run
run.bat

# 4. Wait for model downloads (first run only)
# ~5GB download

# 5. Interface opens at http://127.0.0.1:7860
```

**Linux/Mac:**
```bash
git clone https://github.com/lllyasviel/Fooocus.git
cd Fooocus
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python entry_with_update.py

# Opens at http://127.0.0.1:7860
```

**MCP Integration:**

Fooocus doesn't have native MCP server, but can use API:

```bash
# Run Fooocus with API enabled
python entry_with_update.py --listen 0.0.0.0 --port 7860

# Create simple MCP wrapper
# (Would need custom development)
```

---

## Usage Examples for Supervisors

### Example 1: Dashboard Design Discussion

```markdown
User: "I need a dashboard for the health tracking app"

Supervisor: "Let me generate some mockup options for you."

[Calls MCP image generation]
Prompt: "Modern health tracking dashboard UI, clean design,
sidebar navigation, main content area with charts and metrics,
blue and white color scheme, minimalist style"

[Image generated and displayed]

Supervisor: "Here's option 1 - a clean, minimal dashboard.
Key features:
- Left sidebar for navigation
- Main area for health metrics
- Chart visualizations
- Clean white background with blue accents

Would you like me to:
1. Generate variations (dark mode, different layout)
2. Focus on specific sections (charts, navigation)
3. Proceed with this design?"

User: "Show me a dark mode version"

[Calls MCP image generation]
Prompt: "Modern health tracking dashboard UI, dark mode,
dark gray background, neon blue accents, sidebar navigation,
health metrics and charts, cyberpunk aesthetic"

[Dark mode image generated]

Supervisor: "Here's the dark mode version. Let me save both to
the project assets and document in the PRD."

[Saves images to /supervisor/health-agent/assets/mockups/]
- dashboard-light.png
- dashboard-dark.png

[Updates PRD with image references]
```

### Example 2: Iterative Design Refinement

```markdown
User: "The settings page needs work"

Supervisor: "Let me create a settings page mockup."

[Generates initial version]

User: "Too cluttered, make it simpler"

Supervisor: [Modifies prompt]
Prompt: "Minimal settings page UI, lots of white space,
grouped sections with clear headers, toggle switches,
simple and clean"

[Generates refined version]

User: "Perfect, but show the mobile version too"

Supervisor: [New generation]
Prompt: "Mobile settings page UI, vertical layout,
large touch targets, grouped sections, iOS style,
minimal and clean, portrait orientation"

[Generates mobile mockup]

Supervisor: "I'll add both desktop and mobile versions
to the feature spec and create corresponding stories."
```

### Example 3: Multiple Concept Exploration

```markdown
User: "Show me 3 different login page concepts"

Supervisor: "I'll generate three distinct approaches."

[Generates concept 1]
Prompt: "Minimalist login page, centered form,
company logo, email and password fields,
white background, blue CTA button"

[Generates concept 2]
Prompt: "Login page with split screen, left side
image/illustration, right side login form,
modern gradient background"

[Generates concept 3]
Prompt: "Full-screen background image login,
frosted glass login card overlay, soft blur effect,
elegant and modern"

Supervisor: "Here are three concepts:

1. **Minimalist** - Clean, focused, fast to implement
2. **Split Screen** - Visual appeal, brand opportunity
3. **Full Background** - Premium feel, high impact

Which direction resonates with your brand?"
```

---

## Cost Analysis

### Option 1: MCP + Cloud APIs

**Monthly Cost Estimates:**

| Usage Level | Images/Month | Cost @ Replicate Flux | Cost @ DALL-E 3 |
|-------------|--------------|----------------------|-----------------|
| Light | 50 | $0.50 | $2-4 |
| Medium | 200 | $2 | $8-16 |
| Heavy | 500 | $5 | $20-40 |
| Very Heavy | 1000 | $10 | $40-80 |

**Recommendation:** Replicate Flux for best price/quality ratio

### Option 2: Local ComfyUI

**One-time Hardware Cost:**

| Setup | GPU | Approx. Cost | Monthly Operating |
|-------|-----|--------------|-------------------|
| Budget | RTX 3060 12GB | $300-400 | $5-10 electricity |
| Recommended | RTX 4060 Ti 16GB | $500-600 | $5-10 electricity |
| Pro | RTX 4080 16GB | $1000-1200 | $10-15 electricity |
| Enthusiast | RTX 4090 24GB | $1600-2000 | $15-20 electricity |

**Break-even Analysis:**
- If generating 200+ images/month: Local setup pays for itself in 6-12 months
- If generating 500+ images/month: Pays for itself in 3-6 months

### Option 3: Web Tools

**Cost:** $0 for most wireframe tools (free tiers sufficient)

**Screenshot-to-Code APIs:**
- Most free for limited usage
- Premium: $10-20/month for unlimited

---

## Performance Benchmarks

### Image Generation Speed

| Solution | Hardware | Time per Image | Batch (4 images) |
|----------|----------|----------------|------------------|
| Replicate Flux | Cloud | 5-10s | 20-40s (parallel) |
| DALL-E 3 | Cloud | 10-20s | 40-80s (sequential) |
| ComfyUI SDXL | RTX 3060 12GB | 20s | 80s |
| ComfyUI SDXL | RTX 4080 16GB | 8s | 32s |
| ComfyUI Flux.2 | RTX 4090 24GB | 12s | 48s |
| Fooocus SDXL | RTX 3060 12GB | 25s | 100s |

### Model Download Sizes

| Model | Size | Download Time (100Mbps) |
|-------|------|-------------------------|
| SDXL Base | 6.9GB | ~10 minutes |
| SDXL Refiner | 6.1GB | ~9 minutes |
| Flux.1 Schnell | 23.5GB | ~32 minutes |
| Flux.2 Dev | 32GB | ~43 minutes |
| SD 1.5 | 4GB | ~6 minutes |

---

## Integration Architecture

### High-Level Flow

```
User Request
    ↓
Supervisor (Claude Code)
    ↓
[Decision: Which image tool?]
    ↓
    ├─→ MCP Image Server → Cloud API → Generated Image
    ├─→ MCP ComfyUI → Local ComfyUI → Generated Image
    └─→ Playwright → Web Tool → Screenshot → Image
    ↓
Image saved to /supervisor/[project]/assets/mockups/
    ↓
Reference added to planning docs
    ↓
Continue discussion with user
```

### Supervisor Prompt Extension

Add to supervisor's system prompt:

```markdown
## UI Design Generation Capabilities

You have access to image generation tools for creating UI mockups.

**When to use:**
- User asks to see UI design
- Planning visual features
- Comparing design alternatives
- Creating mockups for PRDs

**How to use:**
1. Understand user's requirements
2. Craft detailed prompt:
   - UI type (dashboard, form, etc.)
   - Style (minimal, modern, etc.)
   - Colors and branding
   - Key elements
   - Platform (web, mobile, desktop)
3. Generate image via MCP tool
4. Save to /supervisor/[project]/assets/mockups/[descriptive-name].png
5. Reference in planning docs
6. Iterate based on feedback

**Prompt templates:**

**Dashboard:**
"Modern [domain] dashboard UI, [layout], [color scheme],
[specific elements like charts/tables], [style],
professional and clean"

**Form/Input:**
"[Form type] page UI, [layout], [fields needed],
[style], clear labels, good UX, [platform]"

**Mobile:**
"Mobile app screen for [feature], [platform iOS/Android],
[layout], [key elements], [style], optimized for touch"

**Dark Mode:**
"Dark mode [UI type], dark background, [accent colors],
high contrast, modern, [other details]"

**Always:**
- Save generated images to project assets
- Document in planning artifacts
- Provide design rationale
- Offer alternatives if needed
```

---

## Specialized Models for UI Design

### Recommended Model Downloads

For ComfyUI users who want UI-optimized models:

**1. RealVisXL**
```bash
# Photorealistic UI mockups
cd ~/ComfyUI/models/checkpoints
wget https://civitai.com/api/download/models/139562
mv 139562 RealVisXL.safetensors
```

**2. DreamShaper XL**
```bash
# Clean, modern UI designs
wget https://civitai.com/api/download/models/251662
mv 251662 DreamShaperXL.safetensors
```

**3. Juggernaut XL**
```bash
# High detail, professional results
wget https://civitai.com/api/download/models/288982
mv 288982 JuggernautXL.safetensors
```

### LoRA Models for UI Enhancement

```bash
cd ~/ComfyUI/models/loras

# Flat UI Design LoRA
wget [LoRA URL from civitai.com]

# Mobile UI LoRA
wget [LoRA URL]

# Usage in ComfyUI:
# Add LoRA Loader node
# Connect to model chain
# Set strength 0.5-0.8
```

---

## Troubleshooting

### Common Issues - MCP Integration

**Issue:** MCP server not connecting to Claude Desktop

```bash
# Check config syntax
# Valid JSON only, no trailing commas
# Use JSON validator: https://jsonlint.com

# Check paths are absolute
# MacOS: /Users/username/...
# Windows: C:\Users\username\...

# Check environment variables are set
# OPENAI_API_KEY, REPLICATE_API_KEY, etc.

# Restart Claude Desktop completely
# Quit from menu, not just close window

# Check logs (MacOS)
tail -f ~/Library/Logs/Claude/mcp*.log

# Check logs (Windows)
type %APPDATA%\Claude\Logs\mcp*.log
```

**Issue:** API rate limits

```bash
# Replicate: 50 requests/minute free tier
# DALL-E 3: 5-50/min depending on tier

# Solution: Add rate limiting to MCP server
# Or upgrade API tier
# Or switch to local generation
```

### Common Issues - ComfyUI

**Issue:** Out of VRAM

```bash
# Solution 1: Use --lowvram flag
python main.py --lowvram

# Solution 2: Use --novram flag (slower)
python main.py --novram

# Solution 3: Reduce image size
# 1024x1024 → 768x768 (SDXL)

# Solution 4: Use SD 1.5 instead of SDXL
# Requires only 4-6GB VRAM
```

**Issue:** Slow generation

```bash
# Check: Is CUDA being used?
python -c "import torch; print(torch.cuda.is_available())"
# Should print: True

# Check: GPU utilization
nvidia-smi

# Should show:
# - GPU usage near 100%
# - VRAM usage high

# If not:
# - Update NVIDIA drivers
# - Reinstall PyTorch with CUDA:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

**Issue:** Model not found

```bash
# Check model path
ls ~/ComfyUI/models/checkpoints/

# Ensure .safetensors or .ckpt file exists

# Check ComfyUI console for exact error
# Usually shows expected filename

# Rename model if needed
mv downloaded_model.safetensors sd_xl_base_1.0.safetensors
```

**Issue:** Black images generated

```bash
# Cause: Negative prompt too strong
# Or CFG scale too high

# Solution:
# - Reduce CFG from 7.0 to 5.0
# - Simplify negative prompt
# - Check model is compatible with SDXL workflows
```

### Common Issues - Fooocus

**Issue:** Installation fails on Linux

```bash
# Ensure dependencies installed
sudo apt update
sudo apt install python3.10 python3-pip python3-venv
sudo apt install libgl1 libglib2.0-0

# Create fresh venv
cd Fooocus
rm -rf venv
python3.10 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Issue:** Can't access from Claude Code

```bash
# Fooocus doesn't have official MCP server yet
# Options:
# 1. Use ComfyUI instead (has MCP support)
# 2. Write custom MCP wrapper for Fooocus API
# 3. Use screenshot automation via Playwright
```

---

## Security Considerations

### API Keys

```bash
# NEVER commit API keys to git
# Add to .gitignore:
.env
*_api_key.txt
claude_desktop_config.json

# Use environment variables
export OPENAI_API_KEY="sk-..."
export REPLICATE_API_KEY="r8_..."

# Or use .env file
# .env:
OPENAI_API_KEY=sk-...
REPLICATE_API_KEY=r8_...

# Load in MCP config:
{
  "mcpServers": {
    "image-gen": {
      "command": "node",
      "args": ["./mcp-image-gen/index.js"],
      "envFile": "/path/to/.env"
    }
  }
}
```

### Local Model Safety

```bash
# Only download models from trusted sources:
# - Hugging Face official repos
# - CivitAI (verified creators)
# - StabilityAI GitHub

# Avoid random checkpoint files
# Can contain malicious code

# Scan models before use
# Use checkpoint pickle scanner:
pip install picklescan
picklescan model.safetensors

# .safetensors format is safer than .ckpt
# Prefer .safetensors when available
```

### Network Exposure

```bash
# ComfyUI default: localhost only (safe)
python main.py  # Only accessible at 127.0.0.1

# If exposing to network:
python main.py --listen 0.0.0.0 --port 8188

# Add authentication:
# Use reverse proxy with basic auth
# Or VPN access only
# Or firewall rules
```

---

## Future Enhancements

### Potential Improvements

**1. Multi-model comparison**
```markdown
Generate same prompt with:
- SDXL
- Flux
- Midjourney (via API)

Show all 3 to user
Let them choose preferred style
```

**2. Style library**
```markdown
Save successful prompts as templates:
- /supervisor/shared/ui-styles/minimal-dashboard.txt
- /supervisor/shared/ui-styles/mobile-form.txt

Reuse across projects
Build design system over time
```

**3. Design-to-code workflow**
```markdown
1. Generate UI mockup
2. Auto-convert to HTML/CSS via screenshot-to-code
3. Return both image and starter code
4. Developer has immediate starting point
```

**4. Iterative refinement**
```markdown
Save generation history
Enable:
"Go back to version 2"
"Combine elements from versions 1 and 3"
"Make it more like version 4"
```

**5. Component library**
```markdown
Generate individual components:
- Button styles
- Form inputs
- Navigation patterns
- Card layouts

Build library over time
Assemble into full designs
```

---

## Conclusion

### Quick Decision Guide

**Choose MCP + Cloud API if:**
- You want to start immediately
- You don't have powerful GPU
- You generate <200 images/month
- You're okay with per-image costs
- You need it working today

**Choose ComfyUI + MCP if:**
- You have NVIDIA GPU (8GB+ VRAM)
- You generate 200+ images/month
- You want maximum quality and control
- You need offline capability
- You're willing to invest setup time

**Choose Web Tools if:**
- You want deterministic wireframes
- You prefer code over images
- You don't need AI generation
- You have existing designs to convert
- You want zero infrastructure

### Recommended Path

**Phase 1: Quick Start (Week 1)**
```bash
1. Set up MCP + Replicate Flux
2. Test with supervisors
3. Generate 20-30 mockups
4. Evaluate usefulness
```

**Phase 2: Optimization (Week 2-3)**
```bash
If valuable:
  1. Refine prompts
  2. Create prompt templates
  3. Build style library
  4. Document best practices

If not valuable:
  1. Try web tools instead
  2. Or skip image generation
  3. Use text-based wireframes
```

**Phase 3: Scale (Month 2+)**
```bash
If heavily used (>200 images/month):
  1. Set up local ComfyUI
  2. Download optimized models
  3. Create custom workflows
  4. Build component library

If moderately used:
  1. Optimize cloud API usage
  2. Reduce costs via prompt engineering
  3. Cache common generations
```

### Final Recommendation

**Start here:**
1. Install mcp-image-gen
2. Get Replicate API key ($5 credit free)
3. Configure Claude Desktop
4. Test with: "Generate a login page mockup"
5. Iterate and evaluate

**Cost:** $0 initial, ~$0.01 per image
**Time:** 15 minutes setup
**Complexity:** Low

**This gets you 90% of the value with 10% of the complexity.**

Upgrade to local ComfyUI only if you find yourself generating hundreds of images and want more control.

---

## Resources

### Documentation Links

**MCP Servers:**
- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP Servers](https://mcpservers.org)

**Image Generation:**
- [Stable Diffusion Guide](https://stable-diffusion-art.com)
- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [Fooocus Guide](https://andreaskuhr.com/en/the-stable-diffusion-fooocus-guide-geting-started.html)

**APIs:**
- [Replicate](https://replicate.com)
- [OpenAI DALL-E](https://platform.openai.com/docs/guides/images)
- [Stability AI](https://platform.stability.ai)

**Tools:**
- [Hugging Face Models](https://huggingface.co/models?pipeline_tag=text-to-image)
- [CivitAI Models](https://civitai.com)

---

## Sources

**MCP Image Generation:**
- [Model Context Protocol Servers](https://github.com/modelcontextprotocol/servers)
- [mcp-image-gen](https://glama.ai/mcp/servers/@GMKR/mcp-imagegen)
- [Image MCP Server](https://mcpservers.org/servers/iplanwebsites/image-mcp)
- [mcp-image-gen by sarthakkimtani](https://github.com/sarthakkimtani/mcp-image-gen)
- [What Is mcp-image-gen?](https://skywork.ai/blog/mcp-image-gen-mcp-server-image-generation/)

**Stable Diffusion SDXL:**
- [Stable Diffusion XL API Guide](https://dev.to/kriegercisneros/stable-diffusion-xl-api-513g)
- [SDXL Beta Announcement](https://stability.ai/news/stable-diffusion-xl-beta-available-for-api-customers-and-dreamstudio-users)
- [SDXL Hugging Face Docs](https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/stable_diffusion_xl)
- [AUTOMATIC1111 API Wiki](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API)

**Open Source UI Tools:**
- [MyDraft Wireframing Tool](https://github.com/mydraft-cc/ui)
- [Penpot](https://penpot.app/)
- [Pencil Project](https://pencil.evolus.vn/)
- [10 Free Wireframing Tools](https://www.interaction-design.org/literature/article/10-free-to-use-wireframing-tools)

**Tool Comparisons:**
- [ComfyUI vs Automatic1111 vs InvokeAI](https://www.toolify.ai/ai-news/ultimate-speed-test-comfyui-vs-invoke-ai-vs-automatic1111-25987)
- [Complete 2026 Comparison](https://www.propelrc.com/comfyui-vs-automatic1111-vs-fooocus/)
- [Why Invoke AI vs ComfyUI](https://www.invoke.com/comparisons/comfyui-vs-invokeai)

**Screenshot to Code:**
- [UI to Code AI](https://ui2code.ai/)
- [Fronty](https://fronty.com/)
- [UX Pilot](https://uxpilot.ai/image-to-html-code-generator)
- [Screenshot to Code](https://screenshottocode.net/)

**Fooocus:**
- [Fooocus Getting Started Guide](https://andreaskuhr.com/en/the-stable-diffusion-fooocus-guide-geting-started.html)
- [Fooocus on Stable Diffusion Art](https://stable-diffusion-art.com/fooocus/)
- [System Requirements](https://deepwiki.com/lllyasviel/Fooocus/1.2-system-requirements)

**Hardware Requirements:**
- [Guide to GPU Requirements](https://www.bacloud.com/en/blog/163/guide-to-gpu-requirements-for-running-ai-models.html)
- [SDXL System Requirements](https://stablediffusionxl.com/sdxl-system-requirements/)
- [VRAM Requirements Discussion](https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/11713)

**ComfyUI API:**
- [ComfyUI API Key Integration](https://docs.comfy.org/development/comfyui-server/api-key-integration)
- [Convert ComfyUI to Python](https://modal.com/blog/comfyui-prototype-to-production)
- [ComfyUI Python API Guide](https://medium.com/@next.trail.tech/how-to-use-comfyui-api-with-python-a-complete-guide-f786da157d37)
- [comfy-cli](https://pypi.org/project/comfy-cli/)

**Flux Model:**
- [Best Open-Source Models 2026](https://www.bentoml.com/blog/a-guide-to-open-source-image-generation-models)
- [FLUX.1-dev on Hugging Face](https://huggingface.co/black-forest-labs/FLUX.1-dev)
- [FLUX.2-dev on Hugging Face](https://huggingface.co/black-forest-labs/FLUX.2-dev)
- [Flux Wikipedia](https://en.wikipedia.org/wiki/Flux_(text-to-image_model))

**Web Wireframe Tools:**
- [Moqups](https://moqups.com/)
- [MockFlow](https://mockflow.com/)
- [Wireframe.cc](https://wireframe.cc/)
- [Visily](https://www.visily.ai/)

**ComfyUI MCP Integration:**
- [ComfyUI MCP Servers](https://mcpservers.org/servers/jonpojonpo/comfy-ui-mcp-server)
- [comfyui-mcp by alecc08](https://github.com/alecc08/comfyui-mcp)
- [Getting Started with MCP](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
- [Ultimate Guide to Claude MCP](https://generect.com/blog/claude-mcp/)

---

**End of Research Summary**

*This document provides a comprehensive overview of solutions for enabling UI image generation in Claude Code supervisors. Start with the recommended MCP + Cloud API approach for immediate results, then scale to local generation as needed.*
