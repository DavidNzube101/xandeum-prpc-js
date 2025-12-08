# xandeum-prpc-js

A TypeScript/JavaScript client for interacting with Xandeum pNode pRPC APIs.

## Installation

```bash
npm install xandeum-prpc
# or
pnpm add xandeum-prpc
# or
yarn add xandeum-prpc
```

## Usage

```typescript
import { PrpcClient } from 'xandeum-prpc';

const client = new PrpcClient('173.212.220.65');

// Get list of pods
const podsResponse = await client.getPods();
console.log(`Found ${podsResponse.total_count} pods`);

// Get stats for a node
const stats = await client.getStats();
console.log(`CPU usage: ${stats.cpu_percent.toFixed(2)}%`);
```

## API

- `new PrpcClient(ip: string)` - Create client for a pNode IP
- `getPods(): Promise<PodsResponse>` - Get list of pods in gossip
- `getStats(): Promise<NodeStats>` - Get statistics for the node

## License

MIT