// frontend/src/app/services/expense.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: Date | string;
  type: 'income' | 'expense';
  user_id?: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  categoryTotals: {
    [key: string]: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:3000/api/expenses';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtener todos los gastos
  getExpenses(): Observable<Expense[]> {
    const headers = this.getHeaders();
    return this.http.get<Expense[]>(this.apiUrl, { headers });
  }

  // Obtener gastos por mes
  getExpensesByMonth(year: number, month: number): Observable<Expense[]> {
    const headers = this.getHeaders();
    return this.http.get<Expense[]>(`${this.apiUrl}/month/${year}/${month}`, { headers });
  }

  // Obtener resumen
  getSummary(): Observable<ExpenseSummary> {
    const headers = this.getHeaders();
    return this.http.get<ExpenseSummary>(`${this.apiUrl}/summary`, { headers });
  }

  // Crear gasto
  createExpense(expense: Expense): Observable<Expense> {
    const headers = this.getHeaders();
    return this.http.post<Expense>(this.apiUrl, expense, { headers });
  }

  // Actualizar gasto
  updateExpense(id: number, expense: Partial<Expense>): Observable<Expense> {
    const headers = this.getHeaders();
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense, { headers });
  }

  // Eliminar gasto
  deleteExpense(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Obtener gastos por categoría
  getExpensesByCategory(category: string): Observable<Expense[]> {
    const headers = this.getHeaders();
    return this.http.get<Expense[]>(`${this.apiUrl}/category/${category}`, { headers });
  }

  // Obtener gastos recientes (últimos N)
  getRecentExpenses(limit: number = 10): Observable<Expense[]> {
    const headers = this.getHeaders();
    return this.http.get<Expense[]>(`${this.apiUrl}/recent/${limit}`, { headers });
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