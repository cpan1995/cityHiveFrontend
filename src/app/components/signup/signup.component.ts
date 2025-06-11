import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  username = signal('');
  password = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.username().trim() || !this.password().trim()) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.signup(this.username(), this.password()).subscribe({
      next: (response) => {
        console.log('Signup successful:', response.message);
        this.router.navigate(['/messenger']);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Signup failed:', error);
        this.error.set(error.error?.errors?.[0] || 'Failed to create account');
        this.isLoading.set(false);
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  clearError() {
    this.error.set(null);
  }
}