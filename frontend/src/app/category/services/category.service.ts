import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
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

  constructor(private http: HttpClient) {}

  getAll(type?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (type) params = params.set("type", type);
    return this.http.get<Category[]>(this.baseUrl, { params });
  }

  create(category: CreateCategoryDTO): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  update(id: number, category: UpdateCategoryDTO): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}