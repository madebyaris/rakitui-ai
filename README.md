# Rakit UI AI - MCP Design Selection Tool

An intelligent UI component design selection tool built on the Model Context Protocol (MCP). Generate and compare UI designs using AI, or provide your own designs for selection.

## Features

- 🤖 **AI-Powered Generation** - Generate designs from natural language using MiniMax-M2.1
- 🎨 **Visual Comparison** - Side-by-side design comparison in a modern browser interface
- 📱 **Responsive Preview** - Mobile, desktop, and responsive view modes
- 🔍 **HTML Reference Analysis** - Automatically checks design completeness
- 🎯 **Purpose-Driven** - Specify what to include/exclude in designs
- ⚡ **Real-time Selection** - WebSocket support for instant feedback

## Quick Start

```bash
# Install globally
npm install -g rakitui-ai

# Set MiniMax API key (for AI generation)
export MINIMAX_API_KEY="your-api-key-here"

# Run the MCP server
rakitui-ai
```

## Setup

### Cursor IDE

1. Open Settings (`Cmd+,` or `Ctrl+,`)
2. Navigate to **MCP** settings
3. Add new server:
   - **Name:** `rakitui-ai`
   - **Command:** `rakitui-ai`
   - **Environment Variables:** `MINIMAX_API_KEY` (optional)

Or edit `settings.json`:

```json
{
  "mcpServers": {
    "rakitui-ai": {
      "command": "rakitui-ai",
      "env": {
        "MINIMAX_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

4. Restart Cursor

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rakitui-ai": {
      "command": "rakitui-ai"
    }
  }
}
```

## Usage

### AI-Powered Generation

Simply describe what you need:

```javascript
const result = await tool.execute({
  prompt: "Create 3 modern button designs for a SaaS dashboard",
  style_preference: "clean and professional",
  framework: "tailwind",
  component_type: "button",
  auto_search_reference: true,  // Get design references
  purpose_include: ["hover state", "focus state"],  // Must include
  purpose_exclude: ["animations"],  // Must avoid
  view_mode: "responsive"  // mobile | desktop | responsive
});
```

### Manual Design Input

Provide your own designs:

```javascript
const result = await tool.execute({
  design_name_1: "Modern Button",
  design_html_1: `<button class="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>`,
  design_name_2: "Classic Button",
  design_html_2: `<button class="btn btn-primary">Click me</button>`,
  design_name_3: "Minimal Button",
  design_html_3: `<button class="px-4 py-2 border rounded">Click me</button>`
});
```

### Response

```json
{
  "success": true,
  "selectedDesign": "Modern Button",
  "selectedDesignHtml": "<button>...</button>",
  "design_options": [...],
  "selection_context": {
    "purpose": {...},
    "references": [...],
    "view_mode": "responsive"
  }
}
```

## Parameters

### AI Generation Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | Natural language description of the UI component |
| `style_preference` | string | Style guidance (e.g., "modern", "minimalist") |
| `framework` | string | CSS framework (tailwind, bootstrap, bulma, etc.) |
| `component_type` | string | Component type (button, card, form, navigation, etc.) |
| `auto_search_reference` | boolean | Enable automatic reference search |
| `purpose_include` | string[] | Elements that must be included |
| `purpose_exclude` | string[] | Elements to avoid |
| `purpose_notes` | string | Additional requirements |
| `view_mode` | string | Preview mode: "mobile", "desktop", or "responsive" |

### Manual Input Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `design_name_1/2/3` | string | Name of each design |
| `design_html_1/2/3` | string | HTML content of each design |

## Supported Frameworks

- Tailwind CSS
- Bootstrap
- Bulma
- Foundation
- Semantic UI
- Plain CSS

## Supported Components

- Buttons (primary, secondary, outlined, with icons)
- Cards (content, featured, compact)
- Forms (inputs, validation, layouts)
- Navigation (bars, menus, responsive)
- Modals (dialogs, confirmations)
- Tables (data, striped, responsive)

## Keyboard Shortcuts

- `1`, `2`, `3` - Quick select design
- `Escape` - Close zoom view
- Click design - Zoom in for detailed view

## Troubleshooting

**Command not found:**
- Ensure npm global bin is in your PATH
- Or use full path: `/usr/local/bin/rakitui-ai` (Mac)

**Tool not appearing:**
- Restart your IDE completely
- Check MCP server status indicator

**MiniMax API not working:**
- Verify `MINIMAX_API_KEY` is set correctly
- Check your MiniMax account has credits

## Development

```bash
# Clone and install
git clone https://github.com/madebyaris/rakitui-ai.git
cd rakitui-ai
npm install

# Build
npm run build

# Start
npm start
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- **Repository**: [github.com/madebyaris/rakitui-ai](https://github.com/madebyaris/rakitui-ai)
- **Issues**: [GitHub Issues](https://github.com/madebyaris/rakitui-ai/issues)
- **MiniMax API**: [platform.minimax.io](https://platform.minimax.io)
