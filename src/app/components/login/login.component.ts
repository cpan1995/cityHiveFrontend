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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
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

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login(this.username(), this.password()).subscribe({
      next: (response) => {
        console.log('Login successful:', response.message);
        this.router.navigate(['/messenger']);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.error.set(error.error?.error || 'Login failed');
        this.isLoading.set(false);
      }
    });
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  clearError() {
    this.error.set(null);
  }
}
