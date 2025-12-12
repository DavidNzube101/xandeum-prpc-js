import fetch from 'node-fetch';

export interface Pod {
  address?: string;
  is_public?: boolean;
  last_seen_timestamp: number;
  pubkey?: string;
  rpc_port?: number;
  storage_committed?: number;
  storage_usage_percent?: number;
  storage_used?: number;
  uptime?: number;
  version?: string;
}

export interface PodsResponse {
  pods: Pod[];
  total_count: number;
}

export interface NodeStats {
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number;
  last_updated: number;
  packets_received: number;
  packets_sent: number;
  ram_total: number;
  ram_used: number;
  total_bytes: number;
  total_pages: number;
  uptime: number;
}

interface RpcRequest {
  jsonrpc: string;
  method: string;
  id: number;
}

interface RpcResponse<T> {
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

export class PrpcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrpcError';
  }
}

export class PrpcClient {
  private baseUrl: string;
  private timeout: number;

  static defaultSeedIps: string[] = [
    "173.212.220.65",
    "161.97.97.41",
    "192.190.136.36",
    "192.190.136.38",
    "207.244.255.1",
    "192.190.136.28",
    "192.190.136.29",
    "173.212.203.145",
  ];

  constructor(ip: string, options?: { timeout?: number }) {
    this.baseUrl = `http://${ip}:6000/rpc`;
    this.timeout = options?.timeout || 5000;
  }

  private async call<T>(method: string): Promise<T> {
    const request: RpcRequest = {
      jsonrpc: '2.0',
      method,
      id: 1,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new PrpcError(`HTTP error: ${response.status}`);
      }

      const rpcResponse = await response.json() as RpcResponse<T>;

      if (rpcResponse.error) {
        throw new PrpcError(rpcResponse.error.message);
      }

      if (!rpcResponse.result) {
        throw new PrpcError('No result in response');
      }

      return rpcResponse.result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new PrpcError('Request timed out');
      }
      throw error;
    }
  }

  static async findPNode(
    nodeId: string,
    options?: {
      addSeeds?: string[];
      replaceSeeds?: string[];
      timeout?: number;
    }
  ): Promise<Pod> {
    let seeds = PrpcClient.defaultSeedIps;
    if (options?.replaceSeeds) {
      seeds = options.replaceSeeds;
    } else if (options?.addSeeds) {
      seeds = [...seeds, ...options.addSeeds];
    }

    const findPromises = seeds.map(seedIp => {
      return new Promise<Pod>(async (resolve, reject) => {
        try {
          const client = new PrpcClient(seedIp, { timeout: options?.timeout });
          const podsResponse = await client.getPods();
          const found = podsResponse.pods.find(p => p.pubkey === nodeId);
          if (found) {
            resolve(found);
          } else {
            reject(new Error(`Node not found on seed ${seedIp}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    try {
      const result = await Promise.any(findPromises);
      return result;
    } catch (error) {
      throw new PrpcError(`Could not find pNode ${nodeId} on any of the provided seeds.`);
    }
  }


  async getPods(): Promise<PodsResponse> {
    return this.call<PodsResponse>('get-pods');
  }

  async getPodsWithStats(): Promise<PodsResponse> {
    return this.call<PodsResponse>('get-pods-with-stats');
  }

  async getStats(): Promise<NodeStats> {
    return this.call<NodeStats>('get-stats');
  }
}