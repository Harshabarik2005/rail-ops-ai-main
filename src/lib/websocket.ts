class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers = new Map<string, Set<Function>>();
  private isConnecting = false;

  constructor(url: string) {
    this.url = url.replace('http', 'ws');
  }

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private handleMessage(data: any) {
    const { type, data: payload } = data;
    
    if (this.subscribers.has(type)) {
      this.subscribers.get(type)?.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in WebSocket subscriber callback:', error);
        }
      });
    }

    // Handle all messages
    if (this.subscribers.has('*')) {
      this.subscribers.get('*')?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket wildcard subscriber callback:', error);
        }
      });
    }
  }

  subscribe(channel: string, callback: Function) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)?.add(callback);

    // Send subscription message to server
    this.send({
      type: 'subscribe',
      channels: Array.from(this.subscribers.keys()).filter(ch => ch !== '*')
    });
  }

  unsubscribe(channel: string, callback: Function) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel)?.delete(callback);
      
      if (this.subscribers.get(channel)?.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.subscribers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Create singleton instance
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
export const wsManager = new WebSocketManager(WS_URL);

// Auto-connect when module is imported
wsManager.connect().catch(error => {
  console.error('Failed to establish WebSocket connection:', error);
});

export default wsManager;