import Teer, { TeerAPIError, TeerTimeoutError, TeerNetworkError, RequestConfigOptions } from '../src/index'

async function main() {
  // Initialize the client with your API key and default request configuration
  const client = new Teer('your-api-key', {
    timeoutMs: 8000, // 8 second default timeout
    maxRetries: 2, // Maximum 2 retries by default
    retryDelayMs: 500, // Start with 500ms delay by default
  })

  try {
    // Display the client's default request configuration
    console.log('Default request config:', client.defaultRequestConfig)

    // Send usage data to track.teer.ai (handled automatically by the IngestResource)
    // First request uses the client's default request configuration
    const response1 = await client.ingest.send({
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      function_id: 'request-with-defaults',
      usage: {
        input: 1000,
        output: 2000,
      },
    })

    console.log('First request successful')

    // Second request overrides specific options at the method level
    const response2 = await client.ingest.send(
      {
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        function_id: 'request-with-overrides',
        usage: {
          input: 1500,
          output: 3000,
        },
      },
      {
        // Override just the timeout for this specific request
        timeoutMs: 3000, // 3 second timeout (overrides the client default of 8000)
        // maxRetries and retryDelayMs will use the client defaults
      }
    )

    console.log('First request response:', response1)
    console.log('Second request response:', response2)

    // Future API endpoints would be added as new resources
    // For example:
    /*
    // This would use the main api.teer.ai endpoint
    const userInfo = await client.users.get('user-123')
    console.log('User info:', userInfo)
    */
  } catch (error) {
    // Comprehensive error handling
    if (error instanceof TeerAPIError) {
      // Handle API errors (400, 401, 403, 404, 429, 500, etc.)
      console.error(`API Error (${error.status}): ${error.message}`)

      if (error.isRateLimitError) {
        // Handle rate limiting (429)
        console.error('Rate limit exceeded. Try again later.')
      } else if (error.isClientError) {
        // Handle client errors (4xx)
        console.error('Client error:', error.data)
      } else if (error.isServerError) {
        // Handle server errors (5xx)
        console.error('Server error. Please try again later.')
      }
    } else if (error instanceof TeerTimeoutError) {
      // Handle timeout errors
      console.error(`Request timed out after ${error.timeoutMs}ms`)
    } else if (error instanceof TeerNetworkError) {
      // Handle network connectivity issues
      console.error('Network error:', error.message)
    } else {
      // Handle other errors
      console.error('Error:', error.message)
    }
  }
}

main()
