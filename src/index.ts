export interface Pod {
  address?: string;
  last_seen_timestamp: number;
  pubkey?: string;
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

  constructor(ip: string) {
    this.baseUrl = `http://${ip}:6000/rpc`;
  }

  private async call<T>(method: string): Promise<T> {
    const request: RpcRequest = {
      jsonrpc: '2.0',
      method,
      id: 1,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
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

      const rpcResponse: RpcResponse<T> = await response.json();

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

  async getPods(): Promise<PodsResponse> {
    return this.call<PodsResponse>('get-pods');
  }

  async getStats(): Promise<NodeStats> {
    return this.call<NodeStats>('get-stats');
  }
}