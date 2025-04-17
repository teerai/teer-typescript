# Teer TypeScript SDK

[@teerai/sdk](https://www.npmjs.com/package/@teerai/sdk) provides an SDK to interact with the Teer API. Track usage events via the SDK.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/teerai/teer-typescript)

## Installation

```bash
npm install @teerai/sdk
# or
yarn add @teerai/sdk
# or
pnpm add @teerai/sdk
```

## Quick Start

```typescript
import Teer from '@teerai/sdk'

// Initialize the client with your API key
const client = new Teer('your-api-key')

// Send usage data
await client.ingest.send({
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  function_id: 'my-function',
  usage: {
    input: 1000,
    output: 2000,
  },
})
```

## Client Structure

The Teer client is designed with a namespaced resource structure, allowing for intuitive API access:

```typescript
// Basic resource usage
client.ingest.send(data)

// Example of nested resources (for future API endpoints)
client.example.list()
client.example.nested.action(data)
```

## API Resources

### Ingest

The `ingest` resource allows you to send usage data to Teer. This resource automatically uses the `track.teer.ai` API endpoint.

```typescript
await client.ingest.send({
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  function_id: 'my-function',
  usage: {
    input: 1000,
    output: 2000,
  },
})
```

## Advanced Usage

### Custom Base URLs

You can specify a custom base URL when initializing the client:

```typescript
const client = new Teer('your-api-key', 'https://custom-api.example.com')
```

The client architecture supports different base URLs for different resources:

- The main API endpoints use `api.teer.ai` by default
- The `ingest` resource automatically uses `track.teer.ai`

This separation allows the client to interact with different services while maintaining a consistent interface.

### Default Request Configuration

You can set default request configuration options when initializing the client:

```typescript
const client = new Teer(
  'your-api-key',
  undefined, // Use default base URL
  {
    timeoutMs: 8000, // 8 second default timeout
    maxRetries: 2, // Maximum 2 retries by default
    retryDelayMs: 500, // Start with 500ms delay by default
  }
)
```

These defaults will be used for all requests made through the client, but can be overridden at the individual request level:

```typescript
// Uses client default configuration
await client.ingest.send(data)

// Overrides just the timeout for this specific request
await client.ingest.send(data, { timeoutMs: 3000 })

// Overrides all request configuration options
await client.ingest.send(data, {
  timeoutMs: 5000,
  maxRetries: 5,
  retryDelayMs: 300,
})
```

The configuration options are applied with the following precedence (highest to lowest):

1. Options provided directly to the method call
2. Options set in the client constructor
3. Built-in default values

## Error Handling

The client implements robust error handling with custom error classes that provide detailed information about what went wrong.

### Error Types

- `TeerError`: Base class for all Teer-related errors
- `TeerAPIError`: Thrown when the API returns an error response
- `TeerTimeoutError`: Thrown when a request times out
- `TeerNetworkError`: Thrown when there's a network connectivity issue

### Handling Errors

```typescript
import { TeerAPIError, TeerTimeoutError, TeerNetworkError } from '@teerai/sdk'

try {
  await client.ingest.send(data)
} catch (error) {
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
```

### Automatic Retries

The client automatically retries requests that fail due to:

- Network errors
- Timeouts
- Server errors (5xx)
- Rate limiting (429)

You can customize retry behavior with options:

```typescript
await client.ingest.send(data, {
  timeoutMs: 5000, // 5 second timeout (default: 10000)
  maxRetries: 5, // Maximum 5 retries (default: 3)
  retryDelayMs: 500, // Start with 500ms delay (default: 300)
})
```
