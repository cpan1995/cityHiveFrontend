import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { WebSocketService } from './websocket.service';
import { SmsService } from './sms.service';
import { BASEURL_CONST } from '../util/env';

interface LoginRequest {
  auth: {
    username: string;
    password: string;
  };
}

interface SignupRequest {
  user: {
    username: string;
    password: string;
  };
}

interface AuthResponse {
  message: string;
  user: IUser;
  token: string;
}

export interface IUser {
    created_at?: Date;
    updated_at?: Date;
    username: string;
    _id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = BASEURL_CONST + '/v1/auth';
  
  currentUser = signal<IUser>({
      created_at: undefined,
      updated_at: undefined,
      username: '',
      _id: ''
  });
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private webSocketService: WebSocketService,
    private smsService: SmsService
  ) {
    this.initializeAuthState();
  }

  // Initialize authentication state on app startup
  private initializeAuthState(): void {
    const user = this.tokenService.getUser();
    const isLoggedIn = this.tokenService.isLoggedIn();
    
    if (user && isLoggedIn) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    const loginData: LoginRequest = {
      auth: { username, password }
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, loginData)
      .pipe(
        tap(response => {
          this.tokenService.setToken(response.token);
          this.tokenService.setUser(response.user);
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
          
          this.smsService.connectWebSocket();
        })
      );
  }

  signup(username: string, password: string): Observable<AuthResponse> {
    const signupData: SignupRequest = {
      user: { username, password }
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, signupData)
      .pipe(
        tap(response => {

          this.tokenService.setToken(response.token);
          this.tokenService.setUser(response.user);
          
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuthState();
        })
      );
  }

  logoutLocal(): void {

    this.smsService.disconnectWebSocket();
    this.clearAuthState();
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  private clearAuthState(): void {
    this.tokenService.removeToken();
    this.currentUser.set({
        username: '',
        _id: ''
    });
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }
}