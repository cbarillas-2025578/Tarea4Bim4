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
  private expirationTimer: any = null;
  private readonly TOKEN_DURATION_MS = 20 * 60 * 1000; // 2 minutos

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  ngOnDestroy(): void {
    this.clearExpirationTimer();
  }

  // Programar expiración automática del token
  private scheduleExpiration(): void {
    this.clearExpirationTimer();
    this.expirationTimer = setTimeout(() => {
      this.handleTokenExpired();
    }, this.TOKEN_DURATION_MS);
  }

  private clearExpirationTimer(): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        this.handleTokenExpired();
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Manejar expiración del token
  private handleTokenExpired(): void {
    this.clearExpirationTimer();
    if (!this.getToken()) return;
    const alreadyRedirected = this.router.url.includes('sessionExpired');
    if (alreadyRedirected) return;
    this.logout(true);
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
    this.currentUserSubject.next(response.user);
    this.scheduleExpiration();
  }

  // Cargar usuario almacenado
  private loadStoredUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr && this.isLoggedIn()) {
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