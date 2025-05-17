import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { generateDesignSelectionHTML } from "./templates/designSelection.js";
import { serveHtmlOnLocalhost, getSelectedDesign, isSelectionComplete, stopLocalServer, notifySelectionFinalized } from "./utils/serverUtils.js";
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
    async execute(input) {
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
        // Keep checking until timeout is reached
        while ((Date.now() - startTime) < timeoutMs) {
            // Check if a design has been selected
            selectedDesign = getSelectedDesign();
            if (selectedDesign && isSelectionComplete()) {
                // Immediately notify the browser to close itself
                notifySelectionFinalized();
                // Immediately stop the server to terminate all connections
                stopLocalServer();
                // Return immediately with the selection
                break;
            }
            // Wait before checking again
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }
        // If no selection was made, return a message
        if (!selectedDesign) {
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
        // Return with the selection
        return {
            message: `You selected: ${selectedDesign}`,
            url: url,
            design_options: [
                { name: input.design_name_1, description: "Option 1" },
                { name: input.design_name_2, description: "Option 2" },
                { name: input.design_name_3, description: "Option 3" }
            ],
            selectedDesign: selectedDesign
        };
    }
}
export default DesignselectionTool;
