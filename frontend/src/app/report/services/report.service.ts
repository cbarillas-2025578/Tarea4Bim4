import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  transactionCount: number;
}

export interface MonthlyReportRow {
  month: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryReportRow {
  name: string;
  amount: number;
  percent: number;
  count: number;
}

export interface SourceReportRow {
  name: string;
  amount: number;
  percent: number;
  count: number;
}

export interface ReportData {
  year: number;
  month?: number;
  summary: ReportSummary;
  monthly: MonthlyReportRow[];
  expenseByCategory: CategoryReportRow[];
  incomeBySource: SourceReportRow[];
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getReport(year: number, month?: number): Observable<ReportData> {
    const url = month
      ? `${this.baseUrl}/${year}/${month}`
      : `${this.baseUrl}/${year}`;
    return this.http.get<ReportData>(url);
  }
}