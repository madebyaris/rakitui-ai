# Enhanced Prompt Engineering for Rakit UI AI

This document describes the comprehensive prompt engineering system implemented to avoid "AI slop" and ensure high-quality, professional UI designs.

## Problem: AI Slop in Design Generation

AI-generated designs often suffer from:
- **Generic, template-like outputs** that lack personality
- **Missing accessibility features** (focus states, ARIA labels, contrast)
- **Inconsistent styling** and poor visual hierarchy
- **Non-semantic HTML** (div soup without proper semantics)
- **No interactive states** (missing hover, focus, active states)
- **Low-quality code** with poor structure and maintainability
- **Generic design names** like "Design 1", "Design 2", "Design 3"

## Solution: Comprehensive Prompt Engineering

We've implemented a multi-layered prompt engineering system based on industry best practices:

### 1. RTCF Framework

Every prompt follows the **Role, Task, Context, Format** framework:

```
ROLE: You are a Senior UX/UI Designer with 15+ years of experience
TASK: Create 3 distinct button designs
CONTEXT: For a SaaS dashboard, mobile-first, target startup founders
FORMAT: JSON with name, html, and description for each design
```

### 2. Senior Designer Persona

The system prompt establishes the AI as a **Senior UX Designer** with specific expertise:

- ✅ 15+ years experience at top companies (Apple, Google, Airbnb, Stripe)
- ✅ Design philosophy: Clarity, Progressive Disclosure, Consistency
- ✅ Accessibility-first approach (WCAG 2.1 AA non-negotiable)
- ✅ Mobile-first thinking
- ✅ Performance-conscious design
- ✅ Content-focused approach

### 3. Comprehensive Quality Checklist

Every prompt includes a **non-negotiable quality checklist**:

**MUST INCLUDE:**
- ✅ Semantic HTML5 elements (header, main, footer, nav, section, article)
- ✅ Proper ARIA labels and roles
- ✅ Visible focus indicators (2px outline minimum)
- ✅ Hover, focus, and active states for all interactive elements
- ✅ Smooth transitions (200-300ms, ease-out)
- ✅ Mobile-first responsive breakpoints
- ✅ Touch targets (44x44px minimum)
- ✅ Adequate color contrast (4.5:1 ratio)
- ✅ Content-first approach (no lorem ipsum)

**MUST AVOID:**
- ❌ Generic, copy-paste designs
- ❌ Just changing colors between variations
- ❌ Missing focus states
- ❌ Low contrast text
- ❌ Unstyled form inputs
- ❌ Non-semantic HTML
- ❌ Inline JavaScript
- ❌ Animations > 500ms
- ❌ Placeholder images without alt text

### 4. Component-Specific Templates

We have **detailed templates** for each component type:

#### Button Template
- Design 1: **Modern & Polished** - Bold, gradient backgrounds, smooth hover effects
- Design 2: **Minimal & Functional** - Ghost buttons, transparent backgrounds
- Design 3: **Icon + Text** - Icon buttons with labels, accessibility-focused

Each includes:
- Specific padding requirements (16px horizontal, 12px vertical)
- Border radius guidelines (4-8px for modern feel)
- Focus ring specifications (2px outline)
- Hover/active state animations

#### Card Template
- Design 1: **Standard Content Card** - Vertical layout, subtle shadows
- Design 2: **Featured/Higlighted Card** - Prominent visual weight, accent colors
- Design 3: **Compact/Dense Card** - Reduced padding, flat design

Each includes:
- Shadow elevation guidelines (0-4px default, 4-8px hover)
- Border radius specifications (8-12px for cards)
- Hover effects (elevation or border change)
- Content hierarchy requirements

#### Form Template
- Design 1: **Underlined Input** - Material-style, animated underlines
- Design 2: **Boxed Input** - Modern with ring focus states
- Design 3: **Filled Input** - Light background, floating labels

Each includes:
- Label specifications (visible, associated via 'for' attribute)
- Error state requirements (red border + message)
- Focus state animations
- Accessibility attributes (aria-label, aria-describedby)

#### Navigation Template
- Design 1: **Standard Header** - Logo left, nav right, hamburger mobile
- Design 2: **Centered Navigation** - Balanced, search included
- Design 3: **Full-Featured Header** - Mega menu, notifications, user dropdown

Each includes:
- Responsive breakpoints
- Touch target sizes (44x44px)
- ARIA attributes for mobile menus
- Focus management

#### Modal Template
- Design 1: **Standard Modal** - Centered, backdrop blur, focus trap
- Design 2: **Confirmation Dialog** - Small, icon, clear button hierarchy
- Design 3: **Form Modal** - Large, scrollable, validation states

Each includes:
- Backdrop overlay specifications
- Focus trap requirements
- Escape key handling
- Animation guidelines (200-300ms)

#### Table Template
- Design 1: **Simple Table** - Clean, border-bottom rows
- Design 2: **Striped Table** - Zebra striping, sortable columns
- Design 3: **Data-Dense Table** - Compact, monospace for data

Each includes:
- Semantic table structure
- Responsive scroll wrapper
- Text alignment (left for text, right for numbers)
- Hover states

### 5. Accessibility Standards (WCAG 2.1)

**Color Contrast:**
- Normal text: 4.5:1 minimum ratio
- Large text (18px+ or 14px bold): 3:1 minimum
- UI components (borders, icons): 3:1 minimum

**Focus Indicators:**
- 2px minimum outline or border
- Visible on all backgrounds
- No relying on color alone

**Touch Targets:**
- Mobile: 44x44px minimum
- Desktop: 36x36px minimum
- Adequate spacing between targets

**Motion Sensitivity:**
- Respect `prefers-reduced-motion`
- No flashing or blinking animations
- Smooth, purposeful animations only

### 6. Animation Principles

**Duration:**
- Micro-interactions: 200-300ms
- Complex animations: 300-500ms

**Easing:**
- Entrances: `ease-out`
- State changes: `ease-in-out`

**Performance:**
- Use CSS transforms and opacity (GPU-accelerated)
- Avoid layout-triggering properties (width, height, margin)

### 7. Framework-Specific Guidelines

**Tailwind CSS:**
- Utility classes for all styling
- Follow spacing scale (p-4, m-2, gap-4)
- Use transition utilities (transition, duration-200)
- Responsive prefixes (md:, lg:)

**Bootstrap:**
- Component classes (btn, card, form-control)
- Grid system (container, row, col-*)
- Form layouts (form-group, form-row)

**Custom CSS:**
- CSS custom properties (--primary-color)
- BEM naming convention
- CSS Grid and Flexbox
- Media queries for responsive design

### 8. Design Variation Strategy

Each component type generates **3 genuinely different designs**:

1. **Modern & Polished**
   - Clean aesthetic
   - Subtle shadows
   - Smooth animations
   - Contemporary feel

2. **Minimal & Functional**
   - Content-focused
   - Reduced visual noise
   - High clarity
   - Efficient use of space

3. **Bold & Engaging**
   - Strong visual hierarchy
   - Distinctive colors
   - Memorable
   - Attention-commanding

These are **not just color swaps** - each has fundamentally different:
- Layout approaches
- Visual hierarchy strategies
- Interaction patterns
- Typography choices

## Usage Examples

### Example 1: Simple Button Generation

```typescript
const result = await tool.execute({
  prompt: "Create 3 CTA buttons for a SaaS signup flow",
  component_type: "button",
  framework: "tailwind",
  style_preference: "modern and clean"
});
```

### Example 2: Detailed Card Generation

```typescript
const result = await tool.execute({
  prompt: "Design pricing cards for a developer tool targeting enterprise teams",
  component_type: "card",
  framework: "bootstrap",
  style_preference: "professional with clear hierarchy",
  targetAudience: "Enterprise CTOs and engineering managers"
});
```

### Example 3: Form Component Generation

```typescript
const result = await tool.execute({
  prompt: "Create login form fields with email and password for a fintech app",
  component_type: "form",
  framework: "css",
  style_preference: "trustworthy and secure-looking",
  brandColors: "#0066FF, #00C853"
});
```

## Testing the Prompts

Run the enhanced prompt test:

```bash
# Test prompt generation (no API key needed)
node test-enhanced-prompts.js

# Test with MiniMax API
export MINIMAX_API_KEY="your-api-key"
node test-enhanced-prompts.js

# Test restaurant landing page components
node test-restaurant.js
```

## Continuous Improvement

The prompt engineering system is designed to be **iteratively improved**:

1. **Monitor output quality** - Track when designs fail validation
2. **Collect feedback** - User preferences and quality ratings
3. **Refine templates** - Add new patterns based on successful generations
4. **Update best practices** - Incorporate new research and techniques
5. **Expand component coverage** - Add new component types

## References

- [RTCF Framework - Miro](https://miro.com/ai/prompts/ui-design-prompts/)
- [UX Design Prompts - Motiff](https://motiff.com/help/docs/articles/341351705918724)
- [No-Code UX/UI Best Practices 2025 - JDoodle](https://www.jdoodle.ai/blog/best-practices-for-designing-ux-ui-with-no-code-platforms-in-2025)
- [Prompt Engineering for UX - WeSkill](https://blog.weskill.org/2025/05/prompt-engineering-for-ux-and-design.html)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/)

---

**Result:** High-quality, accessible, professional UI designs that avoid AI slop and are ready for production use.
