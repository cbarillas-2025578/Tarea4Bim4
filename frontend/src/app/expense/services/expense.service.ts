import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import {
  CreateExpenseDTO,
  Expense,
  ExpenseFilters,
  UpdateExpenseDTO,
} from "../models/expense.model";

@Injectable({
  providedIn: "root",
})
export class ExpenseService {
  private readonly baseUrl = `${environment.apiUrl}/expenses`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
  }

  getAll(filters: ExpenseFilters = {}): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters.month) params = params.set("month", filters.month);
    if (filters.year) params = params.set("year", filters.year);
    if (filters.category) params = params.set("category", filters.category);

    return this.http.get<Expense[]>(this.baseUrl, { params, headers: this.getHeaders() });
  }

  create(expense: CreateExpenseDTO): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, expense, { headers: this.getHeaders() });
  }

  update(id: number, expense: UpdateExpenseDTO): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, expense, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}
