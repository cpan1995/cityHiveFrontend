import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { BASEURL_CONST } from '../util/env';

export interface Message {
  id: string;
  phoneNumber: string;
  text: string;
  timestamp: Date;
  characterCount: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  statusIcon: string;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  errorCode?: string;
  twilioSid: string;
}

export interface NewMessageRequest {
  phoneNumber: string;
  text: string;
}

export interface ApiResponse {
  messages: any[];
  count: number;
  hasMessages: boolean;
}

export interface WebSocketMessage {
  type: 'new_message' | 'status_update';
  sms: any;
}

export interface SendMessageRequest {
  sms: {
    phone_number: string;
    text: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private readonly baseUrl = BASEURL_CONST+ '/v1/sms';

  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _messages = signal<Message[]>([]);

  public readonly messages = this._messages.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly messageCount = computed(() => this._messages().length);
  public readonly hasMessages = computed(() => this._messages().length > 0);

  public readonly pendingCount = computed(() => 
    this._messages().filter(m => m.status === 'pending').length
  );
  
  public readonly deliveredCount = computed(() => 
    this._messages().filter(m => m.status === 'delivered').length
  );
  
  public readonly failedCount = computed(() => 
    this._messages().filter(m => m.status === 'failed').length
  );

  public readonly MAX_CHARACTERS = 250;

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners(): void {
    window.addEventListener('sms-websocket-message', (event: any) => {
      const data = event.detail;
      
      switch (data.type) {
        case 'new_message':
          this.addMessage(data.sms);
          break;
        case 'status_update':
          this.updateMessageStatus(data.sms);
          break;
      }
    });
  }

  connectWebSocket(): void {
    this.webSocketService.connect();
  }

  disconnectWebSocket(): void {
    this.webSocketService.disconnect();
  }

  private addMessage(messageData: any): void {
    const newMessage: Message = {
      id: messageData.id,
      phoneNumber: messageData.phoneNumber || messageData.phone_number,
      text: messageData.text,
      timestamp: new Date(messageData.timestamp || messageData.created_at),
      characterCount: messageData.characterCount || messageData.character_count || messageData.text.length,
      status: messageData.status || 'pending',
      statusIcon: this.getStatusIcon(messageData.status || 'pending'),
      deliveredAt: messageData.deliveredAt || messageData.delivered_at ? new Date(messageData.deliveredAt || messageData.delivered_at) : undefined,
      failedAt: messageData.failedAt || messageData.failed_at ? new Date(messageData.failedAt || messageData.failed_at) : undefined,
      errorMessage: messageData.errorMessage || messageData.error_message,
      errorCode: messageData.errorCode || messageData.error_code,
      twilioSid: messageData.twilioSid || messageData.twilio_sid
    };

    this._messages.update(messages => [newMessage, ...messages]);
  }

  private updateMessageStatus(messageData: any): void {
    this._messages.update(messages => 
      messages.map(msg => {
        if (msg.id === messageData.id) {
          return {
            ...msg,
            status: messageData.status,
            statusIcon: this.getStatusIcon(messageData.status),
            deliveredAt: messageData.delivered_at ? new Date(messageData.delivered_at) : msg.deliveredAt,
            failedAt: messageData.failed_at ? new Date(messageData.failed_at) : msg.failedAt,
            errorMessage: messageData.error_message || msg.errorMessage,
            errorCode: messageData.error_code || msg.errorCode
          };
        }
        return msg;
      })
    );
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'sent':
        return 'done';
      case 'delivered':
        return 'done_all';
      case 'failed':
        return 'error';
      default:
        return 'help_outline';
    }
  }


  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-warning';
      case 'sent':
        return 'text-info';
      case 'delivered':
        return 'text-success';
      case 'failed':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  getMessages(): Observable<ApiResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<ApiResponse>(this.baseUrl).pipe(
      tap((response: ApiResponse) => {
        const transformedMessages = response.messages.map(msg => ({
          id: msg.id,
          phoneNumber: msg.phoneNumber || msg.phone_number,
          text: msg.text,
          timestamp: new Date(msg.timestamp || msg.created_at),
          characterCount: msg.characterCount || msg.character_count || msg.text.length,
          status: msg.status || 'pending',
          statusIcon: this.getStatusIcon(msg.status || 'pending'),
          deliveredAt: msg.deliveredAt || msg.delivered_at ? new Date(msg.deliveredAt || msg.delivered_at) : undefined,
          failedAt: msg.failedAt || msg.failed_at ? new Date(msg.failedAt || msg.failed_at) : undefined,
          errorMessage: msg.errorMessage || msg.error_message,
          errorCode: msg.errorCode || msg.error_code,
          twilioSid: msg.twilioSid || msg.twilio_sid
        }));

        this._messages.set(transformedMessages);
        this._isLoading.set(false);
      }),
      catchError((error) => {
        console.error('Failed to load messages:', error);
        this._error.set('Failed to load messages');
        this._isLoading.set(false);
        return of({ messages: [], count: 0, hasMessages: false });
      })
    );
  }

  sendMessage(phoneNumber: string, text: string): Observable<any> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post(this.baseUrl, {
      sms: {
        phone_number: phoneNumber,
        text: text
      }
    }).pipe(
      tap((response) => {
        console.log('Send SMS Response:', response);
        this._isLoading.set(false);
        // WebSocket will handle adding the message and status updates
      }),
      catchError((error) => {
        console.error('Send SMS Error:', error);
        this._error.set('Failed to send message');
        this._isLoading.set(false);
        throw error;
      })
    );
  }

  getMessagesByStatus(status: string): Message[] {
    return this._messages().filter(m => m.status === status);
  }
  retryFailedMessage(messageId: string): void {
    // Dead code for now do not want to deploy application.
  }

  clearError(): void {
    this._error.set(null);
  }
}