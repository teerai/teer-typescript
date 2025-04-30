import { Teer, FetchFunction } from '../src/index'

async function main() {
  // Create a custom fetch implementation that logs requests
  const customFetch: FetchFunction = async (url, init) => {
    console.log(`Making request to: ${url}`)
    console.log(`Method: ${init?.method}`)
    
    // Call the original fetch
    const response = await fetch(url, init)
    
    console.log(`Response status: ${response.status}`)
    
    // Return a cloned response since the original might be consumed
    return response.clone()
  }

  // Initialize the client with your API key and custom fetch
  const client = new Teer('your-api-key', {
    customFetch,
  })

  try {
    // Send usage data with the custom fetch
    const response = await client.ingest.send({
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      function_id: 'custom-fetch-example',
      usage: {
        input: 1000,
        output: 2000,
      },
    })

    console.log('Response:', response)
  } catch (error) {
    console.error('Error:', error)
  }
}

main().catch(console.error)
