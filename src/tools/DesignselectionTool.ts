import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateDesignSelectionHTML, DesignInput } from "./templates/designSelection.js";
import { serveHtmlOnLocalhost, getSelectedDesign, isSelectionComplete, stopLocalServer, notifySelectionFinalized } from "./utils/serverUtils.js";

// For handling ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a temporary directory path for logs
const tmpDir = path.join(__dirname, '../../../tmp');

/**
 * Tool for selecting between different UI component designs
 * 
 * This tool provides an intelligent, adaptive interface for comparing and selecting 
 * between up to 3 different UI component designs. It automatically detects CSS frameworks,
 * analyzes component complexity, and adapts the layout for optimal viewing.
 * 
 * Features:
 * - Framework Detection: Automatically detects Tailwind, Bootstrap, Bulma, Foundation, Semantic UI
 * - Adaptive Layout: Uses gallery view for large/complex components, card view for simple ones
 * - CSS Isolation: Prevents style conflicts between different frameworks
 * - Real-time Selection: WebSocket-based communication for instant feedback
 * - Mobile Optimized: Touch-friendly interface with responsive design
 * 
 * Perfect for: Component libraries, design systems, UI pattern comparisons, A/B testing
 */
export class DesignselectionTool extends MCPTool<DesignInput> {
  name = "mcp_rakit-ui-ai_designselection";
  description = "Compare and select between 3 UI component designs with intelligent layout adaptation. Supports all CSS frameworks (Tailwind, Bootstrap, Bulma, etc.) and automatically chooses the best viewing mode based on component complexity. Perfect for design systems, component libraries, and UI pattern selection.";

  schema = {
    design_name_1: {
      type: z.string(),
      description: "Name/title for the first design option (e.g., 'Modern Card Design', 'Bootstrap Button')",
    },
    design_html_1: {
      type: z.string(),
      description: "Complete HTML code for the first design. Can include inline CSS, any CSS framework classes, or plain HTML. The tool will automatically detect frameworks and optimize display.",
    },
    design_name_2: {
      type: z.string(),
      description: "Name/title for the second design option",
    },
    design_html_2: {
      type: z.string(),
      description: "Complete HTML code for the second design. Can include inline CSS, any CSS framework classes, or plain HTML.",
    },
    design_name_3: {
      type: z.string(),
      description: "Name/title for the third design option",
    },
    design_html_3: {
      type: z.string(),
      description: "Complete HTML code for the third design. Can include inline CSS, any CSS framework classes, or plain HTML.",
    },
  };

  /**
   * Validates input to ensure it's safe and well-formed
   */
  private validateDesignInput(input: DesignInput): void {
    // Check for potentially malicious content
    const designs = [
      { name: input.design_name_1, html: input.design_html_1 },
      { name: input.design_name_2, html: input.design_html_2 },
      { name: input.design_name_3, html: input.design_html_3 }
    ];
    
    for (const design of designs) {
      // Validate design names
      if (!design.name || design.name.trim().length === 0) {
        throw new Error('Design names cannot be empty. Please provide descriptive names for each design.');
      }
      if (design.name.length > 100) {
        throw new Error('Design name too long (max 100 characters)');
      }
      
      // Validate HTML content
      if (!design.html || design.html.trim().length === 0) {
        throw new Error('Design HTML cannot be empty. Please provide the HTML code for each design.');
      }
      
      // Basic XSS prevention - check for script tags
      if (design.html.toLowerCase().includes('<script') || 
          design.html.toLowerCase().includes('javascript:') ||
          design.html.toLowerCase().includes('onerror=')) {
        throw new Error('Design HTML contains potentially unsafe content. Script tags and inline JavaScript are not allowed for security reasons.');
      }
    }
  }

  /**
   * Main execution method
   */
  async execute(input: DesignInput) {
    const startTime = Date.now();
    
    try {
      // Validate input
      this.validateDesignInput(input);
      
      // Generate HTML content
      const htmlContent = generateDesignSelectionHTML(input);
      
      // Serve the HTML content on a local server and open in browser
      const url = await serveHtmlOnLocalhost('design-selection', htmlContent);
      
      // Wait for user to make a selection
      let selectedDesign = null;
      const timeoutMs = 15 * 60 * 1000; // 15 minutes total timeout
      
      // Debug for MCP
      process.stderr.write(`[DEBUG] Starting selection process\n`);
      
      // Keep checking until timeout is reached
      let checkCount = 0;
      while ((Date.now() - startTime) < timeoutMs) {
        checkCount++;
        if (checkCount % 20 === 0) {
          // Every 10 seconds, log the current status
          process.stderr.write(`[DEBUG] Still waiting for selection, ${Math.floor((Date.now() - startTime) / 1000)}s elapsed\n`);
        }
        
        // Check if a design has been selected
        selectedDesign = getSelectedDesign();
        
        if (selectedDesign) {
          process.stderr.write(`[DEBUG] Design selected: ${selectedDesign}\n`);
          
          // Notify the browser to close
          notifySelectionFinalized();
          
          // Give a moment for the browser to close gracefully
          await new Promise(resolve => setTimeout(resolve, 500));
          break;
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
      }
  
      // If no selection was made, return appropriate response
      if (!selectedDesign) {
        // Clean up
        await new Promise(resolve => setTimeout(resolve, 1000));
        stopLocalServer();
        
        return {
          success: false,
          message: "⏱️ No design was selected within the timeout period. The interface was available for 15 minutes.",
          url: url,
          design_options: [
            { 
              name: input.design_name_1, 
              description: "Option 1",
              preview: input.design_html_1 ? input.design_html_1.substring(0, 100) + (input.design_html_1.length > 100 ? '...' : '') : 'No HTML provided'
            },
            { 
              name: input.design_name_2, 
              description: "Option 2",
              preview: input.design_html_2 ? input.design_html_2.substring(0, 100) + (input.design_html_2.length > 100 ? '...' : '') : 'No HTML provided'
            },
            { 
              name: input.design_name_3, 
              description: "Option 3",
              preview: input.design_html_3 ? input.design_html_3.substring(0, 100) + (input.design_html_3.length > 100 ? '...' : '') : 'No HTML provided'
            }
          ],
          selectedDesign: null,
          selectedDesignHtml: null,
          selectionTimestamp: null,
          selectionDuration: Date.now() - startTime,
          tips: [
            "💡 Use keyboard shortcuts (1, 2, 3) for quick selection",
            "🖱️ Click on any design card to zoom in for better viewing", 
            "📱 The interface works on mobile devices too",
            "🔄 Try running the tool again if the browser didn't open properly"
          ]
        };
      }
  
      // Find the selected design HTML
      let selectedDesignHtml = '';
      if (selectedDesign === input.design_name_1) {
        selectedDesignHtml = input.design_html_1;
      } else if (selectedDesign === input.design_name_2) {
        selectedDesignHtml = input.design_html_2;
      } else if (selectedDesign === input.design_name_3) {
        selectedDesignHtml = input.design_html_3;
      }
      
      // Prepare the successful response
      const response = {
        success: true,
        message: `✅ Great choice! You selected: "${selectedDesign}"`,
        url: url,
        design_options: [
          { 
            name: input.design_name_1, 
            description: "Option 1",
            selected: selectedDesign === input.design_name_1,
            preview: input.design_html_1.substring(0, 100) + (input.design_html_1.length > 100 ? '...' : '')
          },
          { 
            name: input.design_name_2, 
            description: "Option 2", 
            selected: selectedDesign === input.design_name_2,
            preview: input.design_html_2.substring(0, 100) + (input.design_html_2.length > 100 ? '...' : '')
          },
          { 
            name: input.design_name_3, 
            description: "Option 3",
            selected: selectedDesign === input.design_name_3,
            preview: input.design_html_3.substring(0, 100) + (input.design_html_3.length > 100 ? '...' : '')
          }
        ],
        selectedDesign: selectedDesign,
        selectedDesignHtml: selectedDesignHtml,
        selectionTimestamp: new Date().toISOString(),
        selectionDuration: Date.now() - startTime,
        next_steps: [
          "🎨 Copy the selected HTML code from the 'selectedDesignHtml' field",
          "✨ Integrate the design into your project",
          "🔄 Run the tool again to compare more design variations",
          "🛠️ Customize the selected design to match your brand"
        ],
        usage_info: {
          frameworks_supported: ["Tailwind CSS", "Bootstrap", "Bulma", "Foundation", "Semantic UI", "Vanilla CSS"],
          features: ["Automatic framework detection", "Adaptive layout (gallery/card)", "CSS isolation", "Mobile responsive", "Real-time selection"],
          keyboard_shortcuts: { "1": "Select first design", "2": "Select second design", "3": "Select third design", "Escape": "Close zoom view" }
        }
      };
      
      // Schedule server cleanup
      setTimeout(() => {
        try {
          stopLocalServer();
        } catch (shutdownError) {
          // Silent error handling for shutdown
          process.stderr.write(`[ERROR] Server shutdown error: ${shutdownError}\n`);
        }
      }, 2000);
      
      // Return the enhanced response
      return response;
    } catch (error) {
      // Ensure we clean up the server in case of any error
      try {
        stopLocalServer();
      } catch (cleanupError) {
        // Silent error handling
      }
      
      // Return an error response
      return {
        success: false,
        error: true,
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        url: null,
        design_options: [
          { 
            name: input.design_name_1, 
            description: "Option 1",
            preview: input.design_html_1 ? input.design_html_1.substring(0, 100) + (input.design_html_1.length > 100 ? '...' : '') : 'No HTML provided'
          },
          { 
            name: input.design_name_2, 
            description: "Option 2",
            preview: input.design_html_2 ? input.design_html_2.substring(0, 100) + (input.design_html_2.length > 100 ? '...' : '') : 'No HTML provided'
          },
          { 
            name: input.design_name_3, 
            description: "Option 3",
            preview: input.design_html_3 ? input.design_html_3.substring(0, 100) + (input.design_html_3.length > 100 ? '...' : '') : 'No HTML provided'
          }
        ],
        selectedDesign: null,
        selectedDesignHtml: null,
        selectionTimestamp: null,
        selectionDuration: Date.now() - startTime,
        troubleshooting: [
          "✅ Ensure all design names are provided and not empty",
          "✅ Verify all HTML content is valid and not empty", 
          "✅ Remove any <script> tags or JavaScript code for security",
          "✅ Check that your browser allows popups from localhost",
          "✅ Try running the tool again if it was a temporary issue"
        ],
        help: {
          common_issues: {
            "Empty names/HTML": "All design names and HTML content must be provided",
            "Script tags": "JavaScript and script tags are blocked for security reasons", 
            "Popup blocked": "Allow popups for localhost in your browser settings",
            "Port in use": "Another instance might be running - wait a moment and try again"
          },
          example_usage: {
            design_name_1: "Modern Button",
            design_html_1: "<button class='bg-blue-500 text-white px-4 py-2 rounded'>Click me</button>",
            design_name_2: "Classic Button", 
            design_html_2: "<button style='background: blue; color: white; padding: 8px 16px; border: none; border-radius: 4px;'>Click me</button>",
            design_name_3: "Outlined Button",
            design_html_3: "<button style='border: 2px solid blue; color: blue; background: transparent; padding: 8px 16px; border-radius: 4px;'>Click me</button>"
          }
        }
      };
    }
  }
}

export default DesignselectionTool;