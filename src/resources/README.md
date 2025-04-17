# Resources Directory

This directory contains all the API resources for the Teer client.

## Structure

- `resource.ts` - Base Resource class that all resources extend
- `ingest.ts` - IngestResource for sending usage data
- `index.ts` - Exports all resources

## Creating a New Resource

To add a new resource to the Teer client:

1. Create a new file in this directory (e.g., `users.ts`)
2. Import the base Resource class and necessary types
3. Implement your resource class extending the Resource class
4. Export your resource from the `index.ts` file
5. Add the resource to the Teer client in `src/index.ts`

### Example

```typescript
// src/resources/users.ts
import { Resource, TeerClient } from './resource'
import { RequestConfigOptions } from '../types'

export class UsersResource extends Resource {
  constructor(client: TeerClient) {
    super(client, 'users')
  }

  async get(id: string, options?: RequestConfigOptions): Promise<any> {
    return this.request(
      {
        method: 'GET',
        path: id,
      },
      options
    )
  }

  async list(options?: RequestConfigOptions): Promise<any> {
    return this.request(
      {
        method: 'GET',
        path: '',
      },
      options
    )
  }
}
```

Then update the `index.ts` file:

```typescript
// src/resources/index.ts
export { Resource, TeerClient } from './resource'
export { IngestResource } from './ingest'
export { UsersResource } from './users'
```

Finally, update the Teer client in `src/index.ts`:

```typescript
export class Teer {
  // ...
  public readonly ingest: IngestResource
  public readonly users: UsersResource
  
  constructor(apiKey: string, baseURL: string = TEER_API_BASE_URL) {
    this._apiKey = apiKey
    this._baseURL = baseURL
    this.ingest = new IngestResource(this)
    this.users = new UsersResource(this)
  }
  // ...
}
```

## Custom Base URLs

If your resource needs to use a different base URL than the default, you can specify it in the constructor:

```typescript
export class CustomResource extends Resource {
  constructor(client: TeerClient) {
    super(client, 'custom', 'https://custom-api.example.com')
  }
}
```
