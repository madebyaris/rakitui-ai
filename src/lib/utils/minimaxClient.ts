import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * MiniMax API Client for generating UI component designs
 * 
 * API Endpoint: https://api.minimax.io/v1
 * Model: MiniMax-M2.1
 */

export interface MiniMaxConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  timeout?: number;
}

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxRequest {
  model: string;
  messages: MiniMaxMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface MiniMaxResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: MiniMaxMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DesignGenerationResult {
  success: boolean;
  designs?: Array<{
    name: string;
    html: string;
    description: string;
  }>;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  generationTimeMs?: number;
}

export class MiniMaxClient {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private timeout: number;
  private baseUrl: string = 'https://api.minimax.io/v1';

  constructor(config: MiniMaxConfig = {}) {
    this.apiKey = config.apiKey || process.env.MINIMAX_API_KEY || '';
    this.model = config.model || 'MiniMax-M2.1';
    this.maxTokens = config.maxTokens || 64000;
    this.timeout = config.timeout || 300000; // 5 minutes default
  }

  /**
   * Validate that API key is configured
   */
  validateConfig(): void {
    if (!this.apiKey) {
      throw new Error('MINIMAX_API_KEY environment variable is not set. Please configure it before using the design generation feature.');
    }
  }

  /**
   * Make a request to the MiniMax API
   */
  async callAPI(request: MiniMaxRequest): Promise<MiniMaxResponse> {
    this.validateConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: request.messages,
          max_tokens: request.max_tokens || this.maxTokens,
          temperature: request.temperature || 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }

        throw new Error(`MiniMax API error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json() as MiniMaxResponse;
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`MiniMax API request timed out after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Generate designs based on a prompt
   */
  async generateDesigns(
    prompt: string,
    framework: string = 'tailwind',
    stylePreference?: string
  ): Promise<DesignGenerationResult> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.getSystemPrompt();
      const userPrompt = this.buildDesignPrompt(prompt, framework, stylePreference);

      const response = await this.callAPI({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      const designs = this.parseDesignsFromResponse(content);

      if (!designs || designs.length === 0) {
        return {
          success: false,
          error: 'Failed to parse designs from API response',
          usage: response.usage,
          generationTimeMs: Date.now() - startTime,
        };
      }

      return {
        success: true,
        designs,
        usage: response.usage,
        generationTimeMs: Date.now() - startTime,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        generationTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Get the system prompt for design generation
   */
  private getSystemPrompt(): string {
    return `You are an expert UI/UX designer specializing in creating beautiful, accessible, and modern web components.

Your designs follow these principles:
- Visually appealing with proper spacing and visual hierarchy
- Responsive and mobile-friendly
- Following modern design principles
- Accessible with proper contrast ratios and semantic HTML
- Clean and maintainable code structure

When generating HTML:
- Use semantic HTML5 elements
- Include appropriate ARIA attributes for accessibility
- Add hover and focus states for interactive elements
- Use smooth transitions (200-300ms)
- Ensure mobile-first responsive design
- Maintain consistent spacing using the framework's spacing system

Output format: You must output valid JSON only, without any additional text or markdown formatting.`;
  }

  /**
   * Build the design generation prompt
   */
  private buildDesignPrompt(
    userPrompt: string,
    framework: string,
    stylePreference?: string
  ): string {
    let prompt = `Generate 3 distinct UI component designs for: ${userPrompt}

Requirements:
1. Design 1 - Modern/Clean: A contemporary design with smooth visual effects
2. Design 2 - Minimal/Simple: A clean, understated design with subtle interactions
3. Design 3 - Bold/Feature-rich: A visually striking design with enhanced visual elements

Constraints:
- Use ${framework} CSS framework
- All designs must be visually distinct from each other
- Include hover, focus, and active states for interactive elements
- Use semantic HTML elements
- Ensure proper contrast ratios (WCAG AA minimum)
- Add smooth transitions (200-300ms duration)
- Mobile-first responsive approach

Framework-specific requirements:`;

    switch (framework.toLowerCase()) {
      case 'tailwind':
        prompt += `
- Use utility classes for all styling
- Leverage Tailwind's color palette and spacing scale
- Use Tailwind's transition and transform utilities
- Follow Tailwind's naming conventions`;
        break;
      case 'bootstrap':
        prompt += `
- Use Bootstrap's component classes
- Leverage Bootstrap's color system
- Use Bootstrap's grid for responsive layout
- Follow Bootstrap's component patterns`;
        break;
      case 'bulma':
        prompt += `
- Use Bulma's component classes
- Leverage Bulma's color palette
- Use Bulma's columns for responsive design
- Follow Bulma's naming conventions`;
        break;
      case 'foundation':
        prompt += `
- Use Foundation's component classes
- Leverage Foundation's grid system
- Follow Foundation's patterns`;
        break;
      case 'semantic ui':
        prompt += `
- Use Semantic UI's component classes
- Leverage Semantic UI's theming system`;
        break;
      default:
        prompt += `
- Use inline styles for custom CSS
- Follow CSS best practices`;
    }

    if (stylePreference) {
      prompt += `\n\nStyle preference: ${stylePreference}`;
    }

    prompt += `

Output Format - JSON ONLY (no markdown, no explanations):
{
  "designs": [
    {
      "name": "Descriptive name for this design",
      "html": "Complete HTML code with all classes/styles inline",
      "description": "Brief description of the design approach and when to use it"
    }
  ]
}`;

    return prompt;
  }

  /**
   * Parse designs from the API response
   */
  private parseDesignsFromResponse(content: string): Array<{
    name: string;
    html: string;
    description: string;
  }> | null {
    try {
      // Try to extract JSON from the response
      let jsonContent = content.trim();

      // Remove markdown code block wrappers if present
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');

      // Try to find JSON within the text
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonContent);

      if (parsed.designs && Array.isArray(parsed.designs)) {
        return parsed.designs.map((design: any) => ({
          name: design.name || 'Unnamed Design',
          html: design.html || '',
          description: design.description || '',
        }));
      }

      return null;
    } catch (error) {
      console.error('Failed to parse designs from response:', error);
      return null;
    }
  }

  /**
   * Check if the API is accessible and credentials are valid
   */
  async healthCheck(): Promise<boolean> {
    try {
      this.validateConfig();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance for easy use
export const minimaxClient = new MiniMaxClient();
