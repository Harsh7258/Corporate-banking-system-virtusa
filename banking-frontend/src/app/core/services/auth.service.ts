import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { TokenService } from './token.service';
import { Roles } from '../enums/roles';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { environment } from '../../../environments/environment';

export interface AuthState {
  isAuthenticated: boolean;
  user: { role: Roles } | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  private authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  public state$ = this.authState$.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.initializeAuthState();
  }

  // Initialize auth on app load
  private initializeAuthState(): void {
    const token = this.tokenService.getToken();
    const user = this.tokenService.getRole();

    if (token && user &&!this.tokenService.isTokenExpired(token)) {

      this.updateAuthState({
        isAuthenticated: true,
        user: { role: user as Roles },
        loading: false,
        error: null
      });
    }
  }

  private updateAuthState(state: Partial<AuthState>): void {
    this.authState$.next({
      ...this.authState$.value,
      ...state
    });
  }

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.updateAuthState({ loading: true, error: null });

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          // Save token
          this.tokenService.saveToken(response.token);

          // Backend only sends role → create minimal user
          const user: { role: Roles } = {
            role: response.role as Roles
          };

          this.tokenService.saveRole(response.role);

          this.updateAuthState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          });

          this.toastr.success('Login successful', 'Welcome');

          this.navigateByRole(response.role);
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Login failed. Please try again.';

          this.updateAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: errorMessage
          });

          this.toastr.error(errorMessage, 'Login Failed');
          return throwError(() => error);
        })
      );
  }

  // Logout
  logout(): void {
    this.tokenService.clearTokens();

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });

    this.toastr.info('You have been logged out', 'Logged Out');
    this.router.navigate(['/auth/login']);
  }

  // ROLE-BASED NAVIGATION
  private navigateByRole(role: Roles): void {
    switch (role) {
      case Roles.RELATIONSHIP_MANAGER:
        this.router.navigate(['/rm/dashboard']);
        break;

      case Roles.ANALYST:
        this.router.navigate(['/analyst/dashboard']);
        break;

      case Roles.ADMIN:
        this.router.navigate(['/admin']);
        break;

      default:
        this.router.navigate(['/dashboard']);
    }
  }

  // HELPERS
  isAuthenticated(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  getCurrentUser(): { role: Roles } | null {
    return this.authState$.value.user;
  }

  getUserRole(): Roles | null {
    return this.authState$.value.user?.role ?? null;
  }

  hasRole(role: Roles): boolean {
    return this.getUserRole() === role;
  }
}
