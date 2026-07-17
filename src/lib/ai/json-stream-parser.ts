/**
 * Stateful translator that takes a raw, streaming JSON string chunk-by-chunk
 * and outputs structured Server-Sent Events (SSE) for the workspace UI.
 *
 * Events Emitted:
 * - stage (connecting | generating_a | generating_b | finalizing | completed | error)
 * - variant_a_start
 * - variant_a_delta (payload: { delta: string })
 * - variant_a_complete (payload: { title: string, summary: string, estimatedDuration: string })
 * - variant_b_start
 * - variant_b_delta (payload: { delta: string })
 * - variant_b_complete (payload: { title: string, summary: string, estimatedDuration: string })
 */
export class JSONStreamToSSE {
  private started = false;
  private inString = false;
  private isEscaped = false;
  private activeVariant: 'A' | 'B' | null = null;
  private activeKey:
    'title' | 'summary' | 'fullScript' | 'estimatedDuration' | null = null;

  private currentStringVal = '';

  // Track status to avoid double-emitting starts and completes
  private emittedStartA = false;
  private emittedCompleteA = false;
  private emittedStartB = false;
  private emittedCompleteB = false;

  // Metadata accumulators to send at complete events
  private metaA = { title: '', summary: '', estimatedDuration: '' };
  private metaB = { title: '', summary: '', estimatedDuration: '' };

  constructor(private onSSE: (event: string, data: string) => void) {}

  /**
   * Process a chunk of raw text.
   */
  write(chunk: string) {
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];

      // 1. Ignore preambles until we see the start of the JSON object
      if (!this.started) {
        if (char === '{') {
          this.started = true;
          this.onSSE('stage', 'connecting');
        }
        continue;
      }

      // 2. Handle escape sequences inside string values
      if (this.isEscaped) {
        let escapedChar = char;
        if (char === 'n') {
          escapedChar = '\n';
        } else if (char === 't') {
          escapedChar = '\t';
        } else if (char === 'r') {
          escapedChar = '\r';
        }

        this.currentStringVal += escapedChar;

        // If streaming the fullScript delta, emit it immediately
        if (this.activeKey === 'fullScript' && this.activeVariant) {
          const eventName =
            this.activeVariant === 'A' ? 'variant_a_delta' : 'variant_b_delta';
          this.onSSE(eventName, JSON.stringify({ delta: escapedChar }));
        }

        this.isEscaped = false;
        continue;
      }

      if (char === '\\') {
        if (this.inString) {
          this.isEscaped = true;
        }
        continue;
      }

      // 3. Handle string delimiters
      if (char === '"') {
        if (this.inString) {
          this.inString = false;
          const val = this.currentStringVal;

          if (val === 'variantA') {
            this.activeVariant = 'A';
            this.activeKey = null;
          } else if (val === 'variantB') {
            this.activeVariant = 'B';
            this.activeKey = null;
          } else if (
            ['title', 'summary', 'fullScript', 'estimatedDuration'].includes(
              val
            )
          ) {
            this.activeKey = val as
              'title' | 'summary' | 'fullScript' | 'estimatedDuration';

            // Trigger starts/completes based on key transitions
            if (this.activeVariant === 'A' && !this.emittedStartA) {
              this.onSSE('stage', 'generating_a');
              this.onSSE('variant_a_start', '');
              this.emittedStartA = true;
            } else if (this.activeVariant === 'B' && !this.emittedStartB) {
              if (this.emittedStartA && !this.emittedCompleteA) {
                this.onSSE('variant_a_complete', JSON.stringify(this.metaA));
                this.emittedCompleteA = true;
              }
              this.onSSE('stage', 'generating_b');
              this.onSSE('variant_b_start', '');
              this.emittedStartB = true;
            }
          } else {
            // Assign metadata values if we are not reading fullScript
            if (this.activeVariant && this.activeKey) {
              if (this.activeKey === 'title') {
                if (this.activeVariant === 'A') {
                  this.metaA.title = val;
                } else {
                  this.metaB.title = val;
                }
              } else if (this.activeKey === 'summary') {
                if (this.activeVariant === 'A') {
                  this.metaA.summary = val;
                } else {
                  this.metaB.summary = val;
                }
              } else if (this.activeKey === 'estimatedDuration') {
                if (this.activeVariant === 'A') {
                  this.metaA.estimatedDuration = val;
                } else {
                  this.metaB.estimatedDuration = val;
                }
              }
              this.activeKey = null;
            }
          }

          this.currentStringVal = '';
        } else {
          this.inString = true;
          this.currentStringVal = '';
        }
        continue;
      }

      // 4. Accumulate characters when inside a string
      if (this.inString) {
        this.currentStringVal += char;

        if (this.activeKey === 'fullScript' && this.activeVariant) {
          const eventName =
            this.activeVariant === 'A' ? 'variant_a_delta' : 'variant_b_delta';
          this.onSSE(eventName, JSON.stringify({ delta: char }));
        }
      }
    }
  }

  /**
   * Flush any remaining states at the end of the stream.
   */
  flush() {
    if (this.emittedStartA && !this.emittedCompleteA) {
      this.onSSE('variant_a_complete', JSON.stringify(this.metaA));
      this.emittedCompleteA = true;
    }
    if (this.emittedStartB && !this.emittedCompleteB) {
      this.onSSE('variant_b_complete', JSON.stringify(this.metaB));
      this.emittedCompleteB = true;
    }
    this.onSSE('stage', 'finalizing');
  }
}
