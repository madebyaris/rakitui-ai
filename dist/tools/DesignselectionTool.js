import { MCPTool } from "mcp-framework";
import { z } from "zod";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateDesignSelectionHTML } from "./templates/designSelection.js";
import { serveHtmlOnLocalhost, getSelectedDesign, stopLocalServer, notifySelectionFinalized } from "./utils/serverUtils.js";
// For handling ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Create a temporary directory path for logs
const tmpDir = path.join(__dirname, '../../../tmp');
/**
 * Tool for selecting between different UI component designs
 * Shows three design options in a browser window and returns the selected design
 */
export class DesignselectionTool extends MCPTool {
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
    /**
     * Validates input to ensure it's safe
     */
    validateDesignInput(input) {
        // Check for potentially malicious content
        const designs = [
            { name: input.design_name_1, html: input.design_html_1 },
            { name: input.design_name_2, html: input.design_html_2 },
            { name: input.design_name_3, html: input.design_html_3 }
        ];
        for (const design of designs) {
            // Validate design names
            if (design.name.length > 100) {
                throw new Error('Design name too long (max 100 characters)');
            }
            // Basic XSS prevention - check for script tags
            if (design.html.toLowerCase().includes('<script') ||
                design.html.toLowerCase().includes('javascript:') ||
                design.html.toLowerCase().includes('onerror=')) {
                throw new Error('Design HTML contains potentially unsafe content');
            }
        }
    }
    /**
     * Main execution method
     */
    async execute(input) {
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
                    message: "No design was selected within the timeout period. Please try again.",
                    url: url,
                    design_options: [
                        { name: input.design_name_1, description: "Option 1" },
                        { name: input.design_name_2, description: "Option 2" },
                        { name: input.design_name_3, description: "Option 3" }
                    ],
                    selectedDesign: null,
                    selectedDesignHtml: null,
                    selectionTimestamp: null,
                    selectionDuration: Date.now() - startTime
                };
            }
            // Find the selected design HTML
            let selectedDesignHtml = '';
            if (selectedDesign === input.design_name_1) {
                selectedDesignHtml = input.design_html_1;
            }
            else if (selectedDesign === input.design_name_2) {
                selectedDesignHtml = input.design_html_2;
            }
            else if (selectedDesign === input.design_name_3) {
                selectedDesignHtml = input.design_html_3;
            }
            // Prepare the successful response
            const response = {
                success: true,
                message: `You selected: ${selectedDesign}`,
                url: url,
                design_options: [
                    { name: input.design_name_1, description: "Option 1" },
                    { name: input.design_name_2, description: "Option 2" },
                    { name: input.design_name_3, description: "Option 3" }
                ],
                selectedDesign: selectedDesign,
                selectedDesignHtml: selectedDesignHtml,
                selectionTimestamp: new Date().toISOString(),
                selectionDuration: Date.now() - startTime
            };
            // Schedule server cleanup
            setTimeout(() => {
                try {
                    stopLocalServer();
                }
                catch (shutdownError) {
                    // Silent error handling for shutdown
                    process.stderr.write(`[ERROR] Server shutdown error: ${shutdownError}\n`);
                }
            }, 2000);
            // Return the enhanced response
            return response;
        }
        catch (error) {
            // Ensure we clean up the server in case of any error
            try {
                stopLocalServer();
            }
            catch (cleanupError) {
                // Silent error handling
            }
            // Return an error response
            return {
                success: false,
                error: true,
                message: `Error in design selection: ${error instanceof Error ? error.message : String(error)}`,
                url: null,
                design_options: [
                    { name: input.design_name_1, description: "Option 1" },
                    { name: input.design_name_2, description: "Option 2" },
                    { name: input.design_name_3, description: "Option 3" }
                ],
                selectedDesign: null,
                selectedDesignHtml: null,
                selectionTimestamp: null,
                selectionDuration: Date.now() - startTime
            };
        }
    }
}
export default DesignselectionTool;
