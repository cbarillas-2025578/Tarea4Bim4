// frontend/src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyTrends: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
  categoryDistribution: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboard';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtener datos del dashboard
  getDashboardData(): Observable<DashboardData> {
    const headers = this.getHeaders();
    return this.http.get<DashboardData>(this.apiUrl, { headers });
  }

  // Obtener datos específicos del mes
  getMonthlyData(year: number, month: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/month/${year}/${month}`, { headers });
  }

  // Obtener tendencias anuales
  getYearlyTrends(year: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/year/${year}`, { headers });
  }

  // Obtener gastos por categoría para gráficos
  getCategoryData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/categories`, { headers });
  }

  // Headers con autenticación
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}