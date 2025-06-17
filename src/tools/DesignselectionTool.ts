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

export class DesignselectionTool extends MCPTool<DesignInput> {
  name = "designselection";
  description = "Tool for selecting between different UI component designs. Can be run multiple times to compare different components. Returns individual component sections rather than full page designs.";

  schema = {
    design_name_1: {
      type: z.string(),
      description: "Name of the first design",
    },
    design_html_1: {
      type: z.string(),
      description: "HTML content of the first design (individual UI component)",
    },
    design_name_2: {
      type: z.string(),
      description: "Name of the second design",
    },
    design_html_2: {
      type: z.string(),
      description: "HTML content of the second design (individual UI component)",
    },
    design_name_3: {
      type: z.string(),
      description: "Name of the third design",
    },
    design_html_3: {
      type: z.string(),
      description: "HTML content of the third design (individual UI component)",
    },
  };

  async execute(input: DesignInput) {
    try {
      // Generate HTML content
      const htmlContent = generateDesignSelectionHTML(input);
      
      // Serve the HTML content on a local server and open in browser
      const url = await serveHtmlOnLocalhost('design-selection', htmlContent);
      
      // Wait for user to make a selection (polling approach)
      let selectedDesign = null;
      const startTime = Date.now();
      const timeoutMs = 15 * 60 * 1000; // 15 minutes total timeout
      
      // Poll for selection at shorter intervals for faster response
      const pollIntervalMs = 500; // Check every 500ms
      
      // Debug for MCP
      process.stderr.write(`[DEBUG] Starting selection polling loop\n`);
      
      try {
        // Write a marker to our log file
        fs.appendFileSync(path.join(tmpDir, 'debug.log'), `${new Date().toISOString()} [TOOL] Starting selection polling\n`);
      } catch (err) {
        // Silently fail if we can't write to the debug file
      }
      
      // Keep checking until timeout is reached
      let checkCount = 0;
      while ((Date.now() - startTime) < timeoutMs) {
        checkCount++;
        if (checkCount % 20 === 0) {
          // Every 10 seconds (20 * 500ms), log the current status
          process.stderr.write(`[DEBUG] Still waiting for selection, ${Math.floor((Date.now() - startTime) / 1000)}s elapsed\n`);
        }
        
        // Check if a design has been selected
        selectedDesign = getSelectedDesign();
        
        if (selectedDesign) {
          process.stderr.write(`[DEBUG] Design selected: ${selectedDesign}\n`);
          // Read the debug file to see if the selection was logged
          try {
            if (fs.existsSync(path.join(tmpDir, 'selection.log'))) {
              process.stderr.write(`[DEBUG] Selection log file exists\n`);
            } else {
              process.stderr.write(`[DEBUG] Selection log file does not exist\n`);
            }
          } catch (err) {
            // Silently fail
          }
          
          // Immediately notify the browser to close itself
          notifySelectionFinalized();
          
          // Don't stop the server immediately - we'll do that after returning the result
          break;
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      }
  
      // If no selection was made, return a message
      if (!selectedDesign) {
        // Add a small delay before stopping the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        stopLocalServer();
        
        return {
          message: "No design was selected within the timeout period. Please try again.",
          url: url,
          design_options: [
            { name: input.design_name_1, description: "Option 1" },
            { name: input.design_name_2, description: "Option 2" },
            { name: input.design_name_3, description: "Option 3" }
          ],
          selectedDesign: null
        };
      }
  
      // Prepare the response
      const response = {
        message: `You selected: ${selectedDesign}`,
        url: url,
        design_options: [
          { name: input.design_name_1, description: "Option 1" },
          { name: input.design_name_2, description: "Option 2" },
          { name: input.design_name_3, description: "Option 3" }
        ],
        selectedDesign: selectedDesign
      };
      
      // Add a small delay before stopping the server to ensure the response is sent
      // Using a different approach to stop the server that won't interfere with the JSON
      setTimeout(() => {
        try {
          stopLocalServer();
        } catch (shutdownError) {
          // Silent error handling for shutdown to avoid interfering with response
          process.stderr.write(`[ERROR] Server shutdown error: ${shutdownError}\n`);
        }
      }, 2000);
      
      // Return with the selection
      return response;
    } catch (error) {
      // Ensure we clean up the server in case of any error
      try {
        stopLocalServer();
      } catch (cleanupError) {
        // Silent error handling
      }
      
      // Return an error response that won't break the MCP protocol
      return {
        error: true,
        message: `Error in design selection: ${error instanceof Error ? error.message : String(error)}`,
        selectedDesign: null
      };
    }
  }
}

export default DesignselectionTool;