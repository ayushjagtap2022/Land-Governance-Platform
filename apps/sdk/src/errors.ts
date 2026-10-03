/**
 * Custom Error Classes for Land Governance Platform SDK.
 */

export class LandGovernanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LandGovernanceError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LandGovernanceNetworkError extends LandGovernanceError {
  public originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'LandGovernanceNetworkError';
    this.originalError = originalError;
  }
}

export class LandGovernanceTimeoutError extends LandGovernanceError {
  public timeoutMs: number;

  constructor(timeoutMs: number, url: string) {
    super(`Request to ${url} timed out after ${timeoutMs}ms.`);
    this.name = 'LandGovernanceTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class LandGovernanceApiError extends LandGovernanceError {
  public status: number;
  public statusText: string;
  public url: string;
  public method: string;
  public data: any;

  constructor(options: {
    status: number;
    statusText: string;
    url: string;
    method: string;
    data: any;
  }) {
    let extractedMessage = `API request failed with status ${options.status}: ${options.statusText}`;

    if (options.data) {
      if (typeof options.data === 'string') {
        extractedMessage = options.data;
      } else if (typeof options.data.detail === 'string') {
        extractedMessage = options.data.detail;
      } else if (Array.isArray(options.data.detail)) {
        // FastAPI validation errors: [{ loc: [...], msg: "...", type: "..." }]
        extractedMessage = options.data.detail
          .map((d: any) => (d.loc ? `${d.loc.join('.')}: ${d.msg}` : d.msg || JSON.stringify(d)))
          .join(', ');
      } else if (options.data.message) {
        extractedMessage = options.data.message;
      }
    }

    super(extractedMessage);
    this.name = 'LandGovernanceApiError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.method = options.method;
    this.data = options.data;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}
