const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Helper delay function
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch wrapper that retries once on transient errors (network failures, 429, 500, 502, 503, 504)
 * with an exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { signal?: AbortSignal },
  maxRetries = 1,
  initialDelayMs = 1000
): Promise<Response> {
  let attempt = 0;

  while (true) {
    try {
      if (options.signal?.aborted) {
        throw new DOMException('Request aborted', 'AbortError');
      }

      const response = await fetch(url, options);

      // Check if we should retry
      if (!response.ok && RETRY_STATUS_CODES.includes(response.status)) {
        if (attempt < maxRetries) {
          attempt++;
          const waitTime = initialDelayMs * Math.pow(2, attempt - 1);
          console.warn(
            `fetchWithRetry: Received status ${response.status}. Retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})...`
          );
          await delay(waitTime);
          continue;
        }
      }

      return response;
    } catch (error: unknown) {
      // Don't retry if aborted
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      if (attempt < maxRetries) {
        attempt++;
        const waitTime = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `fetchWithRetry: Network error occurred. Retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})...`,
          error
        );
        await delay(waitTime);
        continue;
      }

      throw error;
    }
  }
}
