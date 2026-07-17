import { AIError } from './types';

export interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_BASE_URL = 'https://integrate.api.nvidia.com/v1';

/**
 * Reads and validates AI configuration from environment variables at runtime.
 * Never caches — always reads fresh values.
 *
 * @throws {AIError} with code 'missing_api_key' if NVIDIA_API_KEY is not set
 */
export function getAIConfig(): AIConfig {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new AIError(
      'missing_api_key',
      'The NVIDIA_API_KEY environment variable is empty or not set.'
    );
  }

  return {
    apiKey: apiKey.trim(),
    model: (process.env.NVIDIA_MODEL || DEFAULT_MODEL).trim(),
    baseUrl: (
      process.env.NVIDIA_BASE_URL ||
      process.env.NVIDIA_API_BASE_URL ||
      DEFAULT_BASE_URL
    ).trim(),
  };
}
