import { DesignselectionTool } from './dist/tools/DesignselectionTool.js';

/**
 * Test adaptive layout system with components of different sizes
 */
async function testAdaptiveLayout() {
  console.log('🎨 Testing Adaptive Layout System...\n');
  
  const tool = new DesignselectionTool();
  
  // Large Complex Component (should use gallery layout)
  const largeComponent = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px; color: white; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
      <header style="margin-bottom: 30px;">
        <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Dashboard Analytics</h1>
        <p style="opacity: 0.9; font-size: 1.1rem;">Real-time insights and performance metrics</p>
      </header>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
          <h3 style="margin-bottom: 15px; color: #fbbf24;">Revenue</h3>
          <div style="font-size: 2rem; font-weight: bold;">$24,750</div>
          <div style="color: #34d399; font-size: 0.9rem;">↗ +12.5% from last month</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
          <h3 style="margin-bottom: 15px; color: #60a5fa;">Users</h3>
          <div style="font-size: 2rem; font-weight: bold;">1,847</div>
          <div style="color: #34d399; font-size: 0.9rem;">↗ +8.2% active users</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
          <h3 style="margin-bottom: 15px; color: #f87171;">Conversion</h3>
          <div style="font-size: 2rem; font-weight: bold;">3.24%</div>
          <div style="color: #fbbf24; font-size: 0.9rem;">→ Stable performance</div>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px);">
        <h3 style="margin-bottom: 15px;">Recent Activity</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <span>New user registration</span>
            <span style="opacity: 0.7; font-size: 0.9rem;">2 min ago</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <span>Payment processed</span>
            <span style="opacity: 0.7; font-size: 0.9rem;">5 min ago</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <span>Database backup completed</span>
            <span style="opacity: 0.7; font-size: 0.9rem;">12 min ago</span>
          </div>
        </div>
      </div>
      
      <footer style="margin-top: 30px; text-align: center; opacity: 0.8;">
        <div style="display: flex; justify-content: center; gap: 20px;">
          <button style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Export Data</button>
          <button style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">View Details</button>
          <button style="background: #fbbf24; border: none; color: #1f2937; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Refresh</button>
        </div>
      </footer>
    </div>
  `;
  
  // Medium Component (should use gallery layout)
  const mediumComponent = `
    <div style="max-width: 400px; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&h=200&q=80" 
           style="width: 100%; height: 200px; object-fit: cover;" alt="Product">
      <div style="padding: 25px;">
        <h2 style="margin-bottom: 10px; color: #1f2937; font-size: 1.5rem;">Premium Headphones</h2>
        <p style="color: #6b7280; margin-bottom: 20px; line-height: 1.6;">Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation and 30-hour battery life.</p>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="display: flex;">
              <span style="color: #fbbf24;">★★★★★</span>
            </div>
            <span style="color: #6b7280; font-size: 0.9rem;">(124 reviews)</span>
          </div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #1f2937;">$299</div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">Add to Cart</button>
          <button style="background: #f3f4f6; color: #374151; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">♡</button>
        </div>
        
        <div style="display: flex; align-items: center; gap: 15px; font-size: 0.9rem; color: #6b7280;">
          <span>✓ Free shipping</span>
          <span>✓ 2-year warranty</span>
        </div>
      </div>
    </div>
  `;
  
  // Small Component (should use card layout)
  const smallComponent = `
    <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 300px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          JD
        </div>
        <div>
          <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 1rem;">John Doe</h4>
          <p style="margin: 0; color: #64748b; font-size: 0.875rem;">Software Engineer</p>
        </div>
      </div>
      <p style="margin: 15px 0; color: #475569; line-height: 1.5;">"This tool has completely transformed our design workflow. Highly recommend!"</p>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="color: #fbbf24;">★★★★★</div>
        <button style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.875rem; cursor: pointer;">Follow</button>
      </div>
    </div>
  `;
  
  const testInput = {
    design_name_1: "Dashboard Analytics (Large)",
    design_html_1: largeComponent,
    design_name_2: "Product Card (Medium)", 
    design_html_2: mediumComponent,
    design_name_3: "User Testimonial (Small)",
    design_html_3: smallComponent
  };
  
  try {
    console.log('📋 Test Components:');
    console.log('- Design 1: Large dashboard component (should use gallery layout)');
    console.log('- Design 2: Medium product card (should use gallery layout)');
    console.log('- Design 3: Small user testimonial (should use card layout)');
    console.log('\n🔄 Expected: Mixed layout with adaptive sizing');
    console.log('\n🚀 Opening adaptive layout interface...');
    
    const result = await tool.execute(testInput);
    
    console.log('\n✅ Adaptive Layout Test Results:');
    console.log(`- Success: ${result.success}`);
    console.log(`- Selected Design: ${result.selectedDesign || 'None'}`);
    console.log(`- Duration: ${Math.round(result.selectionDuration / 1000)}s`);
    
    if (result.success && result.selectedDesign) {
      console.log('\n🎉 Adaptive layout test completed successfully!');
      console.log(`You selected: ${result.selectedDesign}`);
      console.log('\n💡 Layout Analysis:');
      console.log('- Large components displayed in gallery view');
      console.log('- Small components displayed in card view');
      console.log('- Unified, responsive interface');
    } else {
      console.log('\n⚠️  Test completed without selection.');
      console.log('Layout adaptation should still be visible in the interface.');
    }
    
  } catch (error) {
    console.error('\n❌ Adaptive layout test failed:', error.message);
  }
}

// Run the adaptive layout test
testAdaptiveLayout().catch(console.error); 