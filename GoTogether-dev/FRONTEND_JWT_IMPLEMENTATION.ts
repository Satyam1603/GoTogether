/**
 * Angular HTTP Interceptor for JWT Token Management
 * 
 * Add this interceptor to your providers in app.module.ts:
 * 
 * providers: [
 *   {
 *     provide: HTTP_INTERCEPTORS,
 *     useClass: JwtInterceptor,
 *     multi: true
 *   }
 * ]
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Add token to request if it exists
    if (this.authService.hasToken()) {
      request = this.addToken(request, this.authService.getAccessToken());
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.accessToken);
            return next.handle(
              this.addToken(request, response.accessToken)
            );
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => err);
          })
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token != null),
      take(1),
      switchMap((token) => {
        return next.handle(this.addToken(request, token));
      })
    );
  }
}

/**
 * AuthService - Manages authentication and tokens
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface AuthResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  message?: string;
  status?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/gotogether/users';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('user') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Register a new user
   */
  registerUser(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          if (response && response.accessToken) {
            this.storeTokens(
              response.accessToken,
              response.refreshToken,
              response.user
            );
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  /**
   * Login user
   */
  loginUser(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response && response.accessToken) {
            this.storeTokens(
              response.accessToken,
              response.refreshToken,
              null
            );
          }
        })
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh-token`, {
        refreshToken: refreshToken,
      })
      .pipe(
        tap((response) => {
          if (response && response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe(() => {
      this.clearTokens();
      this.currentUserSubject.next(null);
    });
  }

  /**
   * Revoke refresh token
   */
  revokeToken(userId: number, refreshToken: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${userId}/revoke-token`,
      { refreshToken }
    );
  }

  /**
   * Store tokens and user data in localStorage
   */
  private storeTokens(
    accessToken: string,
    refreshToken: string,
    user: any
  ): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Clear stored tokens and user data
   */
  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Get access token
   */
  getAccessToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string {
    return localStorage.getItem('refreshToken') || '';
  }

  /**
   * Check if user has token
   */
  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    // Check if token is expired
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      return false;
    }
    return decodedToken.exp * 1000 > Date.now();
  }

  /**
   * Decode JWT token (client-side decoding only)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user as observable
   */
  getCurrentUserObservable(): Observable<any> {
    return this.currentUser;
  }
}
