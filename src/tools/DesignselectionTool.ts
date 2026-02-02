import { MCPTool } from "mcp-framework";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateDesignSelectionHTML, DesignInput, DesignSelectionInput, PurposeMetadata, ReferenceItem } from "../lib/templates/designSelection.js";
import { serveHtmlOnLocalhost, getSelectedDesign, isSelectionComplete, stopLocalServer, notifySelectionFinalized, updateDesigns } from "../lib/utils/serverUtils.js";
import { MiniMaxClient, DesignGenerationResult } from "../lib/utils/minimaxClient.js";
import { buildEnhancedPrompt, getTemplateForComponent, PROMPT_TEMPLATES } from "../lib/utils/designPrompts.js";

// For handling ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a temporary directory path for logs
const tmpDir = path.join(__dirname, '../../../tmp');

// Create MiniMax client instance
const minimaxClient = new MiniMaxClient();

/**
 * Input schema for prompt-based design generation
 */
interface SelectionMetadataInput {
  auto_search_reference?: boolean;
  purpose_include?: string[];
  purpose_exclude?: string[];
  purpose_notes?: string;
  view_mode?: 'mobile' | 'desktop' | 'responsive';
}

export interface PromptDesignInput extends SelectionMetadataInput {
  prompt: string;
  style_preference?: string;
  framework?: string;
  component_type?: string;
}

/**
 * Combined input type that supports both workflows
 */
export type CombinedDesignInput = (DesignInput & SelectionMetadataInput) | PromptDesignInput;

/**
 * Detect which workflow is being used
 */
function isPromptWorkflow(input: CombinedDesignInput): input is PromptDesignInput {
  return 'prompt' in input && (input as PromptDesignInput).prompt !== undefined;
}

/**
 * Tool for selecting between different UI component designs
 * 
 * This tool provides an intelligent, adaptive interface for comparing and selecting 
 * between up to 3 different UI component designs. It can either:
 * 1. Accept pre-generated designs directly (existing workflow)
 * 2. Generate designs from natural language prompts using MiniMax-M2.1 (new workflow)
 * 
 * Features:
 * - Framework Detection: Automatically detects Tailwind, Bootstrap, Bulma, Foundation, Semantic UI
 * - Adaptive Layout: Uses gallery view for large/complex components, card view for simple ones
 * - CSS Isolation: Prevents style conflicts between different frameworks
 * - Real-time Selection: WebSocket-based communication for instant feedback
 * - Mobile Optimized: Touch-friendly interface with responsive design
 * - AI-Powered Generation: Generate designs from natural language prompts using MiniMax-M2.1
 * 
 * Perfect for: Component libraries, design systems, UI pattern comparisons, A/B testing, rapid prototyping
 */
export class DesignselectionTool extends MCPTool<CombinedDesignInput> {
  name = "mcp_rakit-ui-ai_designselection";
  description = "Compare and select between 3 UI component designs with intelligent layout adaptation. Supports all CSS frameworks (Tailwind, Bootstrap, Bulma, etc.) and automatically chooses the best viewing mode based on component complexity. Perfect for design systems, component libraries, and UI pattern selection. NEW: Can generate designs from natural language prompts using MiniMax-M2.1 API - just provide a prompt and the tool will create 3 distinct designs for you to choose from.";

  schema = {
    // Prompt-based workflow (primary) - only prompt is needed
    prompt: {
      type: z.string().optional(),
      description: "Natural language description of the UI component to generate (e.g., 'Create 3 modern button designs for a SaaS dashboard'). When provided, the tool will use MiniMax-M2.1 to generate designs automatically. If provided, design_name_1/design_html_1 are not required.",
    },
    style_preference: {
      type: z.string().optional(),
      description: "Optional style guidance for design generation (e.g., 'modern and clean', 'playful and colorful', 'minimalist and professional').",
    },
    framework: {
      type: z.string().optional(),
      description: "Target CSS framework for design generation (tailwind, bootstrap, bulma, foundation, semantic ui, or plain css). Defaults to 'tailwind'.",
    },
    component_type: {
      type: z.string().optional(),
      description: "Type of component to generate (button, card, form, navigation, modal, table). Helps optimize the prompt for better results.",
    },
    auto_search_reference: {
      type: z.boolean().optional(),
      description: "When true, the tool will ask MiniMax to generate reference links and inspiration sources based on the prompt.",
    },
    purpose_include: {
      type: z.array(z.string()).optional(),
      description: "List of elements or requirements that must be included in the design (e.g., ['image', 'pricing', 'CTA button']).",
    },
    purpose_exclude: {
      type: z.array(z.string()).optional(),
      description: "List of elements or patterns to avoid in the design (e.g., ['carousel', 'icons']).",
    },
    purpose_notes: {
      type: z.string().optional(),
      description: "Additional purpose notes or constraints for the design generation.",
    },
    view_mode: {
      type: z.enum(['mobile', 'desktop', 'responsive']).optional(),
      description: "Default preview mode for the selection UI (mobile, desktop, or responsive).",
    },
    
    // Legacy workflow (optional - only needed if not using prompt)
    design_name_1: {
      type: z.string().optional(),
      description: "[Optional] Name/title for the first design option. Only required if not using prompt-based generation.",
    },
    design_html_1: {
      type: z.string().optional(),
      description: "[Optional] Complete HTML code for the first design. Only required if not using prompt-based generation.",
    },
    design_name_2: {
      type: z.string().optional(),
      description: "[Optional] Name/title for the second design option",
    },
    design_html_2: {
      type: z.string().optional(),
      description: "[Optional] Complete HTML code for the second design",
    },
    design_name_3: {
      type: z.string().optional(),
      description: "[Optional] Name/title for the third design option",
    },
    design_html_3: {
      type: z.string().optional(),
      description: "[Optional] Complete HTML code for the third design",
    },
  };

  /**
   * Validates input to ensure it's safe and well-formed
   */
  private validateDesignInput(input: DesignInput): void {
    // Check for potentially malicious content
    const designs = [
      { name: input.design_name_1, html: input.design_html_1 },
      { name: input.design_name_2, html: input.design_html_2 },
      { name: input.design_name_3, html: input.design_html_3 }
    ];
    
    for (const design of designs) {
      // Validate design names
      if (!design.name || design.name.trim().length === 0) {
        throw new Error('Design names cannot be empty. Please provide descriptive names for each design.');
      }
      if (design.name.length > 100) {
        throw new Error('Design name too long (max 100 characters)');
      }
      
      // Validate HTML content
      if (!design.html || design.html.trim().length === 0) {
        throw new Error('Design HTML cannot be empty. Please provide the HTML code for each design.');
      }
      
      // Basic XSS prevention - check for script tags
      if (design.html.toLowerCase().includes('<script') || 
          design.html.toLowerCase().includes('javascript:') ||
          design.html.toLowerCase().includes('onerror=')) {
        throw new Error('Design HTML contains potentially unsafe content. Script tags and inline JavaScript are not allowed for security reasons.');
      }
    }
  }

  /**
   * Validate prompt-based input
   */
  private validatePromptInput(input: PromptDesignInput): void {
    if (!input.prompt || input.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty. Please provide a description of the UI component you want to generate.');
    }
    
    if (input.prompt.length > 1000) {
      throw new Error('Prompt is too long (max 1000 characters). Please provide a shorter description.');
    }
    
    // Validate framework if provided
    const validFrameworks = ['tailwind', 'bootstrap', 'bulma', 'foundation', 'semantic ui', 'plain css', 'css'];
    if (input.framework && !validFrameworks.map(f => f.toLowerCase()).includes(input.framework.toLowerCase())) {
      throw new Error(`Invalid framework '${input.framework}'. Valid options: ${validFrameworks.join(', ')}`);
    }

    this.validateSelectionMetadata(input);
  }

  /**
   * Validate optional metadata for selection and intent
   */
  private validateSelectionMetadata(input: SelectionMetadataInput): void {
    const validViewModes = ['mobile', 'desktop', 'responsive'];
    if (input.view_mode && !validViewModes.includes(input.view_mode)) {
      throw new Error(`Invalid view_mode '${input.view_mode}'. Valid options: ${validViewModes.join(', ')}`);
    }

    const validateList = (items?: string[], label?: string) => {
      if (!items) return;
      if (items.length > 12) {
        throw new Error(`${label} has too many items (max 12).`);
      }
      items.forEach((item) => {
        if (typeof item !== 'string' || item.trim().length === 0) {
          throw new Error(`${label} items must be non-empty strings.`);
        }
        if (item.length > 120) {
          throw new Error(`${label} item too long (max 120 characters).`);
        }
      });
    };

    validateList(input.purpose_include, 'purpose_include');
    validateList(input.purpose_exclude, 'purpose_exclude');

    if (input.purpose_notes && input.purpose_notes.length > 500) {
      throw new Error('purpose_notes is too long (max 500 characters).');
    }
  }

  private buildPurposeMetadata(input: SelectionMetadataInput): PurposeMetadata | null {
    const include = input.purpose_include?.filter(Boolean);
    const exclude = input.purpose_exclude?.filter(Boolean);
    const notes = input.purpose_notes?.trim();

    if ((include && include.length > 0) || (exclude && exclude.length > 0) || notes) {
      return {
        include: include && include.length > 0 ? include : undefined,
        exclude: exclude && exclude.length > 0 ? exclude : undefined,
        notes: notes || undefined,
      };
    }
    return null;
  }

  private buildPurposePrompt(purpose: PurposeMetadata | null): string {
    if (!purpose) return '';
    const lines: string[] = ['Purpose and constraints:'];
    if (purpose.include && purpose.include.length > 0) {
      lines.push(`- Must include: ${purpose.include.join(', ')}`);
    }
    if (purpose.exclude && purpose.exclude.length > 0) {
      lines.push(`- Must avoid: ${purpose.exclude.join(', ')}`);
    }
    if (purpose.notes) {
      lines.push(`- Notes: ${purpose.notes}`);
    }
    return lines.join('\n');
  }

  /**
   * Generate designs using MiniMax-M2.1 API with enhanced prompts
   */
  private async generateDesignsFromPrompt(input: PromptDesignInput): Promise<{
    design_name_1: string;
    design_html_1: string;
    design_name_2: string;
    design_html_2: string;
    design_name_3: string;
    design_html_3: string;
  }> {
    const framework = input.framework || 'tailwind';
    
    // Get the appropriate template based on component type
    const componentType = input.component_type || 'button';
    const template = getTemplateForComponent(componentType);
    
    // Build the enhanced prompt using the template
    const purposeMetadata = this.buildPurposeMetadata(input);
    const purposePrompt = this.buildPurposePrompt(purposeMetadata);
    const promptWithPurpose = purposePrompt ? `${input.prompt}\n\n${purposePrompt}` : input.prompt;

    const context = {
      userPrompt: promptWithPurpose,
      framework: framework,
      stylePreference: input.style_preference,
      componentType: componentType,
    };
    
    const userPromptContent = template.buildUserPrompt(context);
    
    // Build system + user prompt for the API
    const systemPrompt = PROMPT_TEMPLATES.SYSTEM_PROMPT;
    
    // Call MiniMax API with enhanced prompts
    const result: DesignGenerationResult = await minimaxClient.generateDesigns(
      systemPrompt + '\n\n' + userPromptContent,
      framework,
      input.style_preference
    );

    if (!result.success || !result.designs || result.designs.length < 3) {
      throw new Error(result.error || 'Failed to generate designs from prompt. Please try a more specific prompt or different component type.');
    }

    // Validate design quality
    const validDesigns = result.designs.filter(d => 
      d.name && 
      d.name.trim().length > 0 &&
      d.html && 
      d.html.trim().length > 100 && // Ensure substantial HTML
      d.description &&
      d.description.trim().length > 0
    );

    if (validDesigns.length < 3) {
      throw new Error('Generated designs did not meet quality standards. Please try a more specific prompt.');
    }

    // Extract designs from result
    const designs = validDesigns.slice(0, 3);
    
    return {
      design_name_1: designs[0]?.name || 'Modern Design',
      design_html_1: designs[0]?.html || '',
      design_name_2: designs[1]?.name || 'Minimal Design',
      design_html_2: designs[1]?.html || '',
      design_name_3: designs[2]?.name || 'Enhanced Design',
      design_html_3: designs[2]?.html || '',
    };
  }

  /**
   * Generate designs in background and update UI via WebSocket
   */
  private async generateDesignsInBackground(
    input: PromptDesignInput,
    purposeMetadata: PurposeMetadata | null,
    viewMode: 'mobile' | 'desktop' | 'responsive',
    url: string
  ): Promise<DesignInput | null> {
    try {
      let references: ReferenceItem[] = [];
      let referenceError: string | null = null;
      
      // Generate references if requested
      if (input.auto_search_reference) {
        process.stderr.write(`[INFO] Auto search reference enabled. Generating references via MiniMax...\n`);
        const purposePrompt = this.buildPurposePrompt(purposeMetadata);
        const promptWithPurpose = purposePrompt ? `${input.prompt}\n\n${purposePrompt}` : input.prompt;
        const referenceResult = await minimaxClient.generateReferences(
          promptWithPurpose,
          input.component_type || 'button',
          input.framework || 'tailwind'
        );
        if (referenceResult.success && referenceResult.references) {
          references = referenceResult.references;
        } else if (referenceResult.error) {
          referenceError = referenceResult.error;
        }
      }

      // Generate designs from prompt
      const generatedDesigns = await this.generateDesignsFromPrompt(input);
      
      // Update UI with generated designs
      updateDesigns({
        designs: [
          {
            name: generatedDesigns.design_name_1,
            html: generatedDesigns.design_html_1,
            description: 'Design option 1'
          },
          {
            name: generatedDesigns.design_name_2,
            html: generatedDesigns.design_html_2,
            description: 'Design option 2'
          },
          {
            name: generatedDesigns.design_name_3,
            html: generatedDesigns.design_html_3,
            description: 'Design option 3'
          }
        ],
        references: references.length > 0 ? references : undefined
      });
      
      process.stderr.write(`[INFO] Design generation complete. Designs sent to UI.\n`);
      
      // Return generated designs for response building
      return generatedDesigns;
    } catch (error) {
      process.stderr.write(`[ERROR] Background generation failed: ${error}\n`);
      updateDesigns({
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Main execution method
   */
  async execute(input: CombinedDesignInput) {
    const startTime = Date.now();
    let generationMetadata: {
      model: string;
      prompt_used: string;
      framework: string;
      style_preference: string | null;
      component_type: string | null;
    } | null = null;
    let purposeMetadata: PurposeMetadata | null = null;
    let references: ReferenceItem[] = [];
    let referenceError: string | null = null;
    let viewMode: 'mobile' | 'desktop' | 'responsive' = 'responsive';
    let finalDesigns: DesignInput | null = null;
    
    try {
      // Validate that either prompt OR design fields are provided
      const hasPrompt = 'prompt' in input && input.prompt && input.prompt.trim().length > 0;
      const hasDesignFields = 'design_name_1' in input && input.design_name_1 && 'design_html_1' in input && input.design_html_1;
      
      if (!hasPrompt && !hasDesignFields) {
        throw new Error('Either provide a "prompt" for AI generation, or provide "design_name_1" and "design_html_1" for manual input.');
      }
      
      // Store hasDesignFields for later use
      const hasDesignFieldsValue = hasDesignFields;
      
      // Extract optional metadata early
      if ('view_mode' in input && input.view_mode) {
        viewMode = input.view_mode;
      }
      if ('purpose_include' in input || 'purpose_exclude' in input || 'purpose_notes' in input) {
        purposeMetadata = this.buildPurposeMetadata(input);
      }

      // Detect which workflow is being used
      let url: string;
      
      if (isPromptWorkflow(input)) {
        // Prompt-based workflow - show UI immediately, generate designs in background
        process.stderr.write(`[INFO] Using prompt-based workflow. Showing UI immediately, generating designs in background...\n`);
        
        // Validate prompt input
        this.validatePromptInput(input);
        
        // Create loading state HTML immediately
        const loadingInput: DesignSelectionInput = {
          design_name_1: 'Loading Design 1...',
          design_html_1: '<div style="padding: 40px; text-align: center; color: #6b7280;">Generating with MiniMax-M2.1...</div>',
          design_name_2: 'Loading Design 2...',
          design_html_2: '<div style="padding: 40px; text-align: center; color: #6b7280;">Generating with MiniMax-M2.1...</div>',
          design_name_3: 'Loading Design 3...',
          design_html_3: '<div style="padding: 40px; text-align: center; color: #6b7280;">Generating with MiniMax-M2.1...</div>',
          purpose: purposeMetadata || undefined,
          references: undefined,
          reference_error: undefined,
          view_mode: viewMode,
          is_loading: true,
          loading_prompt: input.prompt,
        };

        const htmlContent = generateDesignSelectionHTML(loadingInput);
        url = await serveHtmlOnLocalhost('design-selection', htmlContent);
        
        // Store loading designs for response building
        finalDesigns = {
          design_name_1: 'Loading Design 1...',
          design_html_1: '<div>Generating...</div>',
          design_name_2: 'Loading Design 2...',
          design_html_2: '<div>Generating...</div>',
          design_name_3: 'Loading Design 3...',
          design_html_3: '<div>Generating...</div>',
        };
        
        // Set generation metadata immediately (will be updated when designs complete)
        generationMetadata = {
          model: 'MiniMax-M2.1',
          prompt_used: input.prompt,
          framework: input.framework || 'tailwind',
          style_preference: input.style_preference || null,
          component_type: input.component_type || null,
        };
        
        // Start generation in background (don't await)
        this.generateDesignsInBackground(input, purposeMetadata, viewMode, url).then((generated) => {
          if (generated) {
            finalDesigns = generated;
          }
        }).catch((error) => {
          process.stderr.write(`[ERROR] Background generation failed: ${error}\n`);
          updateDesigns({ error: error instanceof Error ? error.message : String(error) });
        });
      } else {
        // Legacy workflow - use provided designs
        process.stderr.write(`[INFO] Using legacy workflow with provided designs.\n`);
        this.validateSelectionMetadata(input);
        if ('auto_search_reference' in input && input.auto_search_reference) {
          referenceError = 'Auto search reference requires a prompt. Provide a prompt to enable this feature.';
        }
        
        // Validate input
        this.validateDesignInput(input);
        
        // Generate HTML content
        const selectionInput: DesignSelectionInput = {
          ...(input as DesignInput),
          purpose: purposeMetadata || undefined,
          references: references.length > 0 ? references : undefined,
          reference_error: referenceError || undefined,
          view_mode: viewMode,
        };

        const htmlContent = generateDesignSelectionHTML(selectionInput);
        url = await serveHtmlOnLocalhost('design-selection', htmlContent);
        
        // Store final designs for response building
        finalDesigns = input as DesignInput;
      }
      
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
          
          // Close the server immediately after selection
          try {
            stopLocalServer();
            process.stderr.write(`[DEBUG] Server closed after selection\n`);
          } catch (shutdownError) {
            process.stderr.write(`[ERROR] Server shutdown error: ${shutdownError}\n`);
          }
          
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
        
        // Use finalDesigns if available, otherwise use input as DesignInput
        const timeoutDesigns = finalDesigns || (hasDesignFieldsValue ? (input as DesignInput) : {
          design_name_1: 'No Design',
          design_html_1: '',
          design_name_2: 'No Design',
          design_html_2: '',
          design_name_3: 'No Design',
          design_html_3: '',
        });
        
        return {
          success: false,
          message: "⏱️ No design was selected within the timeout period. The interface was available for 15 minutes.",
          url: url,
          design_options: [
            { 
              name: timeoutDesigns.design_name_1, 
              description: "Option 1",
              preview: timeoutDesigns.design_html_1 ? timeoutDesigns.design_html_1.substring(0, 100) + (timeoutDesigns.design_html_1.length > 100 ? '...' : '') : 'No HTML provided'
            },
            { 
              name: timeoutDesigns.design_name_2, 
              description: "Option 2",
              preview: timeoutDesigns.design_html_2 ? timeoutDesigns.design_html_2.substring(0, 100) + (timeoutDesigns.design_html_2.length > 100 ? '...' : '') : 'No HTML provided'
            },
            { 
              name: timeoutDesigns.design_name_3, 
              description: "Option 3",
              preview: timeoutDesigns.design_html_3 ? timeoutDesigns.design_html_3.substring(0, 100) + (timeoutDesigns.design_html_3.length > 100 ? '...' : '') : 'No HTML provided'
            }
          ],
          selectedDesign: null,
          selectedDesignHtml: null,
          selectionTimestamp: null,
          selectionDuration: Date.now() - startTime,
          selection_context: {
            purpose: purposeMetadata,
            references,
            view_mode: viewMode,
            reference_error: referenceError
          },
          tips: [
            "💡 Use keyboard shortcuts (1, 2, 3) for quick selection",
            "🖱️ Click on any design card to zoom in for better viewing", 
            "📱 The interface works on mobile devices too",
            "🔄 Try running the tool again if the browser didn't open properly"
          ],
          ...(generationMetadata ? { generation: generationMetadata } : {}),
        };
      }
  
      // Find the selected design HTML (use finalDesigns which has the actual generated designs)
      const designsToUse = finalDesigns || (hasDesignFieldsValue ? (input as DesignInput) : {
        design_name_1: 'No Design',
        design_html_1: '',
        design_name_2: 'No Design',
        design_html_2: '',
        design_name_3: 'No Design',
        design_html_3: '',
      });
      let selectedDesignHtml = '';
      if (selectedDesign === designsToUse.design_name_1) {
        selectedDesignHtml = designsToUse.design_html_1;
      } else if (selectedDesign === designsToUse.design_name_2) {
        selectedDesignHtml = designsToUse.design_html_2;
      } else if (selectedDesign === designsToUse.design_name_3) {
        selectedDesignHtml = designsToUse.design_html_3;
      }
      
      // Prepare the successful response
      const response: any = {
        success: true,
        message: `✅ Great choice! You selected: "${selectedDesign}"`,
        url: url,
        design_options: [
          { 
            name: designsToUse.design_name_1, 
            description: "Option 1",
            selected: selectedDesign === designsToUse.design_name_1,
            preview: designsToUse.design_html_1.substring(0, 100) + (designsToUse.design_html_1.length > 100 ? '...' : '')
          },
          { 
            name: designsToUse.design_name_2, 
            description: "Option 2", 
            selected: selectedDesign === designsToUse.design_name_2,
            preview: designsToUse.design_html_2.substring(0, 100) + (designsToUse.design_html_2.length > 100 ? '...' : '')
          },
          { 
            name: designsToUse.design_name_3, 
            description: "Option 3",
            selected: selectedDesign === designsToUse.design_name_3,
            preview: designsToUse.design_html_3.substring(0, 100) + (designsToUse.design_html_3.length > 100 ? '...' : '')
          }
        ],
        selectedDesign: selectedDesign,
        selectedDesignHtml: selectedDesignHtml,
        selectionTimestamp: new Date().toISOString(),
        selectionDuration: Date.now() - startTime,
        selection_context: {
          purpose: purposeMetadata,
          references,
          view_mode: viewMode,
          reference_error: referenceError
        },
        next_steps: [
          "🎨 Copy the selected HTML code from the 'selectedDesignHtml' field",
          "✨ Integrate the design into your project",
          "🔄 Run the tool again to compare more design variations",
          "🛠️ Customize the selected design to match your brand"
        ],
        usage_info: {
          frameworks_supported: ["Tailwind CSS", "Bootstrap", "Bulma", "Foundation", "Semantic UI", "Vanilla CSS"],
          features: ["Automatic framework detection", "Adaptive layout (gallery/card)", "CSS isolation", "Mobile responsive", "Real-time selection"],
          keyboard_shortcuts: { "1": "Select first design", "2": "Select second design", "3": "Select third design", "Escape": "Close zoom view" },
          ai_generation: {
            supported: true,
            model: "MiniMax-M2.1",
            requires_api_key: true,
            env_variable: "MINIMAX_API_KEY"
          }
        },
      };

      // Add generation metadata if using prompt workflow
      if (generationMetadata) {
        response.generation = {
          model: generationMetadata.model,
          prompt_used: generationMetadata.prompt_used,
          framework: generationMetadata.framework,
          style_preference: generationMetadata.style_preference,
          component_type: generationMetadata.component_type,
          tokens_used: null, // Would be populated from API response
          generation_time_ms: Date.now() - startTime,
        };
      }
      
      // Server is already closed after selection, but ensure cleanup in case of any edge cases
      // (This is a safety net - server should already be closed above)
      setTimeout(() => {
        try {
          stopLocalServer();
        } catch (shutdownError) {
          // Silent error handling for shutdown - server may already be closed
        }
      }, 1000);
      
      // Return the enhanced response
      return response;
    } catch (error) {
      // Ensure we clean up the server in case of any error
      try {
        stopLocalServer();
      } catch (cleanupError) {
        // Silent error handling
      }
      
      // Determine if this was a prompt workflow error
      const isPromptError = isPromptWorkflow(input) || 
        (error instanceof Error && error.message.includes('MiniMax'));

      // Get hasDesignFields for error handling
      const hasDesignFieldsForError = 'design_name_1' in input && input.design_name_1 && 'design_html_1' in input && input.design_html_1;

      // Use finalDesigns if available, otherwise fallback
      const errorDesigns = finalDesigns || (hasDesignFieldsForError ? (input as DesignInput) : {
        design_name_1: 'Error',
        design_html_1: '',
        design_name_2: 'Error',
        design_html_2: '',
        design_name_3: 'Error',
        design_html_3: '',
      });

      // Return an error response
      return {
        success: false,
        error: true,
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        url: null,
        design_options: [
          { 
            name: isPromptWorkflow(input) ? 'Generated Design 1' : errorDesigns.design_name_1, 
            description: "Option 1",
            preview: isPromptWorkflow(input) ? 'N/A - generation failed' : (errorDesigns.design_html_1 ? errorDesigns.design_html_1.substring(0, 100) + (errorDesigns.design_html_1.length > 100 ? '...' : '') : 'No HTML provided')
          },
          { 
            name: isPromptWorkflow(input) ? 'Generated Design 2' : errorDesigns.design_name_2, 
            description: "Option 2",
            preview: isPromptWorkflow(input) ? 'N/A - generation failed' : (errorDesigns.design_html_2 ? errorDesigns.design_html_2.substring(0, 100) + (errorDesigns.design_html_2.length > 100 ? '...' : '') : 'No HTML provided')
          },
          { 
            name: isPromptWorkflow(input) ? 'Generated Design 3' : errorDesigns.design_name_3, 
            description: "Option 3",
            preview: isPromptWorkflow(input) ? 'N/A - generation failed' : (errorDesigns.design_html_3 ? errorDesigns.design_html_3.substring(0, 100) + (errorDesigns.design_html_3.length > 100 ? '...' : '') : 'No HTML provided')
          }
        ],
        selectedDesign: null,
        selectedDesignHtml: null,
        selectionTimestamp: null,
        selectionDuration: Date.now() - startTime,
        selection_context: {
          purpose: purposeMetadata,
          references,
          view_mode: viewMode,
          reference_error: referenceError
        },
        troubleshooting: [
          "✅ Ensure all design names are provided and not empty",
          "✅ Verify all HTML content is valid and not empty", 
          "✅ Remove any <script> tags or JavaScript code for security",
          "✅ Check that your browser allows popups from localhost",
          "✅ Try running the tool again if it was a temporary issue"
        ],
        help: {
          common_issues: {
            "Empty names/HTML": "All design names and HTML content must be provided",
            "Script tags": "JavaScript and script tags are blocked for security reasons", 
            "Popup blocked": "Allow popups for localhost in your browser settings",
            "Port in use": "Another instance might be running - wait a moment and try again",
            "API key missing": "Set MINIMAX_API_KEY environment variable for prompt-based generation",
            "API error": "Check your MiniMax API key and quota"
          },
          example_usage: {
            // Prompt-based examples
            prompt_based: {
              simple: {
                prompt: "Create 3 modern button designs for a SaaS dashboard",
                style_preference: "clean and professional",
                framework: "tailwind"
              },
              detailed: {
                prompt: "Design a product card for an e-commerce site with image, title, price, and Add to Cart button",
                style_preference: "modern and sleek",
                framework: "bootstrap",
                component_type: "card"
              }
            },
            // Legacy examples
            legacy: {
              design_name_1: "Modern Button",
              design_html_1: "<button class='bg-blue-500 text-white px-4 py-2 rounded'>Click me</button>",
              design_name_2: "Classic Button", 
              design_html_2: "<button style='background: blue; color: white; padding: 8px 16px; border: none; border-radius: 4px;'>Click me</button>",
              design_name_3: "Outlined Button",
              design_html_3: "<button style='border: 2px solid blue; color: blue; background: transparent; padding: 8px 16px; border-radius: 4px;'>Click me</button>"
            }
          },
          prompt_tips: [
            "Be specific about the component type (button, card, form, etc.)",
            "Mention the target framework (tailwind, bootstrap, etc.)",
            "Describe the style you prefer (minimal, modern, colorful, etc.)",
            "Include any specific requirements or use cases",
            "Keep prompts under 1000 characters for best results"
          ]
        },
        ...(isPromptError ? { 
          api_help: {
            required_env: "MINIMAX_API_KEY",
            setup_instructions: "Set MINIMAX_API_KEY environment variable with your MiniMax API key",
            get_api_key: "Visit https://platform.minimax.io to get your API key",
            supported_frameworks: ["tailwind", "bootstrap", "bulma", "foundation", "semantic ui", "plain css"],
            example: "export MINIMAX_API_KEY='your-api-key-here'"
          }
        } : {}),
      };
    }
  }
}

export default DesignselectionTool;
