import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Roles } from '../enums/roles';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'role';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private tokenSubject$ = new BehaviorSubject<string | null>(this.getToken());
  public token$: Observable<string | null> = this.tokenSubject$.asObservable();

  constructor() {}

  // --------------------
  // TOKEN
  // --------------------
  saveToken(token: string): void {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSubject$.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // --------------------
  // REFRESH TOKEN
  // --------------------
  saveRefreshToken(refreshToken: string): void {
    if (!refreshToken) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // --------------------
  // USER
  // --------------------
  saveRole(role: string): void {
    localStorage.setItem(USER_KEY, role);
  }

  getRole(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  // --------------------
  // CLEAR
  // --------------------
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSubject$.next(null);
  }

  // --------------------
  // HELPERS
  // --------------------
  isTokenAvailable(): boolean {
    return !!this.getToken();
  }

  // Decode JWT token (no external lib)
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;

    const decoded = this.decodeToken(tokenToCheck);
    if (!decoded?.exp) return true;

    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decoded.exp);
    return expirationDate < new Date();
  }
}

