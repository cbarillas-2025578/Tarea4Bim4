// frontend/src/app/services/auth.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private inactivityTimer: any = null;
  private refreshTimer: any = null;
  private lastActivityWrite = 0;
  private readonly INACTIVITY_MS = 2 * 60 * 1000;     // 2 min sin actividad = cierre de sesión
  private readonly REFRESH_INTERVAL_MS = 5 * 60 * 1000; // renovar token cada 5 min de uso
  private activityListeners: { evt: string; handler: any }[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.bindActivityListeners();
    this.loadStoredUser();
  }

  ngOnDestroy(): void {
    this.clearExpirationTimer();
    this.clearRefreshTimer();
    this.unbindActivityListeners();
  }

  // ── Inactividad y renovación ──

  private bindActivityListeners(): void {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => this.onUserActivity();
    events.forEach(evt => {
      window.addEventListener(evt, handler, { passive: true });
      this.activityListeners.push({ evt, handler });
    });
  }

  private unbindActivityListeners(): void {
    this.activityListeners.forEach(({ evt, handler }) => {
      window.removeEventListener(evt, handler);
    });
    this.activityListeners = [];
  }

  private onUserActivity(): void {
    if (!this.currentUserSubject.value) return;
    try {
      const now = Date.now();
      const lastWrite = this.lastActivityWrite || 0;
      if (now - lastWrite > 1000) {
        localStorage.setItem('auth_last_activity', String(now));
        this.lastActivityWrite = now;
      }
    } catch {
      /* ignorar */
    }
    this.scheduleInactivity();
  }

  private scheduleInactivity(): void {
    this.clearExpirationTimer();
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityExpired();
    }, this.INACTIVITY_MS);
  }

  private handleInactivityExpired(): void {
    this.clearRefreshTimer();
    if (!this.getToken()) return;
    const alreadyRedirected = this.router.url.includes('sessionExpired');
    if (alreadyRedirected) return;
    this.logout(true);
  }

  private scheduleRefresh(): void {
    this.clearRefreshTimer();
    this.refreshTimer = setInterval(() => {
      this.refreshToken();
    }, this.REFRESH_INTERVAL_MS);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private refreshToken(): void {
    if (!this.currentUserSubject.value) return;
    const token = this.getToken();
    if (!token) return;
    this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { token }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
        this.scheduleInactivity();
      },
      error: () => {
        this.handleInactivityExpired();
      }
    });
  }

  // Programar expiración automática por inactividad
  private scheduleExpiration(): void {
    this.scheduleInactivity();
    this.scheduleRefresh();
  }

  private clearExpirationTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  // Login
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        })
      );
  }

  // Registro
  register(userData: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Logout
  logout(sessionExpired: boolean = false): void {
    this.clearExpirationTimer();
    this.clearRefreshTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_last_activity');
    this.currentUserSubject.next(null);
    if (sessionExpired) {
      this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Verificar si está autenticado
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp <= currentTime) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Actualizar perfil del usuario
  updateProfile(nombre: string, email: string): void {
    const current = this.currentUserSubject.value;
    if (!current) return;
    const updated = { ...current, nombre, email };
    const stored = localStorage.getItem('user');
    let parsed: any = null;
    if (stored) {
      try { parsed = JSON.parse(stored); } catch { parsed = null; }
    }
    localStorage.setItem('user', JSON.stringify({ ...(parsed || {}), nombre, email }));
    this.currentUserSubject.next(updated);
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Manejar respuesta de autenticación
  private handleAuthResponse(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    try {
      localStorage.setItem('auth_last_activity', String(Date.now()));
    } catch {
      /* ignorar */
    }
    this.currentUserSubject.next(response.user);
    this.scheduleExpiration();
  }

  // Cargar usuario almacenado
  private loadStoredUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr && this.isLoggedIn()) {
      // Si estuvo inactiva más del tiempo permitido, cerrar sesión
      try {
        const last = Number(localStorage.getItem('auth_last_activity'));
        if (last && (Date.now() - last > this.INACTIVITY_MS)) {
          this.logout(true);
          return;
        }
      } catch {
        /* si no hay marca de actividad, continuar */
      }
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.scheduleExpiration();
      } catch (error) {
        this.logout();
      }
    }
  }

  // Obtener headers para autenticación
  getAuthHeaders(): { Authorization: string } {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }
}