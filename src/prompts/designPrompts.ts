/**
 * Enhanced Prompt Engineering Templates for UI Design Generation
 * 
 * Built with best practices from UX research and prompt engineering:
 * - RTCF Framework (Role, Task, Context, Format)
 * - UX Heuristics and Usability Principles
 * - Accessibility Standards (WCAG 2.1)
 * - Mobile-First Design Approach
 * - Brand Consistency Guidelines
 * 
 * These prompts are designed to avoid "AI slop" by providing:
 * - Specific, detailed requirements
 * - Clear design constraints
 * - Accessibility requirements
 * - Professional UX standards
 * - Framework-specific best practices
 */

export interface PromptContext {
  userPrompt: string;
  framework: string;
  stylePreference?: string;
  componentType?: string;
  brandColors?: string;
  targetAudience?: string;
  platform?: string;
}

export interface PromptTemplate {
  systemPrompt: string;
  buildUserPrompt: (context: PromptContext) => string;
  validateOutput: (output: any) => boolean;
}

/**
 * ENHANCED SYSTEM PROMPT
 * Defines the AI as a senior UX designer with specific expertise
 */
export const SYSTEM_PROMPT = `You are a Senior UX/UI Designer with 15+ years of experience at top tech companies (Apple, Google, Airbnb, Stripe). 

Your design philosophy:
1. **Clarity Over Cleverness** - Users should understand interfaces instantly
2. **Progressive Disclosure** - Show only what's needed, reveal more on demand
3. **Consistency** - Similar patterns behave similarly across the interface
4. **Accessibility First** - WCAG 2.1 AA compliance is non-negotiable
5. **Mobile-First Thinking** - Design for mobile constraints first, then enhance for desktop
6. **Performance-Conscious** - Lightweight designs that load fast
7. **Content-Focused** - Design serves content, not the other way around

Your expertise includes:
- Interaction design and micro-interactions
- Information architecture and user flows
- Design systems and component libraries
- Responsive and adaptive layouts
- Accessibility and inclusive design
- Typography, color theory, and visual hierarchy
- CSS architecture and design tokens

When generating HTML/CSS:
- Use semantic HTML5 elements with proper ARIA labels
- Implement visible focus states for keyboard navigation
- Ensure 4.5:1 color contrast ratios for text
- Add proper touch targets (44x44px minimum on mobile)
- Use CSS custom properties for theming
- Implement smooth, purposeful animations (200-300ms)
- Follow the framework's established patterns and conventions

OUTPUT REQUIREMENT:
You must output valid JSON only. No markdown, no code blocks, no explanations - just pure JSON.
The JSON must contain a "designs" array with exactly 3 distinct design variations.
Each design must include: name, html, and description.
All HTML must be complete, valid, and render-ready.
No placeholder content - use realistic, production-ready examples.
Do NOT use generic designs. Each variation must be genuinely different in approach, not just color swaps.
`;

/**
 * COMPONENT-SPECIFIC DESIGN PRINCIPLES
 */
export const DESIGN_PRINCIPLES = {
  button: {
    primary: {
      guidance: "Bold, clear call-to-action with strong visual hierarchy",
      states: "Include default, hover, active, focus-visible, and disabled states",
      spacing: "Minimum 16px horizontal padding, 12px vertical",
      borderRadius: "4-8px for modern feel, avoid pill shapes for primary CTAs",
    },
    secondary: {
      guidance: "Subtle complement to primary, not diminished",
      states: "Clear hover differentiation without competing with primary",
      visibility: "Sufficient contrast to be visible against various backgrounds",
    },
    ghost: {
      guidance: "Least prominent, used for tertiary actions",
      states: "Subtle background fill on hover, clear focus state",
    },
  },
  card: {
    standard: {
      guidance: "Balanced content hierarchy with clear focal point",
      shadow: "Subtle shadows (0-4px) with elevation changes on hover",
      padding: "16-24px internal spacing, consistent with design system",
      borderRadius: "8-12px for content cards, 4px for data cards",
    },
    interactive: {
      guidance: "Clear affordance for interaction",
      shadow: "Elevation increase on hover (4-8px)",
      cursor: "Pointer cursor, transform translateY(-2px) on hover",
    },
  },
  form: {
    input: {
      guidance: "Clear labeling, obvious input area, immediate feedback",
      states: "Default, focus, error, success, disabled, readonly",
      error: "Inline error message with icon, color indicator (not just red border)",
      label: "Floating labels or top labels with clear association",
    },
    validation: {
      guidance: "Prevent errors before they happen",
      timing: "Debounced real-time validation on blur or after delay",
      feedback: "Positive reinforcement for valid inputs",
    },
  },
};

/**
 * COLOR AND ACCESSIBILITY GUIDELINES
 */
export const ACCESSIBILITY_GUIDELINES = `
ACCESSIBILITY REQUIREMENTS (NON-NEGOTIABLE):
- Color contrast: 4.5:1 minimum for normal text, 3:1 for large text (WCAG 2.1 AA)
- Focus indicators: Visible outline or ring on all interactive elements (2px minimum)
- Touch targets: 44x44px minimum on mobile, 36x36px on desktop
- Text size: Minimum 16px for body text, 14px for captions (use rem units)
- Spacing: Adequate whitespace to prevent accidental taps
- Colors: Never use color alone to convey information (add icons or text)
`;

/**
 * ANIMATION GUIDELINES
 */
export const ANIMATION_GUIDELINES = `
ANIMATION PRINCIPLES:
- Duration: 200-300ms for micro-interactions, 300-500ms for complex animations
- Easing: ease-out for entrances, ease-in-out for state changes
- Purpose: Animation should provide feedback or guide attention, not decorate
- Performance: Use CSS transforms and opacity (GPU-accelerated)
- Motion sensitivity: Respect reduced-motion preferences (@media (prefers-reduced-motion))
- Reserved animations: Scale, fade, slide, and color transitions
- Prohibited: Flashing, blinking, spinning, or distracting animations
`;

/**
 * FRAMEWORK-SPECIFIC GUIDELINES
 */
export function getFrameworkGuidelines(framework: string): string {
  const fw = framework.toLowerCase().trim();
  
  const guidelines: Record<string, string> = {
    tailwind: `
TAILwind CSS REQUIREMENTS:
- Use Tailwind utility classes exclusively for styling
- Follow Tailwind's spacing scale (p-4, m-2, gap-4, etc.)
- Leverage Tailwind's color palette (bg-blue-500, text-gray-700, etc.)
- Use Tailwind's transition utilities (transition, duration-200, ease-in-out)
- Use Tailwind's transform utilities (hover:scale-105, active:scale-95)
- Follow Tailwind's border and radius conventions (rounded-lg, rounded-full)
- Use Tailwind's flexbox and grid utilities (flex, justify-center, items-center)
- Include responsive prefixes (md:, lg:) where appropriate
- Use dark mode variants (dark:) if applicable
- Follow Tailwind's form plugin patterns for form inputs
`,

    bootstrap: `
BOOTSTRAP REQUIREMENTS:
- Use Bootstrap component classes (btn, btn-primary, card, form-control, etc.)
- Leverage Bootstrap's color system (primary, secondary, success, danger, etc.)
- Use Bootstrap's spacing (p-3, m-2 uses Bootstrap's spacing utilities)
- Follow Bootstrap's grid system (container, row, col-*)
- Use Bootstrap's form layouts (form-group, form-row)
- Include Bootstrap's JavaScript for interactive components (dropdowns, modals)
- Follow Bootstrap's accessibility patterns
- Use Bootstrap's utility classes for common styling
`,

    bulma: `
BULMA REQUIREMENTS:
- Use Bulma component classes (button, card, modal, navbar, etc.)
- Leverage Bulma's color palette and modifiers
- Use Bulma's columns for responsive layout (columns, column, is-*)
- Follow Bulma's element modifiers (is-primary, is-large, is-outlined)
- Use Bulma's form controls and input classes
- Include Bulma's helpers for common styling (helpers, typography)
- Follow Bulma's responsive design patterns
`,

    foundation: `
FOUNDATION REQUIREMENTS:
- Use Foundation component classes
- Leverage Foundation's XY grid system (grid-x, grid-margin-x, cell, etc.)
- Use Foundation's button styles
- Follow Foundation's form patterns
- Include Foundation's JavaScript for interactive components
- Use Foundation's visibility classes (show-for-medium, hide-for-print)
`,

    'semantic ui': `
SEMANTIC UI REQUIREMENTS:
- Use Semantic UI component classes
- Leverage Semantic UI's theming system
- Use Semantic UI's element variations (primary, secondary, tertiary buttons)
- Follow Semantic UI's naming conventions (ui button, ui card, ui form)
- Include Semantic UI's JavaScript for interactive components
- Use Semantic UI's grid and container systems
`,

    css: `
CUSTOM CSS REQUIREMENTS:
- Use inline styles for all styling (as required by this tool)
- Use CSS custom properties (--primary-color, --spacing-md, etc.) for theming
- Use CSS Grid and Flexbox for layout
- Implement smooth CSS transitions with proper easing
- Follow BEM naming convention for custom classes (block__element--modifier)
- Ensure responsive design with media queries
- Use CSS variables for colors, spacing, typography
- Include :hover, :focus, :active states for interactive elements
- Implement :focus-visible for keyboard navigation
- Add @media (prefers-reduced-motion) for accessibility
`,
  };

  return guidelines[fw] || guidelines.css;
}

/**
 * QUALITY CHECKLIST FOR AI
 */
export const QUALITY_CHECKLIST = `
QUALITY CHECKLIST - Your designs MUST include:
✅ Semantic HTML5 structure (header, main, footer, nav, section, article)
✅ Proper ARIA labels and roles where needed
✅ Visible focus indicators (2px outline minimum)
✅ Hover, focus, and active states for interactive elements
✅ Smooth transitions (200-300ms, ease-out)
✅ Mobile-first responsive breakpoints
✅ Touch targets (44x44px minimum)
✅ Adequate color contrast (4.5:1 ratio)
✅ No color-only information传达 (add icons/text)
✅ Content-first approach (no placeholder lorem ipsum where possible)
✅ Consistent spacing using the framework's scale
✅ Proper text hierarchy (H1 > H2 > H3 > p)
✅ Meaningful design names (not "Design 1", but "Modern Gradient Button")
✅ Complete, valid HTML (no missing closing tags)
✅ Production-ready code (no debug styles or temporary code)

WHAT TO AVOID:
❌ Generic, copy-paste designs
❌ Just changing colors between variations
❌ Missing focus states
❌ Low contrast text
❌ Unstyled form inputs
❌ Non-semantic HTML (div soup)
❌ Inline JavaScript or event handlers
❌ Animations that exceed 500ms
❌ Placeholder images without alt text
❌ Inconsistent spacing or alignment
❌ Missing error states
❌ Designs that work only on desktop
`;

/**
 * Build a comprehensive prompt using the RTCF framework
 */
export function buildEnhancedPrompt(context: PromptContext): string {
  const { userPrompt, framework, stylePreference, componentType, brandColors, targetAudience, platform } = context;
  
  let prompt = `TASK: Generate 3 distinct, production-ready UI component designs

ROLE: You are a Senior UX Designer with expertise in creating accessible, user-friendly interfaces.

CONTEXT:
- User Request: "${userPrompt}"
- Component Type: ${componentType || 'UI Component'}
- Target Framework: ${framework.toUpperCase()}
- Platform: ${platform || 'Responsive (mobile-first)'}`;

  if (targetAudience) {
    prompt += `\n- Target Audience: ${targetAudience}`;
  }

  if (brandColors) {
    prompt += `\n- Brand Colors: ${brandColors}`;
  }

  prompt += `

FORMAT: Output as JSON with this structure:
{
  "designs": [
    {
      "name": "Descriptive name (e.g., 'Modern Gradient Button')",
      "html": "Complete HTML with inline styles/classes",
      "description": "Design rationale (100-200 chars)"
    }
  ]
}

DESIGN REQUIREMENTS:

1. DESIGN VARIATIONS (Each must be genuinely different):
   - Design 1: MODERN & POLISHED - Clean aesthetic, subtle shadows, smooth animations
   - Design 2: MINIMAL & FUNCTIONAL - Content-focused, reduced visual noise, high clarity
   - Design 3: BOLD & ENGAGING - Strong visual hierarchy, distinctive colors, memorable

2. INTERACTIVE ELEMENTS:
   - All interactive elements must have :hover, :focus, :active states
   - Visible focus indicators for keyboard navigation (2px outline/ring)
   - Smooth transitions (200-300ms duration)
   - Clear affordances (cursor: pointer, visual feedback)

3. ACCESSIBILITY:
   - WCAG 2.1 AA color contrast (4.5:1 minimum)
   - 44x44px minimum touch targets
   - Proper ARIA labels on interactive elements
   - Focus management for modals/dialogs
   - Reduced motion support`;

  prompt += `\n\n${QUALITY_CHECKLIST}`;
  prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
  prompt += `\n\n${ANIMATION_GUIDELINES}`;
  prompt += `\n\n${getFrameworkGuidelines(framework)}`;

  if (stylePreference) {
    prompt += `\n\nSTYLE PREFERENCE TO INCORPORATE: "${stylePreference}"`;
  }

  prompt += `

REMEMBER:
- Each design must be visually distinct, not just color variations
- Include realistic content (not lorem ipsum if possible)
- Focus on usability and user experience
- Design for production use, not wireframes
- JSON only - no markdown, no explanations`;

  return prompt;
}

/**
 * BUTTON COMPONENT PROMPT
 */
export const BUTTON_TEMPLATE: PromptTemplate = {
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context) => {
    let prompt = `TASK: Create 3 distinct BUTTON designs

ROLE: Senior UX Designer specializing in interaction design

CONTEXT:
- Component: Button / Call-to-Action
- Purpose: ${context.userPrompt}
- Framework: ${context.framework.toUpperCase()}`;

    if (context.stylePreference) {
      prompt += `\n- Style: ${context.stylePreference}`;
    }

    prompt += `

DESIGN SPECIFICS:

Design 1 - PRIMARY ACTION BUTTON:
- Bold, attention-commanding design for primary CTAs
- Solid background with subtle gradient (if framework supports)
- White text on colored background
- Strong hover state (slightly lighter or scale transform)
- Focus ring for keyboard navigation
- Active/pressed state (scale down slightly)
- Minimum 16px horizontal, 12px vertical padding
- Border radius: 4-8px (modern feel)
- Box shadow on hover (subtle depth)

Design 2 - SECONDARY ACTION BUTTON:
- Transparent background with solid border
- Border color matches primary button text
- Subtle hover effect (background fill or color change)
- No shadow or very minimal
- Same dimensions as primary button
- Clear focus state
- Works well alongside primary button without competing

Design 3 - ICON BUTTON WITH TEXT:
- Icon on left (or right) with text label
- Consistent spacing (8-12px gap)
- Icon should complement button purpose
- Icon on hover (subtle scale or color change)
- Consider accessibility (aria-label for icon-only versions)
- Same padding as other buttons for consistency`;

    prompt += `\n\n${QUALITY_CHECKLIST}`;
    prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
    prompt += `\n\n${ANIMATION_GUIDELINES}`;
    prompt += `\n\n${getFrameworkGuidelines(context.framework)}`;

    prompt += `

OUTPUT: Valid JSON with 3 button designs`;

    return prompt;
  },
  validateOutput: (output: any) => {
    return Boolean(
      output &&
      output.designs &&
      Array.isArray(output.designs) &&
      output.designs.length >= 3 &&
      output.designs.every((d: any) => d.name && d.html && d.description)
    );
  }
};

/**
 * CARD COMPONENT PROMPT
 */
export const CARD_TEMPLATE: PromptTemplate = {
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context) => {
    let prompt = `TASK: Create 3 distinct CARD designs

ROLE: Senior UX Designer with expertise in content presentation

CONTEXT:
- Component: Card / Content Container
- Purpose: ${context.userPrompt}
- Framework: ${context.framework.toUpperCase()}`;

    if (context.stylePreference) {
      prompt += `\n- Style: ${context.stylePreference}`;
    }

    prompt += `

DESIGN SPECIFICS:

Design 1 - STANDARD CONTENT CARD:
- Vertical layout (header, body, footer)
- Subtle shadow (0-2px) for depth
- Border radius: 8-12px
- Overflow hidden for image containment
- Header: Title with proper hierarchy
- Body: Content with readable line-height (1.5-1.7)
- Footer: Action or metadata
- Hover: Slight elevation (4px shadow) or border color change

Design 2 - FEATURED/HIGHLIGHTED CARD:
- More prominent visual weight
- Accent color for important elements
- Larger visual hierarchy
- Enhanced hover state
- Call-to-action button in footer
- Image area with overlay gradient (optional)
- Border or shadow emphasis

Design 3 - COMPACT/DENSE CARD:
- Reduced padding (12-16px)
- Clean, flat design
- Border-based separation (no shadow)
- Hover highlight effect
- Ideal for lists, catalogs, feeds
- Efficient use of space
- Clear hierarchy despite density`;

    prompt += `\n\n${QUALITY_CHECKLIST}`;
    prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
    prompt += `\n\n${ANIMATION_GUIDELINES}`;
    prompt += `\n\n${getFrameworkGuidelines(context.framework)}`;

    prompt += `

OUTPUT: Valid JSON with 3 card designs`;

    return prompt;
  },
  validateOutput: (output: any) => {
    return Boolean(
      output &&
      output.designs &&
      Array.isArray(output.designs) &&
      output.designs.length >= 3 &&
      output.designs.every((d: any) => d.name && d.html && d.description)
    );
  }
};

/**
 * FORM INPUT COMPONENT PROMPT
 */
export const FORM_TEMPLATE: PromptTemplate = {
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context) => {
    let prompt = `TASK: Create 3 distinct FORM INPUT designs

ROLE: Senior UX Designer specializing in form design and usability

CONTEXT:
- Component: Form Input / Form Field
- Purpose: ${context.userPrompt}
- Framework: ${context.framework.toUpperCase()}`;

    if (context.stylePreference) {
      prompt += `\n- Style: ${context.stylePreference}`;
    }

    prompt += `

DESIGN SPECIFICS:

Design 1 - UNDERLINED INPUT (Material Style):
- Bottom border only (no side/border borders)
- Animated underline on focus (color change, underline expansion)
- Floating label or clear placeholder
- Smooth color transitions
- Error state: Red underline + error message below
- Success state: Green underline (optional)
- Disabled state styling
- Focus: 2px outline ring (accessible)

Design 2 - BOXED INPUT (Modern):
- Full border with rounded corners
- Subtle border color change on focus (blue/brand color)
- Internal icon support (optional)
- Clear error and success states
- Helper text below input
- Disabled state styling
- Focus: Ring effect

Design 3 - FILLED INPUT:
- Light background color
- Darker border on focus
- Floating label animation
- Clear focus and error states
- Consistent with Material Design patterns
- Good for dense forms
- Reduced visual weight`;

    prompt += `\n\nFORM FIELD REQUIREMENTS:
- Label element (visible, associated with input via 'for' attribute)
- Input field with appropriate type (text, email, password, etc.)
- Focus, hover, and error states
- Accessibility attributes (aria-label, aria-describedby, aria-invalid)
- Error message area
- Helper text area
- Disabled state styling
- Placeholder text`;

    prompt += `\n\n${QUALITY_CHECKLIST}`;
    prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
    prompt += `\n\n${ANIMATION_GUIDELINES}`;
    prompt += `\n\n${getFrameworkGuidelines(context.framework)}`;

    prompt += `

OUTPUT: Valid JSON with 3 input field designs`;

    return prompt;
  },
  validateOutput: (output: any) => {
    return Boolean(
      output &&
      output.designs &&
      Array.isArray(output.designs) &&
      output.designs.length >= 3 &&
      output.designs.every((d: any) => d.name && d.html && d.description)
    );
  }
};

/**
 * NAVIGATION COMPONENT PROMPT
 */
export const NAVIGATION_TEMPLATE: PromptTemplate = {
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context) => {
    let prompt = `TASK: Create 3 distinct NAVIGATION designs

ROLE: Senior UX Designer with expertise in information architecture

CONTEXT:
- Component: Navigation Bar / Header
- Purpose: ${context.userPrompt}
- Framework: ${context.framework.toUpperCase()}`;

    if (context.stylePreference) {
      prompt += `\n- Style: ${context.stylePreference}`;
    }

    prompt += `

DESIGN SPECIFICS:

Design 1 - STANDARD HEADER:
- Logo on left, navigation links on right
- Responsive hamburger menu for mobile
- Sticky positioning with shadow on scroll
- Clear active state for current page
- Hover effects on navigation items (underline, color change)
- Proper spacing (16-24px between items)
- Minimum touch target 44x44px on mobile

Design 2 - CENTERED NAVIGATION:
- Logo centered with links on both sides
- Clean, balanced appearance
- Search icon or input in header
- User avatar or login button
- Smooth scroll behavior
- Mobile: Collapses to hamburger
- Sticky header with background change on scroll

Design 3 - FULL-FEATURED HEADER:
- Search bar with advanced options
- Notification badge icon
- Dropdown menus for user account
- Mega menu or dropdown navigation
- Mobile drawer/slide-out menu
- CTA button in header
- Multiple responsive breakpoints`;

    prompt += `\n\nREQUIREMENTS:
- Semantic nav element
- Proper ARIA attributes for mobile menu (aria-expanded, aria-haspopup)
- Logo/image placeholder
- Navigation links (Home, About, Services, Contact - realistic examples)
- Mobile hamburger menu button (44x44px)
- Sticky/fixed positioning
- Focus states for keyboard navigation
- Skip link for accessibility`;

    prompt += `\n\n${QUALITY_CHECKLIST}`;
    prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
    prompt += `\n\n${ANIMATION_GUIDELINES}`;
    prompt += `\n\n${getFrameworkGuidelines(context.framework)}`;

    prompt += `

OUTPUT: Valid JSON with 3 navigation designs`;

    return prompt;
  },
  validateOutput: (output: any) => {
    return Boolean(
      output &&
      output.designs &&
      Array.isArray(output.designs) &&
      output.designs.length >= 3 &&
      output.designs.every((d: any) => d.name && d.html && d.description)
    );
  }
};

/**
 * MODAL/DIALOG COMPONENT PROMPT
 */
export const MODAL_TEMPLATE: PromptTemplate = {
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context) => {
    let prompt = `TASK: Create 3 distinct MODAL/DIALOG designs

ROLE: Senior UX Designer specializing in interaction patterns

CONTEXT:
- Component: Modal / Dialog / Popup
- Purpose: ${context.userPrompt}
- Framework: ${context.framework.toUpperCase()}`;

    if (context.stylePreference) {
      prompt += `\n- Style: ${context.stylePreference}`;
    }

    prompt += `

DESIGN SPECIFICS:

Design 1 - STANDARD MODAL:
- Centered dialog with white background
- Overlay backdrop with blur effect (backdrop-filter: blur(4px))
- Close button (X) in top-right corner
- Header, body, and footer sections
- Focus trap for keyboard navigation
- Escape key to close
- Smooth open animation (fade + scale)
- Maximum width with responsive width
- Scrollable body if content is long

Design 2 - CONFIRMATION DIALOG:
- Smaller, focused dialog
- Icon for visual confirmation (warning, info, success)
- Primary and secondary action buttons
- Clear, concise message
- Keyboard accessible buttons (Tab, Enter, Space, Escape)
- Button hierarchy (primary action clear, destructive action red)
- Compact padding

Design 3 - FORM MODAL:
- Larger modal for form content
- Scrollable body area
- Form fields with labels
- Submit and cancel buttons
- Validation state display
- Success/error feedback
- Progress indication if multi-step`;

    prompt += `\n\nMODAL REQUIREMENTS:
- Backdrop overlay with animation (fade in)
- Close button (X icon) with aria-label="Close"
- Proper ARIA role="dialog" and aria-modal="true"
- Focus management (trap focus within modal)
- Body scroll lock when modal is open
- Smooth open/close animations (200-300ms)
- Escape key handler
- Click outside to close (optional, configurable)
- Accessibility: Focus returns to trigger element on close`;

    prompt += `\n\n${QUALITY_CHECKLIST}`;
    prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
    prompt += `\n\n${ANIMATION_GUIDELINES}`;
    prompt += `\n\n${getFrameworkGuidelines(context.framework)}`;

    prompt += `

OUTPUT: Valid JSON with 3 modal designs`;

    return prompt;
  },
  validateOutput: (output: any) => {
    return Boolean(
      output &&
      output.designs &&
      Array.isArray(output.designs) &&
      output.designs.length >= 3 &&
      output.designs.every((d: any) => d.name && d.html && d.description)
    );
  }
};

/**
 * TABLE COMPONENT PROMPT
 */
export const TABLE_TEMPLATE: PromptTemplate = {
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context) => {
    let prompt = `TASK: Create 3 distinct TABLE designs

ROLE: Senior UX Designer with expertise in data presentation

CONTEXT:
- Component: Data Table
- Purpose: ${context.userPrompt}
- Framework: ${context.framework.toUpperCase()}`;

    if (context.stylePreference) {
      prompt += `\n- Style: ${context.stylePreference}`;
    }

    prompt += `

DESIGN SPECIFICS:

Design 1 - SIMPLE TABLE:
- Clean, minimal design
- Border-bottom for rows only
- Subtle header background (light gray)
- Hover highlight for rows
- Proper cell padding (12-16px)
- Left-aligned text, right-aligned numbers
- Responsive: horizontal scroll wrapper

Design 2 - STRIPED TABLE:
- Alternating row colors (zebra striping)
- More prominent header styling
- Enhanced row hover state
- Sortable column indicators (arrows)
- Action buttons per row (view, edit, delete)
- Better visual separation
- Sticky header row

Design 3 - DATA-DENSE TABLE:
- Compact spacing (8-12px padding)
- Monospace font for data (numbers, codes)
- Vertical borders between columns
- Status badges for data (active, pending, etc.)
- Pagination controls placeholder
- Column resizing handles
- Checkbox column for selection`;

    prompt += `\n\nTABLE REQUIREMENTS:
- Semantic table, thead, tbody, tr, th, td elements
- Sample data rows (3-5 rows with realistic content)
- Header row with column names
- Responsive wrapper with horizontal scroll
- Proper text alignment (left for text, right for numbers, center for actions)
- Empty state handling
- Hover states for rows
- Focus states for interactive elements`;
    
    prompt += `\n\n${QUALITY_CHECKLIST}`;
    prompt += `\n\n${ACCESSIBILITY_GUIDELINES}`;
    prompt += `\n\n${ANIMATION_GUIDELINES}`;
    prompt += `\n\n${getFrameworkGuidelines(context.framework)}`;

    prompt += `

OUTPUT: Valid JSON with 3 table designs`;

    return prompt;
  },
  validateOutput: (output: any) => {
    return Boolean(
      output &&
      output.designs &&
      Array.isArray(output.designs) &&
      output.designs.length >= 3 &&
      output.designs.every((d: any) => d.name && d.html && d.description)
    );
  }
};

/**
 * Get template based on component type
 */
export function getTemplateForComponent(componentType: string): PromptTemplate {
  const type = componentType.toLowerCase().trim();
  
  const templates: Record<string, PromptTemplate> = {
    button: BUTTON_TEMPLATE,
    buttons: BUTTON_TEMPLATE,
    card: CARD_TEMPLATE,
    cards: CARD_TEMPLATE,
    form: FORM_TEMPLATE,
    input: FORM_TEMPLATE,
    inputs: FORM_TEMPLATE,
    navigation: NAVIGATION_TEMPLATE,
    nav: NAVIGATION_TEMPLATE,
    navbar: NAVIGATION_TEMPLATE,
    header: NAVIGATION_TEMPLATE,
    modal: MODAL_TEMPLATE,
    dialog: MODAL_TEMPLATE,
    popup: MODAL_TEMPLATE,
    table: TABLE_TEMPLATE,
    data: TABLE_TEMPLATE,
  };

  return templates[type] || BUTTON_TEMPLATE;
}

/**
 * Generate design names for component type
 */
export function generateDesignNames(componentType: string): string[] {
  const type = componentType.toLowerCase().trim();
  
  const names: Record<string, string[]> = {
    button: [
      'Modern Gradient Button',
      'Minimal Outline Button',
      'Soft Pill Button'
    ],
    card: [
      'Standard Content Card',
      'Featured Highlight Card',
      'Compact List Card'
    ],
    form: [
      'Underlined Input Field',
      'Modern Bordered Input',
      'Material Filled Input'
    ],
    navigation: [
      'Standard Header Navigation',
      'Centered Logo Navigation',
      'Full-Featured Header'
    ],
    modal: [
      'Standard Dialog Modal',
      'Confirmation Dialog',
      'Form Modal with Scroll'
    ],
    table: [
      'Simple Clean Table',
      'Striped Data Table',
      'Compact Dense Table'
    ],
  };

  return names[type] || [
    `Modern ${componentType}`,
    'Minimal Design',
    'Enhanced Variant'
  ];
}

/**
 * Default export with all templates
 */
export const PROMPT_TEMPLATES = {
  SYSTEM_PROMPT,
  QUALITY_CHECKLIST,
  ACCESSIBILITY_GUIDELINES,
  ANIMATION_GUIDELINES,
  BUTTON: BUTTON_TEMPLATE,
  CARD: CARD_TEMPLATE,
  FORM: FORM_TEMPLATE,
  NAVIGATION: NAVIGATION_TEMPLATE,
  MODAL: MODAL_TEMPLATE,
  TABLE: TABLE_TEMPLATE,
  getTemplateForComponent,
  buildEnhancedPrompt,
  getFrameworkGuidelines,
  generateDesignNames,
};
