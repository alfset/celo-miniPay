import { SDKEvent, SDKEventCallback } from '../types';

export class EventBus {
  private subscribers: Set<SDKEventCallback> = new Set();

  subscribe(callback: SDKEventCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  emit(event: SDKEvent): void {
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }
}