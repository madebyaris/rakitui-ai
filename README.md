# Rakit UI AI - MCP Design Selection Tool

An intelligent UI component design selection tool built on the Model Context Protocol (MCP). This tool allows AI assistants to present multiple UI component designs in a browser interface for user selection. **NEW:** Now includes AI-powered design generation using MiniMax-M2.1 API!

## Quick Start

Install Rakit UI AI globally and start using it immediately:

```bash
# Install globally
npm install -g rakitui-ai

# Set your MiniMax API key (required for AI design generation)
export MINIMAX_API_KEY="your-api-key-here"

# Run the MCP server
rakitui-ai
```

The tool will start an MCP server that you can connect to from your AI assistant (like Claude Desktop, Cursor IDE, etc.).

## AI-Powered Design Generation

**NEW FEATURE:** Rakit UI AI now includes AI-powered design generation using MiniMax-M2.1! Simply describe what you need in natural language, and the tool will generate 3 distinct, production-ready designs for you to choose from.

### Setup

1. Get your MiniMax API key from [platform.minimax.io](https://platform.minimax.io)
2. Set the environment variable:
   ```bash
   export MINIMAX_API_KEY="your-api-key-here"
   ```

3. That's it! The tool will automatically use the MiniMax API when you provide a prompt.

### Usage with AI Generation

```javascript
// Just describe what you need - the tool generates designs for you!
const result = await tool.execute({
  prompt: "Create 3 modern button designs for a SaaS dashboard",
  style_preference: "clean and professional",
  framework: "tailwind"
});

// Get your selection
console.log(result.selectedDesign); // "Modern Gradient Button"
console.log(result.selectedDesignHtml); // Complete HTML code
```

**The tool will:**
1. Call MiniMax-M2.1 with your prompt
2. Generate 3 distinct design variations
3. Open them in your browser for selection
4. Return your chosen design with full HTML code

## Using in IDEs

### Cursor IDE Setup

#### Option 1: Settings UI (Recommended)

1. **Open Cursor Settings:**
   - Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
   - Or click the settings icon in the bottom-left corner

2. **Navigate to MCP Settings:**
   - In the left sidebar, click on **"MCP"** (or search for "MCP" in the search bar)

3. **Add Rakit UI AI:**
   - Click the **"Add New MCP Server"** button
   - Enter the following:
     - **Server Name:** `rakitui-ai`
     - **Command:** `rakitui-ai`
     - **Environment Variables (optional):** Add `MINIMAX_API_KEY` if you want AI-powered generation

4. **Restart Cursor:**
   - Close and reopen Cursor, or click the **"Restart MCP Servers"** button if available

5. **Start Using:**
   - The tool will be available as `mcp_rakit-ui-ai_designselection`
   - Ask Claude: "Show me 3 different button designs"
   - Or: "Create a card component for a user profile"

#### Option 2: JSON Configuration File

1. **Open Cursor Settings:**
   - Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
   - Click the settings icon and select **"Open Settings (JSON)"** (or search for "MCP" and click **"Edit in JSON"**)

2. **Add the MCP Server:**
   Add this to your `settings.json` file:

   ```json
   {
     "mcpServers": {
       "rakitui-ai": {
         "command": "rakitui-ai"
       }
     }
   }
   ```

   **With MiniMax API Key (optional - for AI generation):**

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

3. **Save and Restart:**
   - Save the file (`Cmd+S` or `Ctrl+S`)
   - Restart Cursor

#### How to Use in Cursor

Once configured, you can use the tool in the Cursor chat:

**Example 1 - AI Generation (with MiniMax API):**
```
User: Create 3 button designs for my SaaS dashboard

Claude: I'll generate some button designs for you using the Rakit UI AI tool.

[Claude calls mcp_rakit-ui-ai_designselection with prompt]
[Browser opens with 3 design options]
[User clicks to select]

Claude: You selected the "Modern Gradient Button"! Here's the HTML code:
<button class="bg-gradient-to-r from-blue-500 to-blue-600 ...">Click me</button>
```

**Example 2 - Manual Input:**
```
User: Show me 3 card designs

Claude: Let me create 3 card design options for you.

[Claude calls mcp_rakit-ui-ai_designselection with HTML designs]
[Browser opens with 3 design options]
[User clicks to select]

Claude: You selected the "Featured Card"! Here's the code:
<div class="card featured">...</div>
```

**Available Commands:**
- **Keyboard shortcuts:** Press `1`, `2`, or `3` to select a design
- **Zoom:** Click on any design to see it larger
- **Copy code:** Click the copy button to copy the HTML

#### Troubleshooting Cursor Setup

**Problem: "Command not found" or "rakitui-ai not found"**

Solution:
- If installed globally, make sure npm global bin is in your PATH
- Or use the full path: `/usr/local/bin/rakitui-ai` (Mac) or `C:\Users\[you]\AppData\Roaming\npm\rakitui-ai.cmd` (Windows)
- For local development, use the full path to your project: `/path/to/rakitui-ai/dist/index.js`

**Problem: Tool not appearing in chat**

Solution:
- Restart Cursor completely
- Check that the MCP server is running (look for green indicator in MCP settings)
- Try removing and re-adding the server

**Problem: MiniMax API not working**

Solution:
- Verify your API key is correct
- Ensure `MINIMAX_API_KEY` environment variable is set
- Check your MiniMax account has credits available

### Claude Desktop Setup

1. **Add to MCP Configuration:**
   Edit your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
   ```json
   {
     "mcpServers": {
       "rakitui-ai": {
         "command": "rakitui-ai"
       }
     }
   }
   ```

2. **Restart Claude Desktop** and start using the design selection tool

### Other IDEs

For any IDE that supports MCP:
- Use command: `rakitui-ai`
- The tool will be available as `mcp_rakit-ui-ai_designselection`

## Installation Options

### Option 1: Global Installation (Recommended)
```bash
npm install -g rakitui-ai
rakitui-ai
```

### Option 2: Local Development
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
- **AI-Powered Generation** (NEW): Generate designs from natural language prompts using MiniMax-M2.1

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
- **MiniMax API Integration**: AI-powered design generation with token usage tracking

### Supported CSS Frameworks
- Tailwind CSS
- Bootstrap
- Bulma
- Foundation
- Semantic UI
- Plain CSS / Inline styles

### Supported Component Types
- Buttons (primary, secondary, outlined, with icons)
- Cards (content, featured, compact)
- Form Inputs (underlined, bordered, filled)
- Navigation Bars (standard, centered, full-featured)
- Modal Dialogs (standard, confirmation, form)
- Data Tables (simple, striped, data-dense)

## Usage

### Two Ways to Use Rakit UI AI

#### Option 1: AI-Powered Generation (NEW!)

Describe what you need, and MiniMax-M2.1 will generate 3 distinct designs:

```javascript
// Simple example
const result = await tool.execute({
  prompt: "Create 3 modern button designs for a SaaS dashboard"
});

// Detailed example with all options
const result = await tool.execute({
  prompt: "Design a product card for an e-commerce site with image, title, price, and Add to Cart button",
  style_preference: "modern and sleek",
  framework: "bootstrap",
  component_type: "card"
});

console.log(result.selectedDesign); // Selected design name
console.log(result.selectedDesignHtml); // Complete HTML code
console.log(result.generation); // Generation metadata including model, tokens used, etc.
```

**Example Prompts:**
- "Create 3 button designs for a SaaS dashboard"
- "Design a login form with email and password fields"
- "Show me 3 navigation bar styles for an e-commerce site"
- "Create a pricing card with monthly and yearly options"
- "Design a modal dialog for user confirmation"

#### Option 2: Manual Design Input

Provide your own pre-generated designs:

```javascript
const result = await tool.execute({
  design_name_1: "Tailwind Button",
  design_html_1: `<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Click me</button>`,
  
  design_name_2: "Bootstrap Button", 
  design_html_2: `<button class="btn btn-primary">Click me</button>`,
  
  design_name_3: "Minimal Button",
  design_html_3: `<button class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Click me</button>`
});

console.log(result.selectedDesign); // "Bootstrap Button"
console.log(result.selectedDesignHtml); // The HTML code
```

**That's it!** The tool automatically:
- Detects CSS frameworks (Tailwind, Bootstrap, etc.)
- Adapts layout based on component complexity
- Provides click-to-zoom and keyboard shortcuts
- Shows beautiful, isolated previews
- Returns the selected design with full details
- Generates designs from prompts using AI (when prompt is provided)

### How to Use in Practice

Once configured in your IDE, simply ask your AI assistant to create design options:

**Example prompts:**
- "Show me 3 different card designs for a user profile"
- "Create 3 navigation bar options with different styles"
- "Give me 3 button variants: primary, secondary, and outlined"
- "Show me 3 different pricing table designs"

**What happens:**
1. If you provide a prompt, the AI generates 3 different designs
2. If you provide designs directly, those are used
3. Tool opens in your browser automatically
4. You see all designs side-by-side
5. Click your favorite (or press 1, 2, 3)
6. AI gets your choice and can continue with that design

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

#### AI-Powered Generation (Prompt-Based)

| Parameter | Type | Description |
|-----------|------|-------------|
| prompt | string | Natural language description of the UI component to generate (e.g., "Create 3 modern button designs for a SaaS dashboard") |
| style_preference | string (optional) | Style guidance (e.g., "modern and clean", "playful", "minimalist") |
| framework | string (optional) | Target CSS framework (tailwind, bootstrap, bulma, foundation, semantic ui, css). Defaults to "tailwind" |
| component_type | string (optional) | Component type hint (button, card, form, navigation, modal, table) |

#### Manual Input (Legacy)

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
  "message": "Great choice! You selected: [Design Name]",
  "url": "http://localhost:3000/design-selection",
  "design_options": [
    { "name": "Design 1", "description": "Option 1", "selected": true, "preview": "..." },
    { "name": "Design 2", "description": "Option 2", "selected": false, "preview": "..." },
    { "name": "Design 3", "description": "Option 3", "selected": false, "preview": "..." }
  ],
  "selectedDesign": "Design Name",
  "selectedDesignHtml": "<div>...</div>",
  "selectionTimestamp": "2024-01-15T10:30:00.000Z",
  "selectionDuration": 5234,
  "generation": {
    "model": "MiniMax-M2.1",
    "prompt_used": "Create 3 button designs...",
    "framework": "tailwind",
    "tokens_used": 1234,
    "generation_time_ms": 5234
  },
  "next_steps": [
    "Copy the selected HTML code from the 'selectedDesignHtml' field",
    "Integrate the design into your project",
    "Run the tool again to compare more design variations"
  ]
}
```

### MiniMax API Integration

To use the AI-powered design generation:

1. **Get an API Key**: Visit [MiniMax Developer Platform](https://platform.minimax.io) to create an account and get your API key

2. **Set Environment Variable**:
   ```bash
   export MINIMAX_API_KEY="your-api-key-here"
   ```

3. **Usage**: Simply provide a `prompt` parameter instead of manual design HTML

**Note:** The API key is stored securely in your environment variable and is never logged or exposed.

## Architecture

```
rakitui-ai/
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── tools/
│   │   ├── DesignselectionTool.ts  # Main tool implementation (supports both workflows)
│   │   ├── templates/
│   │   │   └── designSelection.ts  # HTML template generator for browser UI
│   │   ├── utils/
│   │   │   ├── serverUtils.ts      # Server and WebSocket utilities
│   │   │   └── minimaxClient.ts    # MiniMax API client for AI design generation
│   │   └── prompts/
│   │       └── designPrompts.ts    # Prompt engineering templates for AI generation
├── dist/                           # Compiled JavaScript
├── tmp/                            # Temporary files and logs
└── .cursorrules/                   # Development guidelines
```

### New AI Integration Layer

The MiniMax API integration adds two new modules:

1. **minimaxClient.ts**: Handles communication with MiniMax API
   - API endpoint: https://api.minimax.io/v1
   - Authentication via MINIMAX_API_KEY environment variable
   - Error handling and retry logic
   - Response parsing for design JSON

2. **designPrompts.ts**: Contains optimized prompts for different component types
   - System prompt establishing UI/UX expertise
   - Component-specific prompt templates (buttons, cards, forms, etc.)
   - Framework-specific guidelines (Tailwind, Bootstrap, etc.)
   - Design quality checklist for AI instructions

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
- MiniMax API calls are logged with timing and token usage

### Testing MiniMax Integration

```bash
# Set your API key first
export MINIMAX_API_KEY="your-api-key-here"

# Run the MiniMax integration test
npm run test:minimax

# Or test manually
node test-minimax-integration.js
```

### Adding New Features

1. Update the HTML template in `src/tools/templates/designSelection.ts`
2. Add server-side logic in `src/tools/utils/serverUtils.ts`
3. Enhance the response format in `src/tools/DesignselectionTool.ts`
4. Add new prompt templates in `src/tools/prompts/designPrompts.ts`
5. Build and test your changes

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
