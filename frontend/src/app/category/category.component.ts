import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../services/auth.service";
import { SettingsService } from "../services/settings.service";
import { CategoryService } from "./services/category.service";
import { environment } from "../../environments/environment";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "./models/category.model";

@Component({
  selector: "app-category",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.css"],
})
export class CategoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userName = "Usuario";
  userInitials = "US";

  categories: Category[] = [];
  loading = false;
  errorMessage = "";

  showForm = false;
  editingCategory: Category | null = null;

  newName = "";
  newType = "expense";
  newColor = CATEGORY_COLORS[0];
  newIcon = CATEGORY_ICONS[0];

  iconOptions = CATEGORY_ICONS;
  colorOptions = CATEGORY_COLORS;

  expenseCount = 0;
  incomeCount = 0;

  searchQuery = "";
  typeFilter = "all";
  sortBy = "recent";

  pendingDeleteCategory: Category | null = null;

  usageByCategory: { [name: string]: { count: number; total: number } } = {};

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private settingsService: SettingsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombre || "Usuario";
      this.userInitials = this.userName.substring(0, 2).toUpperCase();
    }

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.userName = user.nombre || "Usuario";
          this.userInitials = this.userName.substring(0, 2).toUpperCase();
        }
      });

    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = "";

    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.categories = data;
        this.expenseCount = data.filter((c) => c.type === "expense").length;
        this.incomeCount = data.filter((c) => c.type === "income").length;
        this.loading = false;
        this.loadUsage();
      },
      error: () => {
        this.errorMessage = "No se pudieron cargar las categorías.";
        this.loading = false;
      },
    });
  }

  private loadUsage(): void {
    this.http.get<any[]>(`${environment.apiUrl}/expenses`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (expenses) => {
        const map: { [name: string]: { count: number; total: number } } = {};
        expenses.forEach((e) => {
          const name = e.category || "Otros";
          if (!map[name]) map[name] = { count: 0, total: 0 };
          map[name].count += 1;
          map[name].total += Number(e.amount) || 0;
        });
        this.usageByCategory = map;
      },
      error: () => {
        this.usageByCategory = {};
      },
    });
  }

  get visibleCategories(): Category[] {
    const q = this.searchQuery.trim().toLowerCase();

    let list = this.categories.filter((c) => {
      const okType = this.typeFilter === "all" || c.type === this.typeFilter;
      const okName = !q || c.name.toLowerCase().includes(q);
      return okType && okName;
    });

    if (this.sortBy === "nameAsc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === "nameDesc") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  getUsage(category: Category): { count: number; total: number } | null {
    return this.usageByCategory[category.name] || null;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingCategory = null;
      this.resetForm();
    }
  }

  startCreate(): void {
    this.editingCategory = null;
    this.resetForm();
    this.showForm = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = { ...category };
    this.newName = category.name;
    this.newType = category.type;
    this.newColor = category.color || CATEGORY_COLORS[0];
    this.newIcon = category.icon || CATEGORY_ICONS[0];
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.newName = "";
    this.newType = "expense";
    this.newColor = CATEGORY_COLORS[0];
    this.newIcon = CATEGORY_ICONS[0];
  }

  selectColor(color: string): void {
    this.newColor = color;
  }

  selectIcon(icon: string): void {
    this.newIcon = icon;
  }

  save(): void {
    this.errorMessage = "";

    const name = this.newName.trim();
    if (!name) {
      this.errorMessage = "Ingresa el nombre de la categoría.";
      return;
    }

    const payload = {
      name,
      type: this.newType,
      color: this.newColor,
      icon: this.newIcon,
    };

    const request$ = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id, payload)
      : this.categoryService.create(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showForm = false;
        this.editingCategory = null;
        this.resetForm();
        this.loadCategories();
      },
      error: () => {
        this.errorMessage = "No se pudo guardar la categoría. Verifica que el nombre no exista.";
      },
    });
  }

  duplicateCategory(category: Category): void {
    this.editingCategory = null;
    this.newName = category.name + " (copia)";
    this.newType = category.type;
    this.newColor = category.color || CATEGORY_COLORS[0];
    this.newIcon = category.icon || CATEGORY_ICONS[0];
    this.showForm = true;
  }

  askDelete(category: Category): void {
    this.pendingDeleteCategory = category;
    this.showForm = false;
  }

  cancelDelete(): void {
    this.pendingDeleteCategory = null;
  }

  performDelete(): void {
    const category = this.pendingDeleteCategory;
    if (!category) return;
    this.pendingDeleteCategory = null;
    this.errorMessage = "";

    this.categoryService.delete(category.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadCategories(),
      error: () => {
        this.errorMessage = "No se pudo eliminar la categoría.";
      },
    });
  }

  categoryStyle(category: Category): { [key: string]: string } {
    return {
      background: `${category.color}1A`,
      border: `1px solid ${category.color}40`,
    };
  }

  badgeColor(category: Category): string {
    return category.color;
  }

  typeLabel(type: string): string {
    return type === "expense"
      ? this.t("category.typeExpense")
      : this.t("category.typeIncome");
  }

  formatCurrency(amount: number): string {
    return this.settingsService.formatCurrency(amount);
  }

  t(key: string): string {
    return this.settingsService.t(key);
  }
}