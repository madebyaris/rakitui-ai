import { DesignselectionTool } from './dist/tools/DesignselectionTool.js';

console.log("Starting design selection test...");

const designTool = new DesignselectionTool();

// Simple test designs
const input = {
  design_name_1: "Simple Button - Option 1",
  design_html_1: `<button style="padding: 12px 24px; background-color: #3B82F6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Click Me</button>`,
  
  design_name_2: "Simple Button - Option 2",
  design_html_2: `<button style="padding: 12px 24px; background-color: #10B981; color: white; border: none; border-radius: 25px; font-weight: 600; cursor: pointer;">Click Me</button>`,
  
  design_name_3: "Simple Button - Option 3",
  design_html_3: `<button style="padding: 12px 24px; background-color: #F59E0B; color: white; border: none; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: 600; cursor: pointer;">Click Me</button>`
};

console.log("Testing design selection...");
designTool.execute(input)
  .then(result => {
    console.log("Test complete! Result:", result);
  })
  .catch(error => {
    console.error("Test failed:", error);
  }); 