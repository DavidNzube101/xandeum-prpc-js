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

### Basic Usage
```typescript
import { PrpcClient } from 'xandeum-prpc';

async function main() {
  const client = new PrpcClient('173.212.220.65'); // Replace with a pNode IP

  // Get pods with detailed statistics
  const podsWithStats = await client.getPodsWithStats();
  console.log(`Found ${podsWithStats.total_count} pods with stats:`);
  podsWithStats.pods.forEach(pod => {
    console.log(`  Pubkey: ${pod.pubkey}, Address: ${pod.address}, Uptime: ${pod.uptime}, Storage Used: ${pod.storage_used} bytes`);
  });
}

main();
```

### Finding a pNode
The client includes a helper function to concurrently search a list of seed nodes to find a specific pNode by its public key.

```typescript
import { PrpcClient } from 'xandeum-prpc';

async function find() {
  try {
    // Find a node using the default seed list
    const pod = await PrpcClient.findPNode("2asTHq4vVGazKrmEa3YTXKuYiNZBdv1cQoLc1Tr2kvaw");
    console.log("Found pod:", pod);

    // Find a node using a custom seed list and timeout
    const options = {
      replaceSeeds: ["192.190.136.28"],
      timeout: 5000 // 5 seconds
    };
    const podOnCustomSeed = await PrpcClient.findPNode("GCoCP7CLvVivuWUH1sSA9vMi9jjaJcXpMwVozMVA6yBg", options);
    console.log("Found pod on custom seed:", podOnCustomSeed);
  } catch (error) {
    console.error(error);
  }
}

find();
```

The default seed IPs are:
```
"173.212.220.65", "161.97.97.41", "192.190.136.36", "192.190.136.38", 
"207.244.255.1", "192.190.136.28", "192.190.136.29", "173.212.203.145"
```

## API

-   `new PrpcClient(ip: string, options?: { timeout?: number })` - Create a client for a pNode IP. The optional `timeout` is in milliseconds (default: 5000).
-   `PrpcClient.findPNode(nodeId: string, options?: { addSeeds?: string[], replaceSeeds?: string[], timeout?: number })` - Concurrently searches seed IPs to find a pNode by its public key.
-   `getPods(): Promise<PodsResponse>` - Get list of pods in gossip. (Note: Use `getPodsWithStats` for more data).
-   `getPodsWithStats(): Promise<PodsResponse>` - Get list of pods with detailed statistics.
-   `getStats(): Promise<NodeStats>` - Get statistics for a single node.

## License

MIT
