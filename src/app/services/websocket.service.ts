import { Injectable, signal } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { TokenService } from './token.service';
import { WebSocketMessage } from './sms.service';
import { WEBSOCKET_URL } from '../util/env';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private ws$: WebSocketSubject<any> | null = null;
  private connected = signal(false);

  constructor(private tokenService: TokenService) {}

  connect(): void {
    const token = this.tokenService.getToken();
    if (!token) return;

    this.ws$ = webSocket({
      url: WEBSOCKET_URL + token,
      openObserver: {
        next: () => {
          this.connected.set(true);
          
          const subscribeMessage = {
            command: 'subscribe',
            identifier: JSON.stringify({ channel: 'SmsStatusChannel' })
          };
        
          this.ws$?.next(subscribeMessage);
        }
      },
      closeObserver: {
        next: () => {
          this.connected.set(false);
        }
      }
    });

    this.ws$.subscribe({
      next: (data) => {
        
        if (data.type === 'confirm_subscription') {
        } else if (data.message) {
          this.handleMessage(data.message);
        }
      },
      error: (error) => {
        this.connected.set(false);
      }
    });
  }

  disconnect(): void {
    if (this.ws$) {
      console.log('🔌 Disconnecting WebSocket...');
      this.ws$.complete();
      this.ws$ = null;
    }
    this.connected.set(false);
  }

  isConnected() {
    return this.connected();
  }

  private handleMessage(data: WebSocketMessage): void {
    window.dispatchEvent(new CustomEvent('sms-websocket-message', {
      detail: data
    }));
  }
}