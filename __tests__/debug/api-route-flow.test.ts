/**
 * Debug test to understand API route error flow
 */

import { createMockRequestWithFormData } from '../helpers/api-test-utils';
import {
  mockMessagesCreate,
  AuthenticationError,
} from '../__mocks__/@anthropic-ai/sdk';

// Mock NextResponse
const mockNextResponseJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
  NextRequest: jest.fn(),
}));

jest.mock('@anthropic-ai/sdk');

describe('API Route Error Flow Debug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponseJson.mockImplementation((data, options) => ({
      data,
      options,
    }));
  });

  test('should handle AuthenticationError in API route', async () => {
    // Setup mock to throw our AuthenticationError
    const authError = new AuthenticationError('Invalid API key');
    console.log('Mock will throw:', authError);
    console.log('Error name:', authError.name);
    console.log('Error message:', authError.message);

    mockMessagesCreate.mockRejectedValue(authError);

    // Create request with personal API key
    const mockFile = new File(['test content'], 'fridge.jpg', {
      type: 'image/jpeg',
    });
    const formData = new FormData();
    formData.append('image', mockFile);
    formData.append('apiKey', 'sk-ant-api03-personal-key-12345');
    formData.append('locale', 'en');

    const request = createMockRequestWithFormData(formData);

    // Import and call the API route
    const { POST } = await import('@/app/api/analyze-fridge/route');

    try {
      await POST(request);
    } catch (error) {
      console.log('Uncaught error from POST:', error);
    }

    console.log('mockNextResponseJson calls:', mockNextResponseJson.mock.calls);

    // Check what was actually called
    expect(mockNextResponseJson).toHaveBeenCalled();
    const [responseData, responseOptions] = mockNextResponseJson.mock.calls[0];
    console.log('Response data:', responseData);
    console.log('Response options:', responseOptions);
  });
});
