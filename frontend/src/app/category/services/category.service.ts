import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../services/auth.service";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../models/category.model";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

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

  getAll(type?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (type) params = params.set("type", type);
    return this.http.get<Category[]>(this.baseUrl, { params, headers: this.getHeaders() });
  }

  create(category: CreateCategoryDTO): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category, { headers: this.getHeaders() });
  }

  update(id: number, category: UpdateCategoryDTO): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}