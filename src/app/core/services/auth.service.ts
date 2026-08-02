import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../api.config';
import {
  LoginCredentials,
  RegisterCredentials,
  UpdateUser,
  User,
  UserResponse,
} from '../models/user.model';

const STORAGE_KEY = 'conduit-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly username = computed(() => this.currentUserSignal()?.username ?? null);

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private setUser(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  login(credentials: LoginCredentials): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${this.apiUrl}/users/login`, { user: credentials })
      .pipe(tap(({ user }) => this.setUser(user)));
  }

  register(credentials: RegisterCredentials): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${this.apiUrl}/users`, { user: credentials })
      .pipe(tap(({ user }) => this.setUser(user)));
  }

  updateUser(user: UpdateUser): Observable<UserResponse> {
    return this.http
      .put<UserResponse>(`${this.apiUrl}/user`, { user })
      .pipe(tap(({ user }) => this.setUser(user)));
  }

  fetchCurrentUser(): Observable<UserResponse> {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/user`)
      .pipe(tap(({ user }) => this.setUser(user)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token ?? null;
  }
}
