// Unit tests for analyze-fridge core - Business logic with dependency injection
import {
  validateFileInput,
  fileToBase64,
  parseRecipeFromResponse,
  createAnthropicMessageParams,
  analyzeUserFridge,
  classifyAnalysisError,
} from '@/lib/analyze-fridge/core';
import { createTestDependencies } from '@/lib/analyze-fridge/dependencies';
import { AnalyzeFridgeInput } from '@/lib/analyze-fridge/types';

// Mock APP_CONFIG
jest.mock('@/lib/constants', () => ({
  APP_CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ERROR_MESSAGES: {
      FILE_TOO_LARGE: 'File too large',
      INVALID_FILE_TYPE: 'Invalid file type',
      API_ERROR: 'API error occurred',
    },
  },
}));

// Mock Buffer for Node.js environment
const mockBuffer = {
  from: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('base64encodedstring'),
  }),
};
(global as unknown as { Buffer: typeof mockBuffer }).Buffer = mockBuffer;

describe('analyze-fridge core', () => {
  // Helper to create mock file
  const createMockFile = (
    name: string = 'test.jpg',
    type: string = 'image/jpeg',
    size: number = 1024
  ): File => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  describe('validateFileInput', () => {
    it('should validate correct file input', () => {
      const files = [createMockFile()];
      const result = validateFileInput(files);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty file array', () => {
      const result = validateFileInput([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No image file provided');
    });

    it('should reject oversized file', () => {
      const files = [createMockFile('big.jpg', 'image/jpeg', 10 * 1024 * 1024)]; // 10MB
      const result = validateFileInput(files);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File too large');
    });

    it('should reject invalid file type', () => {
      const files = [createMockFile('doc.txt', 'text/plain')];
      const result = validateFileInput(files);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type');
    });
  });

  describe('fileToBase64', () => {
    it('should convert file to base64', async () => {
      const file = createMockFile();
      // Mock arrayBuffer method
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const result = await fileToBase64(file);

      expect(result).toBe('base64encodedstring');
      expect(file.arrayBuffer).toHaveBeenCalled();
      expect(mockBuffer.from).toHaveBeenCalled();
    });
  });

  describe('parseRecipeFromResponse', () => {
    it('should parse valid JSON recipe', () => {
      const validResponse = JSON.stringify({
        title: 'Test Recipe',
        description: 'A test recipe',
        cookingTime: '30 minutes',
        difficulty: 'Easy',
        servings: 4,
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        tips: ['tip 1'],
      });

      const result = parseRecipeFromResponse(validResponse);

      expect(result.recipe).toBeDefined();
      expect(result.recipe?.title).toBe('Test Recipe');
      expect(result.error).toBeUndefined();
    });

    it('should extract JSON from text with extra content', () => {
      const responseWithExtra = `
        Here's your recipe:
        ${JSON.stringify({
          title: 'Extracted Recipe',
          description: 'Description',
          cookingTime: '25 minutes',
          difficulty: 'Medium',
          servings: 2,
          ingredients: ['flour'],
          instructions: ['mix'],
        })}
        Hope this helps!
      `;

      const result = parseRecipeFromResponse(responseWithExtra);

      expect(result.recipe).toBeDefined();
      expect(result.recipe?.title).toBe('Extracted Recipe');
    });

    it('should handle invalid JSON', () => {
      const result = parseRecipeFromResponse('invalid json');

      expect(result.recipe).toBeUndefined();
      expect(result.error).toBe(
        'Failed to generate a valid recipe. Please try again.'
      );
    });

    it('should validate recipe schema', () => {
      const invalidRecipe = JSON.stringify({
        title: 'Test Recipe',
        // Missing required fields
      });

      const result = parseRecipeFromResponse(invalidRecipe);

      expect(result.recipe).toBeUndefined();
      expect(result.error).toBe(
        'Failed to generate a valid recipe. Please try again.'
      );
    });
  });

  describe('createAnthropicMessageParams', () => {
    it('should create correct message parameters', () => {
      const params = createAnthropicMessageParams(
        'Test prompt',
        'base64data',
        'image/jpeg'
      );

      expect(params.model).toBe('claude-3-5-sonnet-20241022');
      expect(params.max_tokens).toBe(2000);
      expect(params.messages).toHaveLength(1);
      expect(params.messages[0].role).toBe('user');
      expect(params.messages[0].content).toHaveLength(2);

      const imageContent = params.messages[0].content[0];
      expect(imageContent.type).toBe('image');
      if ('source' in imageContent) {
        expect((imageContent.source as { data: string }).data).toBe(
          'base64data'
        );
      }

      const textContent = params.messages[0].content[1];
      expect(textContent.type).toBe('text');
      if ('text' in textContent) {
        expect(textContent.text).toBe('Test prompt');
      }
    });
  });

  describe('analyzeUserFridge', () => {
    it('should analyze fridge successfully with mocked dependencies', async () => {
      const mockClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  title: 'Mock Recipe',
                  description: 'A mocked recipe',
                  cookingTime: '20 minutes',
                  difficulty: 'Easy',
                  servings: 2,
                  ingredients: ['mock ingredient'],
                  instructions: ['mock step'],
                }),
              },
            ],
          }),
        },
      };

      const dependencies = createTestDependencies(mockClient);
      const file = createMockFile();
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const input: AnalyzeFridgeInput = {
        files: [file],
        userSettings: null,
        preferences: null,
        dietaryRestrictions: null,
        locale: 'en',
        apiKey: 'sk-ant-api-test',
      };

      const result = await analyzeUserFridge(input, dependencies);

      expect(result.recipe.title).toBe('Mock Recipe');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(mockClient.messages.create).toHaveBeenCalled();
    });

    it('should handle file validation errors', async () => {
      const dependencies = createTestDependencies({
        messages: { create: jest.fn() },
      });

      const input: AnalyzeFridgeInput = {
        files: [], // No files
        userSettings: null,
        preferences: null,
        dietaryRestrictions: null,
        locale: 'en',
        apiKey: 'sk-ant-api-test',
      };

      await expect(analyzeUserFridge(input, dependencies)).rejects.toThrow(
        'No image file provided'
      );
    });

    it('should handle API errors', async () => {
      const mockClient = {
        messages: {
          create: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      };

      const dependencies = createTestDependencies(mockClient);
      const file = createMockFile();
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const input: AnalyzeFridgeInput = {
        files: [file],
        userSettings: null,
        preferences: null,
        dietaryRestrictions: null,
        locale: 'en',
        apiKey: 'sk-ant-api-test',
      };

      await expect(analyzeUserFridge(input, dependencies)).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('classifyAnalysisError', () => {
    it('should classify authentication errors', () => {
      const error = new Error('401 unauthorized');
      const result = classifyAnalysisError(error);

      expect(result.status).toBe(401);
      expect(result.isAuthError).toBe(true);
      expect(result.message).toContain('Invalid API key');
    });

    it('should classify rate limit errors', () => {
      const error = new Error('rate_limit exceeded');
      const result = classifyAnalysisError(error);

      expect(result.status).toBe(429);
      expect(result.isRateLimit).toBe(true);
      expect(result.message).toContain('temporarily busy');
    });

    it('should classify invalid request errors', () => {
      const error = new Error('invalid_request format');
      const result = classifyAnalysisError(error);

      expect(result.status).toBe(400);
      expect(result.message).toContain('Invalid image format');
    });

    it('should classify permission errors', () => {
      const error = new Error('403 forbidden');
      const result = classifyAnalysisError(error);

      expect(result.status).toBe(403);
      expect(result.message).toContain('Access denied');
    });

    it('should default to 500 for unknown errors', () => {
      const error = new Error('Unknown error');
      const result = classifyAnalysisError(error);

      expect(result.status).toBe(500);
      expect(result.message).toBe('API error occurred');
    });
  });
});
