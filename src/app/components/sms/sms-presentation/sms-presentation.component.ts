import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Message, SmsService } from '../../../services/sms.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Add this
import { AuthService } from '../../../services/auth.service';


export interface NewMessageRequest {
  phoneNumber: string;
  text: string;
}

enum Reflection {
  Queued,
  Sending,
  Sent,
  Delivered,
  Undelivered,
  Failed
}

@Component({
  selector: 'app-sms-presentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './sms-presentation.component.html',
  styleUrl: './sms-presentation.component.scss'
})
export class SmsPresentationComponent implements OnInit, OnDestroy {

  phoneNumber = signal('');
  messageText = signal('');
  
  constructor(public smsService: SmsService, private authService: AuthService) {
  }
  ngOnDestroy(): void {
    this.smsService.disconnectWebSocket();
  }
  
  ngOnInit() {
    // Connect WebSocket for real-time updates
    this.smsService.connectWebSocket();
    
    this.loadMessages();
  }

  loadMessages(): void {
    this.smsService.getMessages().subscribe({
      next: (response) => {
        console.log('Messages loaded with status:', response);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }
  
  get characterCount(): number {
    return this.messageText().length;
  }
  
  get maxCharacters(): number {
    return this.smsService.MAX_CHARACTERS;
  }
  
  get isFormValid(): boolean {
    return !!(this.phoneNumber! && this.messageText().trim());
  }

  onKeyPress(event: KeyboardEvent) {
    const allowedChars = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    
    if (!allowedChars.test(inputChar)) {
      event.preventDefault();
    }
  }

  retryMessage(message: Message): void {
    // dead code
  }

  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
      value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0,3)}) ${value.slice(3)}`;
    }
    
    this.phoneNumber.set(value);
  }

  onSubmit() {
    if (!this.isFormValid) {
      console.log('Form is not valid');
      return;
    }

    const request: NewMessageRequest = {
      phoneNumber: this.phoneNumber(),
      text: this.messageText()
    };

    this.smsService.sendMessage(request.phoneNumber, request.text).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        this.clearForm();
      },
      error: (error) => {
        console.error('Failed to send message:', error);

      }
    });
  }

  clearForm() {
    this.phoneNumber.set('');
    this.messageText.set('');
    this.smsService.clearError();
  }
  
  formatTimestamp(timestamp: Date | string): string {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }


}
