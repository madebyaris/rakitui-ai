# Rakit UI AI - MCP Design Selection Tool

An intelligent UI component design selection tool built on the Model Context Protocol (MCP). This tool allows AI assistants to present multiple UI component designs in a browser interface for user selection.

## Quick Start with npx

The easiest way to use Rakit UI AI is with npx - no installation required:

```bash
# Run directly with npx
npx rakitui-ai

# Or install globally and run
npm install -g rakitui-ai
rakitui-ai
```

The tool will start an MCP server that you can connect to from your AI assistant (like Claude Desktop, Cursor IDE, etc.).

## Using in IDEs

### Cursor IDE Setup

1. **Add to MCP Configuration:**
   Open your Cursor settings and add this to your MCP servers configuration:
   ```json
   {
     "mcpServers": {
       "rakitui-ai": {
         "command": "npx",
         "args": ["rakitui-ai"]
       }
     }
   }
   ```

2. **Start using the tool:**
   - Restart Cursor
   - The tool will be available as `mcp_rakit-ui-ai_designselection`
   - Ask Claude: "Show me 3 different button designs"
   - Claude will use the tool to present options in your browser

### Claude Desktop Setup

1. **Add to MCP Configuration:**
   Edit your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
   ```json
   {
     "mcpServers": {
       "rakitui-ai": {
         "command": "npx",
         "args": ["rakitui-ai"]
       }
     }
   }
   ```

2. **Restart Claude Desktop** and start using the design selection tool

### Other IDEs

For any IDE that supports MCP:
- Use command: `npx`
- Args: `["rakitui-ai"]`
- The tool will be available as `mcp_rakit-ui-ai_designselection`

## Installation Options

### Option 1: Use with npx (Recommended)
```bash
npx rakitui-ai
```

### Option 2: Global Installation
```bash
npm install -g rakitui-ai
rakitui-ai
```

### Option 3: Local Development
```bash
# Clone the repository
git clone [repository-url]
cd rakitui-ai

# Install dependencies
npm install --legacy-peer-deps

# Build the project
npm run build

# Start the server
npm start
```

## Features

### Core Functionality
- **Visual Design Comparison**: Display three UI component designs side-by-side in a modern, responsive interface
- **Real-time Selection**: WebSocket support for instant feedback when a design is selected
- **Enhanced Response Data**: Returns not just the selection, but also the HTML code and metadata

### User Experience Improvements
- **Keyboard Shortcuts**: Press 1, 2, or 3 for quick selection
- **Click to Zoom**: Click on any design to see it in a larger view
- **Code Preview**: Toggle between visual and code view for each design
- **Copy to Clipboard**: One-click copy of design HTML code
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Smooth Animations**: Polished UI with fade-ins, slides, and transitions

### Technical Features
- **WebSocket Communication**: Real-time bidirectional communication replaces polling
- **Security**: Basic XSS prevention and input validation
- **Connection Status**: Visual indicator showing WebSocket connection state
- **Local Storage**: Remembers last selection for reference
- **Error Handling**: Graceful error recovery with user feedback

## Usage

### Quick Start Example

Here's how simple it is to use the design selection tool:

```javascript
// Just provide 3 designs with names and HTML
const result = await tool.execute({
  design_name_1: "Tailwind Button",
  design_html_1: `<button class="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>`,
  
  design_name_2: "CSS Button", 
  design_html_2: `<button style="background: blue; color: white; padding: 8px 16px; border: none; border-radius: 4px;">Click me</button>`,
  
  design_name_3: "Bootstrap Button",
  design_html_3: `<button class="btn btn-primary">Click me</button>`
});

// Get your selection instantly
console.log(result.selectedDesign); // "CSS Button"
console.log(result.selectedDesignHtml); // The HTML code
```

**That's it!** The tool automatically:
- ✨ Detects CSS frameworks (Tailwind, Bootstrap, etc.)
- 📱 Adapts layout based on component complexity 
- 🖱️ Provides click-to-zoom and keyboard shortcuts
- 🎨 Shows beautiful, isolated previews
- ⚡ Returns the selected design with full details

### How to Use in Practice

Once configured in your IDE, simply ask your AI assistant to create design options:

**Example prompts:**
- "Show me 3 different card designs for a user profile"
- "Create 3 navigation bar options with different styles"
- "Give me 3 button variants: primary, secondary, and outlined"
- "Show me 3 different pricing table designs"

**What happens:**
1. 🤖 AI generates 3 different designs
2. 🚀 Tool opens in your browser automatically
3. 👀 You see all designs side-by-side
4. 🖱️ Click your favorite (or press 1, 2, 3)
5. ✅ AI gets your choice and can continue with that design

### Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎯 **Smart Layout** | Gallery view for complex components, card view for simple ones |
| 🛡️ **CSS Isolation** | No style conflicts between different frameworks |
| 📱 **Mobile Ready** | Touch-friendly interface with responsive design |
| ⌨️ **Keyboard Shortcuts** | Press 1, 2, or 3 for instant selection |
| 🔍 **Zoom View** | Click any design to see it larger |
| 📋 **Copy Code** | One-click copy of selected HTML |

### Manual MCP Server Mode

If you prefer to run the server manually (for development or custom setups):

1. **Start the MCP server:**
   ```bash
   npx rakitui-ai
   # OR after global install:
   rakitui-ai
   ```

2. **Configure your MCP client** to connect via stdio

3. **Use the tool:** The AI can now present UI design options and receive your selections

> **💡 Tip:** For most users, the IDE configuration above is much easier than manual server mode.

### Testing

Run the test script to see the tool in action:

```bash
npm test
```

This will:
- Start the MCP server
- Send a test request with three card designs
- Open a browser window for selection
- Display the enhanced response with selected design details

## API

### Tool Name: `designselection`

### Input Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| design_name_1 | string | Name of the first design |
| design_html_1 | string | HTML content of the first design |
| design_name_2 | string | Name of the second design |
| design_html_2 | string | HTML content of the second design |
| design_name_3 | string | Name of the third design |
| design_html_3 | string | HTML content of the third design |

### Response

```json
{
  "success": true,
  "message": "You selected: [Design Name]",
  "url": "http://localhost:3000/design-selection",
  "design_options": [
    { "name": "Design 1", "description": "Option 1" },
    { "name": "Design 2", "description": "Option 2" },
    { "name": "Design 3", "description": "Option 3" }
  ],
  "selectedDesign": "Design Name",
  "selectedDesignHtml": "<div>...</div>",
  "selectionTimestamp": "2024-01-15T10:30:00.000Z",
  "selectionDuration": 5234
}
```

## Architecture

```
rakitui-ai/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── DesignselectionTool.ts    # Main tool implementation
│   │   ├── templates/
│   │   │   └── designSelection.ts    # HTML template generator
│   │   └── utils/
│   │       └── serverUtils.ts        # Server and WebSocket utilities
├── dist/                     # Compiled JavaScript
├── tmp/                      # Temporary files and logs
└── .cursorrules/            # Development guidelines
```

## Development

### Building

```bash
# Build once
npm run build

# Watch mode for development
npm run watch
```

### Debugging

- Check `tmp/debug.log` for server-side logs
- Check `tmp/selection.log` for selection history
- Browser console shows client-side WebSocket activity

### Adding New Features

1. Update the HTML template in `src/tools/templates/designSelection.ts`
2. Add server-side logic in `src/tools/utils/serverUtils.ts`
3. Enhance the response format in `src/tools/DesignselectionTool.ts`
4. Build and test your changes

## Security Considerations

- Input validation prevents XSS attacks
- Design names are sanitized before display
- Script tags and JavaScript URLs are blocked
- WebSocket messages are validated

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch gestures

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read the development guidelines in `.cursorrules/development-guide.mdc` before submitting PRs.

---

## 👨‍💻 Hire Me

**I'm open to work and available for new opportunities!**

Hi! I'm the creator of this MCP Design Selection Tool. I specialize in building innovative developer tools, AI integrations, and modern web applications. If you're looking for someone who can:

- 🤖 Build AI-powered tools and MCP servers
- ⚡ Create modern, responsive web applications
- 🛠️ Develop developer experience tools
- 🎨 Design intuitive user interfaces
- 📱 Build cross-platform solutions

I'd love to hear about your project!

### 📧 Contact Information
- **Email**: [arissetia.m@gmail.com](mailto:arissetia.m@gmail.com)
- **Portfolio**: [madebyaris.com](https://madebyaris.com)
- **Status**: 🟢 **Available for hire**

### 💼 What I Can Help With
- Custom MCP server development
- AI tool integration and automation
- Modern web application development
- Developer experience improvements
- Technical consulting and architecture

Feel free to reach out – I'm always excited to work on interesting projects!

---
