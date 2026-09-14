import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import {
  CreateIncomeDTO,
  Income,
  IncomeFilters,
  UpdateIncomeDTO,
} from "../models/income.model";

@Injectable({
  providedIn: "root",
})
export class IncomeService {
  private readonly baseUrl = `${environment.apiUrl}/incomes`;

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

  getAll(filters: IncomeFilters = {}): Observable<Income[]> {
    let params = new HttpParams();
    if (filters.month) params = params.set("month", filters.month);
    if (filters.year) params = params.set("year", filters.year);
    if (filters.source) params = params.set("source", filters.source);

    return this.http.get<Income[]>(this.baseUrl, { params, headers: this.getHeaders() });
  }

  create(income: CreateIncomeDTO): Observable<Income> {
    return this.http.post<Income>(this.baseUrl, income, { headers: this.getHeaders() });
  }

  update(id: number, income: UpdateIncomeDTO): Observable<Income> {
    return this.http.put<Income>(`${this.baseUrl}/${id}`, income, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}
