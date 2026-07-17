import type { ProviderResponse } from './types';
import type { AIConfig } from './config';

/**
 * Provider interface — all AI providers must implement this contract.
 * The AI service communicates only through this interface.
 */
export interface AIProvider {
  /** Unique identifier for this provider (e.g. 'nvidia') */
  readonly name: string;

  /**
   * Send a chat completion request to the provider.
   *
   * @param config - Validated AI configuration (api key, model, base URL)
   * @param systemPrompt - System-level instructions for the model
   * @param userPrompt - User-level prompt with story context
   * @returns Raw provider response with content and token usage
   * @throws {AIError} on network, timeout, or provider errors
   */
  generate(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<ProviderResponse>;

  /**
   * Send a streaming chat completion request to the provider.
   *
   * @param config - Validated AI configuration (api key, model, base URL)
   * @param systemPrompt - System-level instructions for the model
   * @param userPrompt - User-level prompt with story context
   * @param signal - Optional AbortSignal to cancel the streaming request
   * @returns A ReadableStream of text chunks from the provider
   * @throws {AIError} on network, timeout, or provider errors
   */
  generateStream(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ): Promise<ReadableStream<string>>;
}
