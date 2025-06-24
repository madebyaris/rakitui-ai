import { DesignselectionTool } from './dist/tools/DesignselectionTool.js';

/**
 * Test script for framework compatibility features
 */
async function testFrameworkCompatibility() {
  console.log('🧪 Testing Framework Compatibility Features...\n');
  
  const tool = new DesignselectionTool();
  
  // Test 1: Tailwind CSS Component
  const tailwindHTML = `
    <div class="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold mb-2">Tailwind Card</h2>
      <p class="text-blue-100">This is a Tailwind CSS component with utility classes.</p>
      <button class="bg-white text-blue-500 px-4 py-2 rounded mt-3 hover:bg-gray-100">
        Click Me
      </button>
    </div>
  `;
  
  // Test 2: Bootstrap Component
  const bootstrapHTML = `
    <div class="card" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">Bootstrap Card</h5>
        <p class="card-text">This is a Bootstrap component using traditional classes.</p>
        <a href="#" class="btn btn-primary">Go somewhere</a>
      </div>
    </div>
  `;
  
  // Test 3: Vanilla CSS Component
  const vanillaHTML = `
    <style>
      .custom-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      .custom-button {
        background: white;
        color: #667eea;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
      }
    </style>
    <div class="custom-card">
      <h2>Vanilla CSS Card</h2>
      <p>This component uses inline styles and custom CSS.</p>
      <button class="custom-button">Custom Button</button>
    </div>
  `;
  
  const testInput = {
    design_name_1: "Tailwind Design",
    design_html_1: tailwindHTML,
    design_name_2: "Bootstrap Design", 
    design_html_2: bootstrapHTML,
    design_name_3: "Vanilla CSS Design",
    design_html_3: vanillaHTML
  };
  
  try {
    console.log('📋 Test Input:');
    console.log('- Design 1: Tailwind CSS component');
    console.log('- Design 2: Bootstrap component');
    console.log('- Design 3: Vanilla CSS component');
    console.log('\n🚀 Starting design selection tool...');
    
    // This will open the browser with the improved interface
    const result = await tool.execute(testInput);
    
    console.log('\n✅ Test Results:');
    console.log(`- Success: ${result.success}`);
    console.log(`- Selected Design: ${result.selectedDesign || 'None'}`);
    console.log(`- Duration: ${result.selectionDuration}ms`);
    console.log(`- URL: ${result.url}`);
    
    if (result.success && result.selectedDesign) {
      console.log('\n🎉 Framework compatibility test passed!');
      console.log(`Selected: ${result.selectedDesign}`);
    } else {
      console.log('\n⚠️  Test completed but no selection was made.');
      console.log('This is normal if you closed the browser without selecting.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the test
testFrameworkCompatibility().catch(console.error); 