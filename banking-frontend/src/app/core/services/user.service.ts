import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { User } from '../models/user.model';
import { UserStats } from '../models/user-stats.model';
import { Roles } from '../enums/roles';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

// @desc Service to manage user data and statistics
export class UserService {

  private apiUrl = `${environment.apiUrl}`;

  private currentUserSubject$ = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject$.asObservable();

  constructor(private http: HttpClient) {}

  // Current logged-in user
  getCurrentUserDetails(): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/users/me`)
      .pipe(tap(user => this.currentUserSubject$.next(user)));
  }

  // Admin: get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  // User statistics
  calculateUserStats(users: User[]): UserStats {
    return {
      total: users.length,
      admin: users.filter(u => u.role === Roles.ADMIN).length,
      rm: users.filter(u => u.role === Roles.RELATIONSHIP_MANAGER).length,
      analyst: users.filter(u => u.role === Roles.ANALYST).length
    };
  }

  // Activate / Deactivate user
  updateUserStatus(userId: string, active: boolean): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/admin/users/${userId}/status`,
      null,
      {
        params: { active: active.toString() },
        responseType: 'text'
      }
    );
  }

  // Create user
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/admin/users`,
      userData
    );
  }

  clearCurrentUser(): void {
    this.currentUserSubject$.next(null);
  }
}