/**
 * Detects CSS framework usage in HTML content
 */
function detectCSSFramework(html) {
    const frameworks = [];
    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes('class="') || lowerHtml.includes("class='")) {
        // Check for Tailwind CSS
        if (lowerHtml.match(/class=['"][^'"]*(?:bg-|text-|p-|m-|w-|h-|flex|grid|border-)/)) {
            frameworks.push('tailwind');
        }
        // Check for Bootstrap
        if (lowerHtml.match(/class=['"][^'"]*(?:btn|container|row|col-|nav|card|alert)/)) {
            frameworks.push('bootstrap');
        }
        // Check for Bulma
        if (lowerHtml.match(/class=['"][^'"]*(?:button|container|columns|column|notification|hero)/)) {
            frameworks.push('bulma');
        }
        // Check for Foundation
        if (lowerHtml.match(/class=['"][^'"]*(?:button|grid-container|grid-x|cell|callout)/)) {
            frameworks.push('foundation');
        }
        // Check for Semantic UI
        if (lowerHtml.match(/class=['"][^'"]*(?:ui |button|container|grid|segment|header)/)) {
            frameworks.push('semantic-ui');
        }
    }
    return frameworks;
}
/**
 * Extracts CSS from HTML content
 */
function extractStyles(html) {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const linkRegex = /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi;
    let css = '';
    let cleanHtml = html;
    // Extract inline styles
    let match;
    while ((match = styleRegex.exec(html)) !== null) {
        css += match[1] + '\n';
        cleanHtml = cleanHtml.replace(match[0], '');
    }
    // Extract link tags (we'll note them but can't fetch external CSS)
    const linkMatches = html.match(linkRegex);
    if (linkMatches) {
        css += `/* External stylesheets detected: ${linkMatches.length} */\n`;
        cleanHtml = cleanHtml.replace(linkRegex, '');
    }
    return { css, cleanHtml };
}
/**
 * Wraps HTML content in an isolated container
 */
function wrapInIsolatedContainer(html, index, frameworks) {
    const containerClass = `design-component-${index}`;
    // Create CSS-in-JS style isolation
    let isolationStyles = '';
    if (frameworks.includes('tailwind')) {
        // For Tailwind, we need to ensure our container doesn't interfere
        isolationStyles = `
      .${containerClass} {
        /* Reset any inherited Tailwind styles */
        all: initial;
        font-family: inherit;
        color: inherit;
        display: block;
      }
      .${containerClass} * {
        box-sizing: border-box;
      }
    `;
    }
    else if (frameworks.includes('bootstrap')) {
        // For Bootstrap, ensure container works with Bootstrap grid
        isolationStyles = `
      .${containerClass} {
        /* Ensure Bootstrap compatibility */
        width: 100%;
        display: block;
      }
    `;
    }
    return `
    <div class="${containerClass}" data-framework="${frameworks.join(',')}" data-isolation="true">
      <style scoped>
        ${isolationStyles}
      </style>
      ${html}
    </div>
  `;
}
/**
 * Safely encodes HTML for use in JavaScript
 */
function safeEncodeForJS(html) {
    return btoa(encodeURIComponent(html))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
/**
 * Safely decodes HTML from JavaScript
 */
function generateDecodeFunction() {
    return `
    function safeDecode(encoded) {
      try {
        // Reverse the safe encoding
        const base64 = encoded
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(encoded.length + (4 - encoded.length % 4) % 4, '=');
        return decodeURIComponent(atob(base64));
      } catch (error) {
        console.error('Decode error:', error);
        return '';
      }
    }
  `;
}
/**
 * Generates framework-specific CSS based on detected frameworks
 */
function generateFrameworkCSS(frameworks) {
    let css = '';
    if (frameworks.includes('tailwind')) {
        css += `
      /* Tailwind compatibility styles */
      .design-content [class*="bg-"], 
      .design-content [class*="text-"],
      .design-content [class*="border-"] {
        /* Preserve Tailwind classes */
      }
    `;
    }
    if (frameworks.includes('bootstrap')) {
        css += `
      /* Bootstrap compatibility styles */
      .design-content .btn,
      .design-content .card,
      .design-content .container,
      .design-content [class*="col-"] {
        /* Preserve Bootstrap classes */
      }
    `;
    }
    if (frameworks.includes('bulma')) {
        css += `
      /* Bulma compatibility styles */
      .design-content .button,
      .design-content .card,
      .design-content .container,
      .design-content [class*="column"] {
        /* Preserve Bulma classes */
      }
    `;
    }
    return css;
}
/**
 * Analyzes component size and complexity to determine optimal layout
 */
function analyzeComponentLayout(html) {
    const lowerHtml = html.toLowerCase();
    // Count elements and complexity indicators
    const elementCount = (html.match(/<[^\/][^>]*>/g) || []).length;
    const hasImages = lowerHtml.includes('<img') || lowerHtml.includes('background-image');
    const hasComplexLayout = lowerHtml.includes('grid') || lowerHtml.includes('flex') || lowerHtml.includes('columns');
    const hasMultipleSections = (html.match(/<(div|section|article|header|footer|main)[^>]*>/g) || []).length > 3;
    const textLength = html.replace(/<[^>]*>/g, '').length;
    // Determine if component is large/complex enough for gallery view
    const isLargeComponent = elementCount > 10 ||
        textLength > 500 ||
        hasImages ||
        hasComplexLayout ||
        hasMultipleSections;
    return isLargeComponent ? 'gallery' : 'card';
}
/**
 * Generates layout-specific CSS based on component analysis
 */
function generateLayoutCSS(layouts) {
    const hasGallery = layouts.includes('gallery');
    const hasCard = layouts.includes('card');
    if (hasGallery && hasCard) {
        // Mixed layout - responsive approach
        return `
      /* Mixed Layout: Gallery + Card */
      .designs-container.mixed-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
        justify-content: center;
        margin-bottom: 60px;
        padding: 0 20px;
      }
      
      .design-container.gallery-layout {
        max-width: none;
        flex: 1 1 100%;
        min-height: 400px;
      }
      
      .design-container.card-layout {
        max-width: 400px;
        flex: 1 1 320px;
      }
    `;
    }
    else if (hasGallery) {
        // All gallery layout
        return `
      /* Gallery Layout: Large Components */
      .designs-container.gallery-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 15px;
        justify-content: center;
        margin-bottom: 40px;
        padding: 0 15px;
      }
      
      .design-container.gallery-layout {
        padding: 15px;
        margin-bottom: 0;
        min-height: 350px;
        border-radius: 12px;
      }
      
      .design-content.gallery-layout {
        min-height: 200px;
        max-height: 250px;
        overflow: hidden;
        position: relative;
      }
      
      .design-content.gallery-layout::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: linear-gradient(transparent, rgba(255,255,255,0.9));
        pointer-events: none;
      }
      
      .design-name.gallery-layout {
        font-size: 18px;
        margin-bottom: 10px;
        padding-bottom: 8px;
      }
      
      .buttons-container.gallery-layout {
        margin-top: 15px;
        padding: 10px;
      }
      
      .buttons-container.gallery-layout button {
        padding: 12px 24px;
        font-size: 14px;
        min-height: 44px;
        min-width: 140px;
      }
    `;
    }
    return '';
}
export function generateDesignSelectionHTML(input) {
    // Validate input first
    if (!input || typeof input !== 'object') {
        throw new Error('Invalid input provided to generateDesignSelectionHTML');
    }
    // Ensure all required fields exist
    const requiredFields = ['design_name_1', 'design_html_1', 'design_name_2', 'design_html_2', 'design_name_3', 'design_html_3'];
    for (const field of requiredFields) {
        if (!input[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    // Sanitize design names to prevent XSS
    const sanitizeName = (name) => {
        return name.replace(/[<>'"]/g, '');
    };
    // Detect frameworks in each design
    const design1Frameworks = detectCSSFramework(input.design_html_1);
    const design2Frameworks = detectCSSFramework(input.design_html_2);
    const design3Frameworks = detectCSSFramework(input.design_html_3);
    // Analyze layout requirements for each design
    const design1Layout = analyzeComponentLayout(input.design_html_1);
    const design2Layout = analyzeComponentLayout(input.design_html_2);
    const design3Layout = analyzeComponentLayout(input.design_html_3);
    const allLayouts = [design1Layout, design2Layout, design3Layout];
    const layoutType = allLayouts.every(l => l === 'gallery') ? 'gallery' :
        allLayouts.every(l => l === 'card') ? 'card' : 'mixed';
    // Combine all detected frameworks
    const allFrameworks = [...new Set([...design1Frameworks, ...design2Frameworks, ...design3Frameworks])];
    // Extract and process styles from each design
    const design1Processed = extractStyles(input.design_html_1);
    const design2Processed = extractStyles(input.design_html_2);
    const design3Processed = extractStyles(input.design_html_3);
    // Wrap designs in isolated containers
    const wrappedDesign1 = wrapInIsolatedContainer(design1Processed.cleanHtml, 1, design1Frameworks);
    const wrappedDesign2 = wrapInIsolatedContainer(design2Processed.cleanHtml, 2, design2Frameworks);
    const wrappedDesign3 = wrapInIsolatedContainer(design3Processed.cleanHtml, 3, design3Frameworks);
    // Generate framework-specific and layout-specific CSS
    const frameworkCSS = generateFrameworkCSS(allFrameworks);
    const layoutCSS = generateLayoutCSS(allLayouts);
    // Safe encoding for JavaScript
    const encodedDesign1 = safeEncodeForJS(input.design_html_1);
    const encodedDesign2 = safeEncodeForJS(input.design_html_2);
    const encodedDesign3 = safeEncodeForJS(input.design_html_3);
    // Build the HTML using safer string concatenation for problematic parts
    const styleInjectionScript = `
        // Inject extracted styles dynamically
        function injectDynamicStyles() {
          const styles = [
            { id: 'design-1-styles', css: ${JSON.stringify(design1Processed.css)} },
            { id: 'design-2-styles', css: ${JSON.stringify(design2Processed.css)} },
            { id: 'design-3-styles', css: ${JSON.stringify(design3Processed.css)} }
          ];
          
          styles.forEach(styleData => {
            const styleEl = document.createElement('style');
            styleEl.id = styleData.id;
            styleEl.textContent = styleData.css;
            document.head.appendChild(styleEl);
          });
        }`;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UI Component Selection</title>
      
      <!-- Framework Detection Meta -->
      <meta name="detected-frameworks" content="${allFrameworks.join(',')}">
      
      <!-- External Framework Links (if needed) -->
      ${allFrameworks.includes('tailwind') ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
      ${allFrameworks.includes('bootstrap') ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' : ''}
      ${allFrameworks.includes('bulma') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">' : ''}
      ${allFrameworks.includes('foundation') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/css/foundation.min.css">' : ''}
      ${allFrameworks.includes('semantic-ui') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css">' : ''}
      
      <style>
        /* Base Reset and Layout */
        * {
          box-sizing: border-box;
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          margin: 0; 
          padding: 20px;
          background-color: #f9f9f9;
          overflow-x: hidden;
        }
        
        /* Framework Compatibility Styles */
        ${frameworkCSS}
        
        /* Layout-Specific Styles */
        ${layoutCSS}
        
        /* Component Isolation Styles */
        .design-content {
          margin-bottom: 20px;
          min-height: 120px;
          padding: 20px;
          border: 2px dashed #e0e0e0;
          border-radius: 8px;
          background-color: #ffffff;
          position: relative;
          overflow: auto;
          transition: all 0.3s ease;
          
          /* Isolation for different frameworks */
          contain: layout style;
        }
        
        .design-content[data-framework*="tailwind"] {
          /* Tailwind-specific container adjustments */
          font-size: 14px;
        }
        
        .design-content[data-framework*="bootstrap"] {
          /* Bootstrap-specific container adjustments */
          font-size: 16px;
        }
        
        .design-content[data-framework*="bulma"] {
          /* Bulma-specific container adjustments */
          font-size: 16px;
        }
        
        /* Enhanced Design Container */
        .design-container { 
          flex: 1 1 350px;
          max-width: 600px;
          margin-bottom: 30px; 
          padding: 25px; 
          border: 2px solid #e8e8e8; 
          border-radius: 16px;
          background-color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          cursor: pointer;
          user-select: none;
        }
        
        .design-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .design-container:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          border-color: #667eea;
        }
        
        .design-container:hover::before {
          opacity: 1;
        }
        
        .design-container.selected {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 20px 40px rgba(16, 185, 129, 0.15);
          background-color: #f0fdf4;
          transform: translateY(-8px);
        }
        
        .design-container.selected::before {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
          opacity: 1;
        }
        
        /* Click indicator */
        .design-container::after {
          content: '👆 Click to zoom or select';
          position: absolute;
          bottom: 10px;
          right: 15px;
          font-size: 12px;
          color: #9ca3af;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .design-container:hover::after {
          opacity: 1;
        }
        
        /* Layout Improvements */
        .designs-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          justify-content: center;
          margin-bottom: 60px;
          padding: 0 20px;
        }
        
        .design-name { 
          font-size: 22px; 
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f0f0;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .framework-badges {
          display: flex;
          gap: 6px;
          margin: 10px 0;
          flex-wrap: wrap;
        }
        
        .framework-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .framework-badge.tailwind { background: #38bdf8; color: white; }
        .framework-badge.bootstrap { background: #7952b3; color: white; }
        .framework-badge.bulma { background: #00d1b2; color: white; }
        .framework-badge.foundation { background: #1779ba; color: white; }
        .framework-badge.semantic-ui { background: #00b5ad; color: white; }
        .framework-badge.vanilla { background: #6b7280; color: white; }
        
        .layout-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: 4px;
        }
        
        .layout-badge.gallery { background: #8b5cf6; color: white; }
        .layout-badge.card { background: #06b6d4; color: white; }
        
        /* Enhanced UI Elements */
        .connection-status {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 16px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }
        
        .connection-status.connected {
          background-color: rgba(16, 185, 129, 0.9);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .connection-status.disconnected {
          background-color: rgba(239, 68, 68, 0.9);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .connection-status.connecting {
          background-color: rgba(245, 158, 11, 0.9);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        h1 {
          text-align: center;
          margin-bottom: 15px;
          color: #1a1a1a;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          text-align: center;
          margin-bottom: 40px;
          color: #6b7280;
          font-size: 18px;
          font-weight: 500;
        }
        
        .instructions {
          max-width: 800px;
          margin: 0 auto 40px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);
          border-radius: 12px;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        
        /* Button Improvements */
        button { 
          padding: 18px 36px; 
          font-size: 18px; 
          font-weight: 700;
          margin: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-height: 56px;
          min-width: 200px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          transform: translateZ(0); /* Hardware acceleration */
        }
        
        button:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }
        
        button:active {
          transform: translateY(-2px) scale(0.98);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        button:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3), 0 12px 35px rgba(102, 126, 234, 0.5);
        }
        
        button.selected {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 12px 35px rgba(16, 185, 129, 0.5);
          animation: selectedPulse 0.6s ease-out;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }
        
        button:disabled:hover {
          transform: none;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }
        
        /* Button ripple effect */
        button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease;
          pointer-events: none;
        }
        
        button:active::before {
          width: 300px;
          height: 300px;
        }
        
        /* Buttons container improvements */
        .buttons-container {
          text-align: center;
          margin-top: 25px;
          padding: 15px;
        }
        
        /* Enhanced keyboard hint */
        .keyboard-hint {
          font-size: 13px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 8px;
          color: #374151;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #d1d5db;
        }
        
        /* Code View Improvements */
        .code-toggle {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 8px 16px;
          background: rgba(31, 41, 55, 0.9);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 20;
          backdrop-filter: blur(5px);
        }
        
        .code-view {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          color: #e5e7eb;
          padding: 20px;
          overflow: auto;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          border-radius: 8px;
        }
        
        /* Enhanced Animations */
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .design-container {
          animation: slideUp 0.6s ease-out both;
        }
        
        .design-container:nth-child(1) { animation-delay: 0.1s; }
        .design-container:nth-child(2) { animation-delay: 0.3s; }
        .design-container:nth-child(3) { animation-delay: 0.5s; }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .designs-container {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 0 10px;
          }
          
          h1 { font-size: 2rem; }
          .subtitle { font-size: 16px; }
          .design-container { padding: 20px; }
          .design-content { padding: 15px; min-height: 100px; }
        }
        
        /* Framework-specific adjustments */
        .design-component-1, .design-component-2, .design-component-3 {
          width: 100%;
          isolation: isolate;
        }
        
        /* Loading states */
        .loading-state {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
          vertical-align: middle;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes selectedPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        
        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 64px;
            min-width: 220px;
            font-size: 20px;
            padding: 20px 40px;
          }
          
          button:active {
            transform: scale(0.95);
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          }
          
          .design-container {
            padding: 30px;
          }
          
          .code-toggle {
            padding: 12px 20px;
            font-size: 14px;
            min-height: 44px;
          }
        }
        
        /* Zoom overlay improvements */
        .zoom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: none;
          z-index: 3000;
          backdrop-filter: blur(5px);
          padding: 40px;
          overflow: auto;
        }
        
        .zoom-content {
          background: white;
          border-radius: 16px;
          max-width: 95vw;
          margin: 0 auto;
          padding: 40px;
          position: relative;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        
        /* Extracted styles for each design - will be injected dynamically */
      </style>
    </head>
    <body>
      <div class="connection-status connecting" id="connectionStatus">
        <span class="loading-state"></span> Connecting...
      </div>
      
      <h1>UI Component Selection</h1>
      <p class="subtitle">Compare designs with framework compatibility</p>
      
      <div class="instructions">
        <p><strong>Choose your preferred component design.</strong> Each design is isolated and framework-compatible. 
        ${allFrameworks.length > 0 ? `Detected frameworks: <strong>${allFrameworks.join(', ')}</strong>` : 'No frameworks detected - vanilla CSS/HTML'}
        ${layoutType !== 'card' ? `<br><em>Using ${layoutType} layout for optimal ${layoutType === 'gallery' ? 'large component' : 'mixed component'} viewing.</em>` : ''}
        </p>
      </div>
      
      <div class="designs-container ${layoutType === 'mixed' ? 'mixed-layout' : layoutType + '-layout'}">
        <div class="design-container ${design1Layout}-layout" data-design="${sanitizeName(input.design_name_1)}" data-index="1" data-layout="${design1Layout}">
          <div class="design-name ${design1Layout}-layout">
            ${sanitizeName(input.design_name_1)}
            <span class="keyboard-hint">Press 1</span>
          </div>
          
          <div class="framework-badges">
            ${design1Frameworks.length > 0
        ? design1Frameworks.map(fw => `<span class="framework-badge ${fw}">${fw}</span>`).join('')
        : '<span class="framework-badge vanilla">Vanilla CSS</span>'}
            <span class="layout-badge ${design1Layout}">${design1Layout === 'gallery' ? '🖼️ Gallery' : '📝 Card'}</span>
          </div>
          
          <div class="design-content ${design1Layout}-layout" data-framework="${design1Frameworks.join(',')}" data-index="1">
            <button class="code-toggle" onclick="toggleCode(event, 1)">View Code</button>
            ${wrappedDesign1}
            <div class="code-view" id="codeView1">
              <button class="copy-button" onclick="copyCode(event, '${encodedDesign1}')">Copy HTML</button>
              <pre><code>${escapeHtml(input.design_html_1)}</code></pre>
            </div>
          </div>
          
          <div class="buttons-container ${design1Layout}-layout">
            <button id="btn1" onclick="selectDesign('${sanitizeName(input.design_name_1)}', 'btn1', '${encodedDesign1}')">
              Select This Design
            </button>
          </div>
        </div>

        <div class="design-container ${design2Layout}-layout" data-design="${sanitizeName(input.design_name_2)}" data-index="2" data-layout="${design2Layout}">
          <div class="design-name ${design2Layout}-layout">
            ${sanitizeName(input.design_name_2)}
            <span class="keyboard-hint">Press 2</span>
          </div>
          
          <div class="framework-badges">
            ${design2Frameworks.length > 0
        ? design2Frameworks.map(fw => `<span class="framework-badge ${fw}">${fw}</span>`).join('')
        : '<span class="framework-badge vanilla">Vanilla CSS</span>'}
            <span class="layout-badge ${design2Layout}">${design2Layout === 'gallery' ? '🖼️ Gallery' : '📝 Card'}</span>
          </div>
          
          <div class="design-content ${design2Layout}-layout" data-framework="${design2Frameworks.join(',')}" data-index="2">
            <button class="code-toggle" onclick="toggleCode(event, 2)">View Code</button>
            ${wrappedDesign2}
            <div class="code-view" id="codeView2">
              <button class="copy-button" onclick="copyCode(event, '${encodedDesign2}')">Copy HTML</button>
              <pre><code>${escapeHtml(input.design_html_2)}</code></pre>
            </div>
          </div>
          
          <div class="buttons-container ${design2Layout}-layout">
            <button id="btn2" onclick="selectDesign('${sanitizeName(input.design_name_2)}', 'btn2', '${encodedDesign2}')">
              Select This Design
            </button>
          </div>
        </div>

        <div class="design-container ${design3Layout}-layout" data-design="${sanitizeName(input.design_name_3)}" data-index="3" data-layout="${design3Layout}">
          <div class="design-name ${design3Layout}-layout">
            ${sanitizeName(input.design_name_3)}
            <span class="keyboard-hint">Press 3</span>
          </div>
          
          <div class="framework-badges">
            ${design3Frameworks.length > 0
        ? design3Frameworks.map(fw => `<span class="framework-badge ${fw}">${fw}</span>`).join('')
        : '<span class="framework-badge vanilla">Vanilla CSS</span>'}
            <span class="layout-badge ${design3Layout}">${design3Layout === 'gallery' ? '🖼️ Gallery' : '📝 Card'}</span>
          </div>
          
          <div class="design-content ${design3Layout}-layout" data-framework="${design3Frameworks.join(',')}" data-index="3">
            <button class="code-toggle" onclick="toggleCode(event, 3)">View Code</button>
            ${wrappedDesign3}
            <div class="code-view" id="codeView3">
              <button class="copy-button" onclick="copyCode(event, '${encodedDesign3}')">Copy HTML</button>
              <pre><code>${escapeHtml(input.design_html_3)}</code></pre>
            </div>
          </div>
          
          <div class="buttons-container ${design3Layout}-layout">
            <button id="btn3" onclick="selectDesign('${sanitizeName(input.design_name_3)}', 'btn3', '${encodedDesign3}')">
              Select This Design
            </button>
          </div>
        </div>
      </div>
      
      <div class="zoom-overlay" id="zoomOverlay" onclick="closeZoom()">
        <div class="zoom-content" onclick="event.stopPropagation()">
          <button class="zoom-close" onclick="closeZoom()">✕</button>
          <div id="zoomContentInner"></div>
        </div>
      </div>

      <script>
        ${generateDecodeFunction()}
        
        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let selectedDesignData = null;
        
        // Enhanced WebSocket connection with better error handling
        function connectWebSocket() {
          const wsUrl = 'ws://' + window.location.host;
          ws = new WebSocket(wsUrl);
          
          ws.onopen = function() {
            console.log('WebSocket connected');
            reconnectAttempts = 0;
            updateConnectionStatus('connected', '🟢 Connected');
          };
          
          ws.onclose = function() {
            console.log('WebSocket disconnected');
            updateConnectionStatus('disconnected', '🔴 Disconnected');
            
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              setTimeout(connectWebSocket, 2000);
              updateConnectionStatus('connecting', '🟡 Reconnecting...');
            }
          };
          
          ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            updateConnectionStatus('disconnected', '❌ Connection Error');
          };
          
          ws.onmessage = function(event) {
            try {
              const data = JSON.parse(event.data);
              console.log('WebSocket message:', data);
              
              if (data.type === 'selection-confirmed') {
                showSuccessAnimation();
                setTimeout(() => window.close(), 2000);
              } else if (data.type === 'finalized') {
                window.close();
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
        }
        
        function updateConnectionStatus(status, text) {
          const statusEl = document.getElementById('connectionStatus');
          statusEl.className = 'connection-status ' + status;
          statusEl.innerHTML = status === 'connecting' 
            ? '<span class="loading-state"></span> ' + text
            : text;
        }
        
        function showSuccessAnimation() {
          const feedback = document.createElement('div');
          feedback.className = 'success-animation';
          feedback.innerHTML = '🎉 Selection Confirmed!';
          feedback.style.cssText = \`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px 50px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: 700;
            box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
            z-index: 4000;
            animation: successPulse 2s ease-out;
          \`;
          document.body.appendChild(feedback);
          
          setTimeout(() => feedback.remove(), 2000);
        }
        
        function toggleCode(event, index) {
          event.stopPropagation();
          const codeView = document.getElementById('codeView' + index);
          const isShowing = codeView.style.display === 'block';
          
          codeView.style.display = isShowing ? 'none' : 'block';
          event.target.textContent = isShowing ? 'View Code' : 'Hide Code';
        }
        
        function copyCode(event, encodedHtml) {
          event.stopPropagation();
          const html = safeDecode(encodedHtml);
          
          navigator.clipboard.writeText(html).then(() => {
            const originalText = event.target.textContent;
            event.target.textContent = '✅ Copied!';
            event.target.style.background = '#10b981';
            
            setTimeout(() => {
              event.target.textContent = originalText;
              event.target.style.background = '';
            }, 2000);
          }).catch(err => {
            console.error('Copy failed:', err);
            alert('Copy failed. Please try selecting the code manually.');
          });
        }
        
        function selectDesign(name, btnId, encodedHtml) {
          console.log('Design selected:', name);
          
          selectedDesignData = {
            name: name,
            html: safeDecode(encodedHtml),
            timestamp: new Date().toISOString(),
            frameworks: document.querySelector(\`[data-design="\${name}"]\`).dataset.framework
          };
          
          // Update UI immediately
          document.querySelectorAll('.design-container').forEach(container => {
            container.classList.remove('selected');
          });
          document.querySelector(\`[data-design="\${name}"]\`).classList.add('selected');
          
          document.querySelectorAll('button[id^="btn"]').forEach(btn => btn.disabled = true);
          document.getElementById(btnId).innerHTML = '✅ Selected';
          document.getElementById(btnId).classList.add('selected');
          
          // Send selection
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'selection',
              selectedDesign: name,
              frameworks: selectedDesignData.frameworks
            }));
          } else {
            // Fallback HTTP POST
            fetch('/design-selection-result', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                selectedDesign: name,
                frameworks: selectedDesignData.frameworks 
              })
            })
            .then(response => response.json())
            .then(() => {
              showSuccessAnimation();
              setTimeout(() => window.close(), 2000);
            })
            .catch(error => {
              console.error('Selection error:', error);
              alert('Error submitting selection. Please try again.');
              // Re-enable UI
              document.querySelectorAll('button[id^="btn"]').forEach(btn => {
                btn.disabled = false;
                btn.innerHTML = 'Select This Design';
                btn.classList.remove('selected');
              });
            });
          }
        }
        
        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', function(event) {
          if (event.key >= '1' && event.key <= '3') {
            const index = parseInt(event.key);
            const btn = document.getElementById('btn' + index);
            if (btn && !btn.disabled) {
              btn.click();
            }
          } else if (event.key === 'Escape') {
            closeZoom();
          }
        });
        
        // Zoom functionality with framework preservation
        document.querySelectorAll('.design-container').forEach(container => {
          container.addEventListener('click', function(event) {
            if (event.target.closest('button') || event.target.closest('.code-view')) {
              return;
            }
            
            const zoomOverlay = document.getElementById('zoomOverlay');
            const zoomContent = document.getElementById('zoomContentInner');
            const designContent = container.querySelector('.design-content');
            
            zoomContent.innerHTML = designContent.innerHTML;
            zoomOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
          });
        });
        
        function closeZoom() {
          document.getElementById('zoomOverlay').style.display = 'none';
          document.body.style.overflow = '';
        }
        
        ${styleInjectionScript}
        
        // Initialize
        injectDynamicStyles();
        connectWebSocket();
        
        // Add success animation CSS
        const successStyle = document.createElement('style');
        successStyle.textContent = \`
          @keyframes successPulse {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        \`;
        document.head.appendChild(successStyle);
        
        console.log('UI Component Selection initialized with frameworks:', '${allFrameworks.join(', ')}');
      </script>
    </body>
    </html>
  `;
}
function escapeHtml(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
