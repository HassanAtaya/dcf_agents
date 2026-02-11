import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';
import { TranslateService } from './translate.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageTokenKey = 'basicToken';
  private readonly storageUserKey = 'authUser';

  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private translate: TranslateService) {
    // Set language from stored user on init
    const user = this.loadUser();
    if (user?.language) {
      this.translate.setLanguage(user.language as any);
    }
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageUserKey);
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; }
    catch { return null; }
  }

  get token(): string | null { return localStorage.getItem(this.storageTokenKey); }
  get user(): AuthUser | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.token; }
  get isAdmin(): boolean { return (this.user?.roles || []).includes('ADMIN'); }

  hasPermission(permission: string): boolean {
    if (!permission) return false;
    if (this.isAdmin) return true;
    return (this.user?.permissions || []).map(p => p.toLowerCase()).includes(permission.toLowerCase());
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    const apiBase = environment.javaApiUrl;
    return this.http
      .post<LoginResponse>(`${apiBase}api/auth/login`, req, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })
      .pipe(
        tap(res => {
          localStorage.setItem(this.storageTokenKey, res.basicToken);
          const user: AuthUser = {
            id: res.id, username: res.username, firstname: res.firstname,
            lastname: res.lastname, language: res.language || 'en',
            roles: res.roles || [], permissions: res.permissions || []
          };
          localStorage.setItem(this.storageUserKey, JSON.stringify(user));
          this.userSubject.next(user);
          // Set language from user profile
          if (user.language) {
            this.translate.setLanguage(user.language as any);
          }
        })
      );
  }

  updateStoredUser(partial: Partial<AuthUser>): void {
    const current = this.user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem(this.storageUserKey, JSON.stringify(updated));
    this.userSubject.next(updated);
  }

  logout(): void {
    localStorage.removeItem(this.storageTokenKey);
    localStorage.removeItem(this.storageUserKey);
    this.userSubject.next(null);
  }
}
