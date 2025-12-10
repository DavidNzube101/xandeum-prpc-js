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

const client = new PrpcClient('173.212.220.65'); // Replace with a pNode IP

// Get pods with detailed statistics
const podsWithStats = await client.getPodsWithStats();
console.log(`Found ${podsWithStats.total_count} pods with stats:`);
podsWithStats.pods.forEach(pod => {
  console.log(`  Pubkey: ${pod.pubkey}, Address: ${pod.address}, Uptime: ${pod.uptime}, Storage Used: ${pod.storage_used} bytes`);
});
```

## API

-   `new PrpcClient(ip: string)` - Create client for a pNode IP.
-   `getPods(): Promise<PodsResponse>` - Get list of pods in gossip. (Note: Use `getPodsWithStats` for more data).
-   `getPodsWithStats(): Promise<PodsResponse>` - Get list of pods with detailed statistics, introduced in *0.1.4*
-   `getStats(): Promise<NodeStats>` - Get statistics for a single node.

## License

MIT
