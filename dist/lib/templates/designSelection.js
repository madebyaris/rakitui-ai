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
function sanitizeUrl(url) {
    const trimmed = url.trim();
    if (!trimmed)
        return null;
    if (!/^https?:\/\//i.test(trimmed))
        return null;
    return trimmed;
}
function guessComponentType(html) {
    const lower = html.toLowerCase();
    if (lower.includes('<table'))
        return 'table';
    if (lower.includes('<form') || lower.includes('<input') || lower.includes('<select') || lower.includes('<textarea'))
        return 'form';
    if (lower.includes('<nav') || lower.includes('navbar') || lower.includes('nav-'))
        return 'navigation';
    if (lower.includes('role="dialog"') || lower.includes('aria-modal') || lower.includes('modal'))
        return 'modal';
    if (lower.includes('card') || lower.includes('shadow'))
        return 'card';
    if (lower.includes('<button') || lower.includes('btn'))
        return 'button';
    if (lower.includes('layout') || lower.includes('grid') || lower.includes('flex'))
        return 'layout';
    return 'component';
}
function analyzeHtmlReference(html, purposeInclude) {
    const lower = html.toLowerCase();
    const elementCount = (html.match(/<[^\/][^>]*>/g) || []).length;
    const textLength = html.replace(/<[^>]*>/g, '').trim().length;
    const interactiveCount = (html.match(/<(button|a|input|select|textarea)[\s>]/gi) || []).length;
    const detectedElements = [];
    if (lower.includes('<button') || lower.includes('btn'))
        detectedElements.push('button');
    if (lower.includes('<form') || lower.includes('<input') || lower.includes('<select') || lower.includes('<textarea'))
        detectedElements.push('form');
    if (lower.includes('<nav') || lower.includes('navbar') || lower.includes('nav-'))
        detectedElements.push('navigation');
    if (lower.includes('<table'))
        detectedElements.push('table');
    if (lower.includes('<img') || lower.includes('background-image'))
        detectedElements.push('image');
    if (lower.includes('role="dialog"') || lower.includes('aria-modal') || lower.includes('modal'))
        detectedElements.push('modal');
    if (lower.includes('<ul') || lower.includes('<ol'))
        detectedElements.push('list');
    if (lower.includes('card'))
        detectedElements.push('card');
    const componentType = guessComponentType(html);
    const expectedElements = [];
    switch (componentType) {
        case 'form':
            expectedElements.push('label', 'input', 'error state', 'focus state');
            break;
        case 'navigation':
            expectedElements.push('nav items', 'active state', 'focus state', 'responsive menu');
            break;
        case 'modal':
            expectedElements.push('dialog role', 'close button', 'focus trap', 'backdrop');
            break;
        case 'table':
            expectedElements.push('thead/tbody', 'row hover', 'responsive wrapper');
            break;
        case 'card':
            expectedElements.push('title', 'content', 'visual hierarchy');
            break;
        case 'button':
            expectedElements.push('hover state', 'focus state', 'active state');
            break;
        default:
            expectedElements.push('clear hierarchy', 'responsive layout', 'focus states');
    }
    const missingElements = [];
    if (componentType === 'form' && !lower.includes('<label'))
        missingElements.push('labels');
    if (componentType === 'modal' && !lower.includes('aria-modal'))
        missingElements.push('aria-modal');
    if (componentType === 'navigation' && !lower.includes('<nav'))
        missingElements.push('nav element');
    if (componentType === 'table' && !lower.includes('<thead'))
        missingElements.push('table header');
    if (componentType === 'button' && !lower.includes('focus'))
        missingElements.push('focus styling');
    if (purposeInclude && purposeInclude.length > 0) {
        const textOnly = html.replace(/<[^>]*>/g, ' ').toLowerCase();
        purposeInclude.forEach((item) => {
            const needle = item.toLowerCase().trim();
            if (!needle)
                return;
            if (!lower.includes(needle) && !textOnly.includes(needle)) {
                missingElements.push(`purpose: ${item}`);
            }
        });
    }
    return {
        componentType,
        elementCount,
        textLength,
        interactiveCount,
        detectedElements,
        expectedElements,
        missingElements,
    };
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
    // HTML reference summaries
    const design1Reference = analyzeHtmlReference(input.design_html_1, input.purpose?.include);
    const design2Reference = analyzeHtmlReference(input.design_html_2, input.purpose?.include);
    const design3Reference = analyzeHtmlReference(input.design_html_3, input.purpose?.include);
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
    const viewMode = input.view_mode || 'responsive';
    const purpose = input.purpose;
    const safeReferences = (input.references || [])
        .map((ref) => {
        const safeUrl = sanitizeUrl(ref.url || '');
        if (!safeUrl)
            return null;
        return {
            title: escapeHtml(ref.title || safeUrl),
            url: safeUrl,
            reason: ref.reason ? escapeHtml(ref.reason) : '',
            source: ref.source ? escapeHtml(ref.source) : '',
        };
    })
        .filter((ref) => Boolean(ref));
    const hasPurpose = Boolean(purpose?.include?.length || purpose?.exclude?.length || purpose?.notes);
    const hasReferences = Boolean(safeReferences.length || input.reference_error);
    const purposeSection = hasPurpose ? `
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Purpose</p>
          <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Include</p>
              <ul class="mt-2 space-y-1">
                ${(purpose?.include && purpose.include.length > 0)
        ? purpose.include.map((item) => `<li>• ${escapeHtml(item)}</li>`).join('')
        : '<li class="text-slate-400 dark:text-slate-500">None specified</li>'}
              </ul>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Avoid</p>
              <ul class="mt-2 space-y-1">
                ${(purpose?.exclude && purpose.exclude.length > 0)
        ? purpose.exclude.map((item) => `<li>• ${escapeHtml(item)}</li>`).join('')
        : '<li class="text-slate-400 dark:text-slate-500">None specified</li>'}
              </ul>
            </div>
          </div>
          ${purpose?.notes ? `<p class="mt-3 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(purpose.notes)}</p>` : ''}
        </div>
      ` : '';
    const referencesSection = hasReferences ? `
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Auto Search References</p>
            <span class="text-xs text-slate-400 dark:text-slate-500">AI suggested, verify before use</span>
          </div>
          ${input.reference_error ? `<p class="mt-3 text-sm text-amber-600">${escapeHtml(input.reference_error)}</p>` : ''}
          <ul class="mt-3 space-y-3">
            ${safeReferences.length > 0
        ? safeReferences.map((ref) => `
                <li>
                  <a class="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300" href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title}</a>
                  ${ref.reason ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${ref.reason}</p>` : ''}
                  ${ref.source ? `<p class="text-[11px] text-slate-400 mt-1">Source: ${ref.source}</p>` : ''}
                </li>
              `).join('')
        : '<li class="text-sm text-slate-400 dark:text-slate-500">No references available.</li>'}
          </ul>
        </div>
      ` : '';
    const contextSection = (hasPurpose || hasReferences) ? `
      <section class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        ${purposeSection}
        ${referencesSection}
      </section>
    ` : '';
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
    <html class="light" lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Design Selection Gallery</title>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Noto+Sans:wght@300..800&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      ${allFrameworks.includes('bootstrap') ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' : ''}
      ${allFrameworks.includes('bulma') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">' : ''}
      ${allFrameworks.includes('foundation') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/css/foundation.min.css">' : ''}
      ${allFrameworks.includes('semantic-ui') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css">' : ''}
      <script id="tailwind-config">
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                primary: '#135bec',
                'background-light': '#f6f6f8',
                'background-dark': '#101622',
                'surface-light': '#ffffff',
                'surface-dark': '#1e293b',
              },
              fontFamily: {
                display: ['Manrope', 'Noto Sans', 'sans-serif'],
              },
              borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
              },
            },
          },
        }
      </script>
      <style>
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .dark ::-webkit-scrollbar-thumb { background-color: #334155; }
        
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out; }
        
        /* Framework Compatibility */
        ${frameworkCSS}
        
        /* Layout-Specific Styles */
        ${layoutCSS}
        
        /* Design Content Isolation */
        .design-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
          contain: layout style;
          position: relative;
          background: white;
          /* Critical for containing fixed position elements like headers */
          transform: translateZ(0);
        }
        
        .dark .design-content {
          background: #0f172a;
        }
        
        /* Design Preview Container - Matching Example */
        .design-preview-container {
          width: 100%;
          aspect-ratio: 4/3;
          background: #f3f4f6;
          overflow: hidden;
          position: relative;
        }
        
        .dark .design-preview-container {
          background: #1e293b;
        }
        
        .design-preview-container .design-content {
          width: 200%;
          height: 200%;
          transform: scale(0.5);
          transform-origin: top left;
          overflow: hidden;
          pointer-events: none; /* Prevent interaction in preview */
        }

        /* Modal Styles */
        .full-size-modal {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        .full-size-modal.active {
          opacity: 1;
          pointer-events: auto;
        }
        
        .full-size-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
        }
        
        .full-size-content {
          position: relative;
          width: 100%;
          max-width: 56rem; /* max-w-4xl */
          max-height: 90vh;
          background: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          transform: scale(0.95);
          transition: transform 0.3s ease;
          overflow: hidden;
        }
        
        .dark .full-size-content {
          background: #1e293b;
        }
        
        .full-size-modal.active .full-size-content {
          transform: scale(1);
        }

        /* Full size body adjustments */
        .full-size-body {
          flex: 1;
          overflow: auto;
          background: #f8fafc;
          position: relative;
          min-height: 400px;
        }

        .dark .full-size-body {
          background: #0f172a;
        }
        
        .full-size-body .design-content {
          width: 100%;
          height: auto;
          min-height: 100%;
          transform: none;
          pointer-events: auto;
          overflow: visible;
        }

        .viewport-frame {
          margin: 0 auto;
          width: 100%;
          max-width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          overflow: auto;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
          transition: width 0.2s ease;
        }

        .dark .viewport-frame {
          background: #0f172a;
          border-color: #334155;
        }

        .viewport-inner {
          min-height: 400px;
        }
        
        /* Code View Override */
        .code-view {
           background: #1e293b;
           color: #e2e8f0;
           padding: 1.5rem;
           overflow: auto;
           font-family: monospace;
           height: 100%;
        }
        
        .design-content[data-framework*="tailwind"] { font-size: 14px; }
        .design-content[data-framework*="bootstrap"] { font-size: 16px; }
        .design-content[data-framework*="bulma"] { font-size: 16px; }
        
        /* Modal System */
        .modal { opacity: 0; pointer-events: none; transition: all 0.3s; }
        .modal:target { opacity: 1; pointer-events: auto; }
        .modal:target .modal-content { transform: scale(1); }
        
        /* Framework Badges */
        .framework-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          padding: 0.25rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .framework-badge.tailwind { background: #dbeafe; color: #1e40af; }
        .dark .framework-badge.tailwind { background: #1e3a8a; color: #93c5fd; }
        
        .framework-badge.bootstrap { background: #f3e8ff; color: #6b21a8; }
        .dark .framework-badge.bootstrap { background: #6b21a8; color: #d8b4fe; }
        
        .framework-badge.bulma { background: #ccfbf1; color: #065f46; }
        .dark .framework-badge.bulma { background: #065f46; color: #5eead4; }
        
        .framework-badge.vanilla { background: #f1f5f9; color: #475569; }
        .dark .framework-badge.vanilla { background: #334155; color: #cbd5e1; }
        
        /* Connection Status */
        .connection-status {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }
        
        .connection-status.connected {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }
        
        .connection-status.disconnected {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }
        
        .connection-status.connecting {
          background: rgba(245, 158, 11, 0.9);
          color: white;
        }
        
        .loading-state {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Success Animation */
        @keyframes successPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        /* Loading State */
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 12px;
        }
        
        .dark .loading-overlay {
          background: rgba(15, 23, 42, 0.95);
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        .loading-text {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        .dark .loading-text {
          color: #9ca3af;
        }
        
        .generating-status {
          position: fixed;
          top: 80px;
          right: 1.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #92400e;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
        }
        
        .dark .generating-status {
          background: rgba(212, 175, 55, 0.15);
          color: #fbbf24;
        }
      </style>
    </head>
    <body class="font-display bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-[#e2e8f0] antialiased min-h-screen flex flex-col transition-colors duration-300">
      <div class="connection-status connecting" id="connectionStatus">
        <span class="loading-state"></span> Connecting...
      </div>
      
      <main class="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-10 lg:px-40 py-8 flex flex-col justify-center">
        <div class="flex flex-col gap-3 py-6 animate-fade-in-down">
          <h1 class="text-[#0d121b] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            ${input.is_loading ? 'Generating Designs...' : 'Choose Your Design'}
          </h1>
          <p class="text-[#4c669a] dark:text-slate-400 text-base md:text-lg font-normal leading-normal max-w-2xl">
            ${input.is_loading
        ? `Creating 3 unique designs with MiniMax-M2.1 based on: "${input.loading_prompt || 'your prompt'}"`
        : 'Select a design option. You can customize every detail later.'}
        </p>
      </div>
      
      ${input.is_loading ? `
        <div class="generating-status" id="generatingStatus">
          <span class="loading-state"></span>
          <span>Generating with MiniMax-M2.1...</span>
        </div>
      ` : ''}

        ${contextSection}
      
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <!-- Design 1 -->
          <div class="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-none dark:border dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${input.is_loading ? 'cursor-wait' : 'cursor-pointer'}" ${input.is_loading ? '' : `onclick="openFullSize(1, '${sanitizeName(input.design_name_1)}')"`} id="design-card-1">
            <div class="w-full aspect-[4/3] bg-gray-100 dark:bg-slate-800 overflow-hidden relative design-preview-container">
              ${input.is_loading ? `
                <div class="loading-overlay">
                  <div class="loading-spinner"></div>
                  <div class="loading-text">Generating...</div>
                </div>
              ` : ''}
               <div class="design-content" data-framework="${design1Frameworks.join(',')}" id="preview-1">
                 ${wrappedDesign1}
          </div>
               <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
            <div class="flex flex-col p-5 grow">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">Design Option 1</span>
            </div>
              <h3 class="text-[#0d121b] dark:text-white text-xl font-bold leading-tight mb-2">${sanitizeName(input.design_name_1)}</h3>
              <p class="text-[#4c669a] dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                 ${design1Frameworks.length > 0 ? `Built with ${design1Frameworks.join(' and ')}` : 'Pure CSS/HTML design'}
              </p>
              
              <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div class="flex -space-x-2">
                   <div class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-gray-300 flex items-center justify-center text-[10px] font-bold text-slate-600">AI</div>
                   <div class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">UI</div>
                </div>
                <button class="inline-flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm shadow-blue-500/30">
                  View Details
            </button>
          </div>
        </div>
          </div>
          
          <!-- Design 2 -->
          <div class="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-none dark:border dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${input.is_loading ? 'cursor-wait' : 'cursor-pointer'}" ${input.is_loading ? '' : `onclick="openFullSize(2, '${sanitizeName(input.design_name_2)}')"`} id="design-card-2">
            <div class="w-full aspect-[4/3] bg-gray-100 dark:bg-slate-800 overflow-hidden relative design-preview-container">
              ${input.is_loading ? `
                <div class="loading-overlay">
                  <div class="loading-spinner"></div>
                  <div class="loading-text">Generating...</div>
                </div>
              ` : ''}
               <div class="design-content" data-framework="${design2Frameworks.join(',')}" id="preview-2">
            ${wrappedDesign2}
            </div>
               <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
            <div class="flex flex-col p-5 grow">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">Design Option 2</span>
              </div>
              <h3 class="text-[#0d121b] dark:text-white text-xl font-bold leading-tight mb-2">${sanitizeName(input.design_name_2)}</h3>
              <p class="text-[#4c669a] dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                 ${design2Frameworks.length > 0 ? `Built with ${design2Frameworks.join(' and ')}` : 'Pure CSS/HTML design'}
              </p>
              
              <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div class="flex -space-x-2">
                   <div class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-gray-300 flex items-center justify-center text-[10px] font-bold text-slate-600">AI</div>
                   <div class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">UI</div>
                </div>
                <button class="inline-flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm shadow-blue-500/30">
                  View Details
            </button>
              </div>
          </div>
        </div>

          <!-- Design 3 -->
          <div class="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-none dark:border dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${input.is_loading ? 'cursor-wait' : 'cursor-pointer'}" ${input.is_loading ? '' : `onclick="openFullSize(3, '${sanitizeName(input.design_name_3)}')"`} id="design-card-3">
            <div class="w-full aspect-[4/3] bg-gray-100 dark:bg-slate-800 overflow-hidden relative design-preview-container">
              ${input.is_loading ? `
                <div class="loading-overlay">
                  <div class="loading-spinner"></div>
                  <div class="loading-text">Generating...</div>
                </div>
              ` : ''}
               <div class="design-content" data-framework="${design3Frameworks.join(',')}" id="preview-3">
                 ${wrappedDesign3}
               </div>
               <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
            <div class="flex flex-col p-5 grow">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">Design Option 3</span>
          </div>
              <h3 class="text-[#0d121b] dark:text-white text-xl font-bold leading-tight mb-2">${sanitizeName(input.design_name_3)}</h3>
              <p class="text-[#4c669a] dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                 ${design3Frameworks.length > 0 ? `Built with ${design3Frameworks.join(' and ')}` : 'Pure CSS/HTML design'}
              </p>
              
              <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div class="flex -space-x-2">
                   <div class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-gray-300 flex items-center justify-center text-[10px] font-bold text-slate-600">AI</div>
                   <div class="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">UI</div>
            </div>
                <button class="inline-flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm shadow-blue-500/30">
                  View Details
                </button>
          </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Full Size Modal -->
      <div class="full-size-modal" id="fullSizeModal" onclick="closeFullSize()">
        <div class="full-size-backdrop"></div>
        <div class="full-size-content" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
             <h3 class="text-xl font-bold text-slate-900 dark:text-white" id="modalTitle">Design Preview</h3>
             <div class="flex gap-2">
                <button class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500" onclick="toggleModalCode()" title="View Code">
                   <span class="material-symbols-outlined text-xl">code</span>
                </button>
                <button class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500" onclick="closeFullSize()" title="Close">
                   <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">HTML Reference</p>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1" id="htmlReferenceSummary">Component summary</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mode</span>
                <div class="inline-flex rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                  <button class="px-3 py-1 text-xs font-semibold rounded-full text-slate-600 dark:text-slate-200" id="viewDesktopBtn" onclick="setViewMode('desktop')">Desktop</button>
                  <button class="px-3 py-1 text-xs font-semibold rounded-full text-slate-600 dark:text-slate-200" id="viewMobileBtn" onclick="setViewMode('mobile')">Mobile</button>
                  <button class="px-3 py-1 text-xs font-semibold rounded-full text-slate-600 dark:text-slate-200" id="viewResponsiveBtn" onclick="setViewMode('responsive')">Responsive</button>
                </div>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <label for="viewportRange" class="font-semibold uppercase tracking-wide">Width</label>
              <input id="viewportRange" type="range" min="320" max="1280" step="10" class="flex-1">
              <span id="viewportValue" class="min-w-[52px] text-right font-semibold">100%</span>
            </div>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Detected</p>
                <ul class="mt-2 space-y-1" id="htmlReferenceList"></ul>
              </div>
              <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Expectations</p>
                <ul class="mt-2 space-y-1" id="htmlExpectationsList"></ul>
                <div id="htmlMissingWrap" class="mt-3 hidden">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Potentially Missing</p>
                  <ul class="mt-2 space-y-1 text-amber-600" id="htmlMissingList"></ul>
                </div>
              </div>
            </div>
          </div>
          
          <div class="full-size-body">
             <div id="modalContent"></div>
             <div id="modalCode" class="hidden absolute inset-0 z-10"></div>
      </div>
      
          <div class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-surface-light dark:bg-surface-dark">
             <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span class="material-symbols-outlined text-lg">devices</span>
                <span>Responsive Design</span>
             </div>
             <div class="flex gap-3">
                <button class="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onclick="closeFullSize()">Cancel</button>
                <button id="modalSelectBtn" class="px-6 py-2 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors shadow-lg shadow-blue-500/20">
                   Use Template
                </button>
             </div>
          </div>
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
              
              if (data.type === 'connected') {
                // Request designs if in loading state
                if (${input.is_loading ? 'true' : 'false'}) {
                  ws.send(JSON.stringify({ type: 'request-designs' }));
                }
              } else if (data.type === 'designs-ready') {
                updateDesignsFromWebSocket(data);
              } else if (data.type === 'selection-confirmed') {
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
        
        function updateDesignsFromWebSocket(data) {
          console.log('Updating designs from WebSocket:', data);
          
          // Hide loading status
          const generatingStatus = document.getElementById('generatingStatus');
          if (generatingStatus) {
            generatingStatus.style.display = 'none';
          }
          
          // Update title
          const title = document.querySelector('h1');
          if (title) {
            title.textContent = 'Choose Your Design';
          }
          
          const subtitle = document.querySelector('main p');
          if (subtitle) {
            subtitle.textContent = 'Select a design option. You can customize every detail later.';
          }
          
          if (data.error) {
            // Show error state
            [1, 2, 3].forEach((idx) => {
              const card = document.getElementById('design-card-' + idx);
              const preview = document.getElementById('preview-' + idx);
              const nameEl = card?.querySelector('h3');
              if (card && preview && nameEl) {
                card.classList.remove('cursor-wait');
                card.classList.add('cursor-pointer');
                card.onclick = () => openFullSize(idx, 'Error');
                preview.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;">' + escapeHtml(data.error) + '</div>';
                nameEl.textContent = 'Generation Failed';
              }
            });
            return;
          }
          
          if (data.designs && data.designs.length >= 3) {
            // Update each design card
            data.designs.forEach((design, index) => {
              const idx = index + 1;
              const card = document.getElementById('design-card-' + idx);
              const preview = document.getElementById('preview-' + idx);
              const nameEl = card?.querySelector('h3');
              const loadingOverlay = card?.querySelector('.loading-overlay');
              
              if (card && preview && nameEl) {
                // Remove loading overlay
                if (loadingOverlay) {
                  loadingOverlay.remove();
                }
                
                // Update design content
                preview.innerHTML = design.html;
                nameEl.textContent = design.name || 'Design ' + idx;
                
                // Make card interactive
                card.classList.remove('cursor-wait');
                card.classList.add('cursor-pointer');
                card.onclick = () => openFullSize(idx, design.name);
                
                // Update encoded design data
                designs[idx] = {
                  name: design.name,
                  code: btoa(encodeURIComponent(design.html)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '')
                };
                
                // Update HTML reference analysis
                const ref = analyzeHtmlReference(design.html);
                designReferences[idx] = ref;
              }
            });
            
            // Update references section if available
            if (data.references && data.references.length > 0) {
              const referencesSection = document.querySelector('.references-section');
              if (referencesSection) {
                const refList = referencesSection.querySelector('ul');
                if (refList) {
                  refList.innerHTML = data.references.map((ref) => 
                    '<li><a href="' + escapeHtml(ref.url) + '" target="_blank">' + escapeHtml(ref.title) + '</a></li>'
                  ).join('');
                }
              }
            }
          }
        }
        
        function analyzeHtmlReference(html) {
          const lower = html.toLowerCase();
          const elementCount = (html.match(/<[^\\/][^>]*>/g) || []).length;
          const textLength = html.replace(/<[^>]*>/g, '').trim().length;
          const interactiveCount = (html.match(/<(button|a|input|select|textarea)[\\s>]/gi) || []).length;
          
          const detectedElements = [];
          if (lower.includes('<button') || lower.includes('btn')) detectedElements.push('button');
          if (lower.includes('<form') || lower.includes('<input')) detectedElements.push('form');
          if (lower.includes('<nav')) detectedElements.push('navigation');
          if (lower.includes('<table')) detectedElements.push('table');
          if (lower.includes('<img')) detectedElements.push('image');
          
          const componentType = lower.includes('<table') ? 'table' :
                               lower.includes('<form') ? 'form' :
                               lower.includes('<nav') ? 'navigation' :
                               lower.includes('<button') ? 'button' : 'component';
          
          const expectedElements = componentType === 'form' ? ['label', 'input', 'error state'] :
                                   componentType === 'navigation' ? ['nav items', 'active state'] :
                                   componentType === 'button' ? ['hover state', 'focus state'] :
                                   ['clear hierarchy', 'responsive layout'];
          
          return {
            componentType: componentType,
            elementCount: elementCount,
            textLength: textLength,
            interactiveCount: interactiveCount,
            detectedElements: detectedElements,
            expectedElements: expectedElements,
            missingElements: []
          };
        }
        
        let currentDesignIndex = null;
        let designs = {
          1: { name: '${sanitizeName(input.design_name_1)}', code: '${encodedDesign1}' },
          2: { name: '${sanitizeName(input.design_name_2)}', code: '${encodedDesign2}' },
          3: { name: '${sanitizeName(input.design_name_3)}', code: '${encodedDesign3}' }
        };

        const designReferences = ${JSON.stringify({
        1: design1Reference,
        2: design2Reference,
        3: design3Reference
    })};
        const initialViewMode = ${JSON.stringify(viewMode)};
        let currentViewMode = initialViewMode;
        let currentViewportWidth = initialViewMode === 'mobile' ? 375 : initialViewMode === 'desktop' ? 1024 : 1000;

        function openFullSize(index, name) {
          currentDesignIndex = index;
          const modal = document.getElementById('fullSizeModal');
          const modalTitle = document.getElementById('modalTitle');
          const modalContent = document.getElementById('modalContent');
          const modalCode = document.getElementById('modalCode');
          const selectBtn = document.getElementById('modalSelectBtn');
          const preview = document.getElementById('preview-' + index);
          
          if (!preview) return;
          
          modalTitle.textContent = name;
          
          // clear previous content
          modalContent.innerHTML = '';
          
          // Create a wrapper with the design-content class to ensure styles/containment apply
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'design-content';
          // Preserve framework data attribute for specific styling
          if (preview.dataset.framework) {
            contentWrapper.dataset.framework = preview.dataset.framework;
          }
          contentWrapper.innerHTML = preview.innerHTML;

          const viewportFrame = document.createElement('div');
          viewportFrame.id = 'viewportFrame';
          viewportFrame.className = 'viewport-frame';
          const viewportInner = document.createElement('div');
          viewportInner.className = 'viewport-inner';
          viewportInner.appendChild(contentWrapper);
          viewportFrame.appendChild(viewportInner);
          modalContent.appendChild(viewportFrame);
          
          // Inject code into modal code view
          const encodedCode = designs[index].code;
          const decodedCode = decodeURIComponent(encodedCode);
          modalCode.innerHTML = '<pre><code class="language-html">' + escapeHtml(decodedCode) + '</code></pre>';
          
          // Setup select button
          if (selectBtn) {
            selectBtn.onclick = function() {
               selectDesign(name, 'modal', encodedCode);
            };
          }
          
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';

          updateReferencePanel(index);
          setupViewportControls();
        }
        
        function closeFullSize() {
          const modal = document.getElementById('fullSizeModal');
          modal.classList.remove('active');
          document.body.style.overflow = '';
          
          // Reset code view in modal
          const modalCode = document.getElementById('modalCode');
          const modalContent = document.getElementById('modalContent');
          if (modalCode && modalContent) {
            modalCode.classList.add('hidden');
            modalContent.classList.remove('hidden');
          }
        }
        
        function toggleModalCode() {
           const modalContent = document.getElementById('modalContent');
           const modalCode = document.getElementById('modalCode');
           
           if (modalCode.classList.contains('hidden')) {
              modalCode.classList.remove('hidden');
              modalContent.classList.add('hidden');
           } else {
              modalCode.classList.add('hidden');
              modalContent.classList.remove('hidden');
           }
        }

        function updateReferencePanel(index) {
          const ref = designReferences[index];
          if (!ref) return;

          const summaryEl = document.getElementById('htmlReferenceSummary');
          summaryEl.textContent = 'Component: ' + ref.componentType + ' • ' + ref.elementCount + ' elements • ' + ref.interactiveCount + ' interactive';

          const detectedList = document.getElementById('htmlReferenceList');
          const expectedList = document.getElementById('htmlExpectationsList');
          const missingWrap = document.getElementById('htmlMissingWrap');
          const missingList = document.getElementById('htmlMissingList');

          detectedList.innerHTML = '';
          expectedList.innerHTML = '';
          missingList.innerHTML = '';

          if (ref.detectedElements.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No elements detected';
            detectedList.appendChild(li);
          } else {
            ref.detectedElements.forEach((item) => {
              const li = document.createElement('li');
              li.textContent = '• ' + item;
              detectedList.appendChild(li);
            });
          }

          ref.expectedElements.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = '• ' + item;
            expectedList.appendChild(li);
          });

          if (ref.missingElements.length > 0) {
            missingWrap.classList.remove('hidden');
            ref.missingElements.forEach((item) => {
              const li = document.createElement('li');
              li.textContent = '• ' + item;
              missingList.appendChild(li);
            });
          } else {
            missingWrap.classList.add('hidden');
          }
        }

        function setupViewportControls() {
          const range = document.getElementById('viewportRange');
          const value = document.getElementById('viewportValue');
          const frame = document.getElementById('viewportFrame');
          if (!range || !value || !frame) return;

          range.value = String(currentViewMode === 'responsive' ? 1000 : currentViewportWidth);
          updateViewportValueLabel();
          applyViewportMode(currentViewMode);

          range.oninput = function() {
            currentViewportWidth = parseInt(range.value, 10);
            currentViewMode = 'custom';
            frame.style.width = currentViewportWidth + 'px';
            updateViewportValueLabel();
            updateViewModeButtons();
          };
        }

        function updateViewportValueLabel() {
          const value = document.getElementById('viewportValue');
          const frame = document.getElementById('viewportFrame');
          if (!value || !frame) return;

          if (currentViewMode === 'responsive') {
            value.textContent = '100%';
          } else {
            value.textContent = currentViewportWidth + 'px';
          }
        }

        function updateViewModeButtons() {
          const desktopBtn = document.getElementById('viewDesktopBtn');
          const mobileBtn = document.getElementById('viewMobileBtn');
          const responsiveBtn = document.getElementById('viewResponsiveBtn');
          if (!desktopBtn || !mobileBtn || !responsiveBtn) return;

          const buttons = [desktopBtn, mobileBtn, responsiveBtn];
          buttons.forEach((btn) => btn.classList.remove('bg-blue-600', 'text-white'));

          if (currentViewMode === 'desktop') desktopBtn.classList.add('bg-blue-600', 'text-white');
          if (currentViewMode === 'mobile') mobileBtn.classList.add('bg-blue-600', 'text-white');
          if (currentViewMode === 'responsive') responsiveBtn.classList.add('bg-blue-600', 'text-white');
        }

        function applyViewportMode(mode) {
          const frame = document.getElementById('viewportFrame');
          if (!frame) return;

          if (mode === 'responsive') {
            frame.style.width = '100%';
          } else {
            frame.style.width = currentViewportWidth + 'px';
          }
          updateViewModeButtons();
          updateViewportValueLabel();
        }

        function setViewMode(mode) {
          currentViewMode = mode;
          if (mode === 'mobile') currentViewportWidth = 375;
          if (mode === 'desktop') currentViewportWidth = 1024;
          applyViewportMode(mode);
          const range = document.getElementById('viewportRange');
          if (range) {
            range.value = mode === 'responsive' ? '1000' : String(currentViewportWidth);
          }
        }
        
        function escapeHtml(text) {
          const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
          };
          return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
        
        function copyCode(event, encodedHtml) {
          event.stopPropagation();
          const html = safeDecode(encodedHtml);
          
          navigator.clipboard.writeText(html).then(() => {
            const originalText = event.target.textContent;
            event.target.textContent = 'Copied!';
            event.target.classList.add('bg-green-700');
            
            setTimeout(() => {
              event.target.textContent = originalText;
              event.target.classList.remove('bg-green-700');
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
            frameworks: document.querySelector(\`[data-design="\${name}"]\`)?.dataset?.framework || ''
          };
          
          // Update UI immediately
          document.querySelectorAll('[data-design]').forEach(container => {
            container.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          });
          const selectedContainer = document.querySelector(\`[data-design="\${name}"]\`);
          if (selectedContainer) {
            selectedContainer.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          }
          
          document.querySelectorAll('button[id^="btn"]').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
          });
          
          const selectedBtn = document.getElementById(btnId);
          if (selectedBtn) {
            selectedBtn.innerHTML = '✓ Selected';
            selectedBtn.classList.remove('bg-primary', 'hover:bg-blue-700');
            selectedBtn.classList.add('bg-green-600', 'hover:bg-green-700');
          }
          
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
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                if (btn.id === btnId) {
                  btn.innerHTML = 'Select Design';
                  btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                  btn.classList.add('bg-primary', 'hover:bg-blue-700');
                }
              });
            });
          }
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(event) {
          if (event.key >= '1' && event.key <= '3') {
            const index = parseInt(event.key);
            const btn = document.getElementById('btn' + index);
            if (btn && !btn.disabled) {
              btn.click();
            }
          } else if (event.key === 'Escape') {
            const modal = document.getElementById('fullSizeModal');
            if (modal.classList.contains('active')) {
              closeFullSize();
            } else {
              document.querySelectorAll('.code-view').forEach(cv => {
                cv.classList.remove('active');
                const previewId = cv.id.replace('codeView', 'preview-');
                const preview = document.getElementById(previewId);
                if (preview) preview.style.display = 'block';
              });
            }
          }
        });
        
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
