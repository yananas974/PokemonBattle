export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 10000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    };
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : '';
    const fullUrl = `${this.config.baseURL || ''}${url}${queryString}`;
    
    return this.request<T>('GET', fullUrl);
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL || ''}${url}`;
    return this.request<T>('POST', fullUrl, data);
  }

  private async request<T>(
    method: string, 
    url: string, 
    data?: any
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= (this.config.retries || 1); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method,
          headers: this.config.headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.config.retries) {
          throw new Error(`Request failed after ${this.config.retries} attempts: ${lastError.message}`);
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw lastError!;
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
