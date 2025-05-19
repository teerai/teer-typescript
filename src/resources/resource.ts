import { TeerError, TeerNetworkError } from '../errors'
import { RequestOptions, RequestConfigOptions } from '../types'

// Forward declaration to avoid circular dependency
export interface TeerClient {
  makeRequest<T = any>(path: string, method: string, data?: any, resourceBaseUrl?: string, options?: RequestConfigOptions): Promise<T>
  readonly baseURL: string
  readonly trackURL: string
  readonly defaultRequestConfig: RequestConfigOptions
}

/**
 * Base Resource class that all resource classes will extend
 */
export abstract class Resource {
  constructor(protected client: TeerClient, protected basePath: string = '', protected resourceBaseUrl?: string) {}

  /**
   * Get the full path for this resource
   */
  protected getPath(subPath: string = ''): string {
    if (subPath) {
      return this.basePath ? `${this.basePath}/${subPath}` : subPath
    }
    return this.basePath
  }

  /**
   * Make a request to the API
   *
   * @param options Request options
   * @param requestOptions Additional options for the request (timeout, retries, etc.)
   */
  protected async request<T = any>(options: RequestOptions, requestOptions?: RequestConfigOptions): Promise<T> {
    try {
      const { method, path, data } = options
      const fullPath = this.getPath(path)
      return await this.client.makeRequest<T>(fullPath, method, data, this.resourceBaseUrl, requestOptions)
    } catch (error) {
      // Wrap network errors that aren't already TeerErrors
      if (error instanceof Error && !(error instanceof TeerError)) {
        if (error.name === 'TypeError' || error.name === 'NetworkError' || error.message.includes('network')) {
          throw new TeerNetworkError({
            cause: error,
            request: {
              method: options.method,
              path: this.getPath(options.path),
              baseUrl: this.resourceBaseUrl || this.client.baseURL,
            },
          })
        }
      }

      // Re-throw other errors
      throw error
    }
  }
}
