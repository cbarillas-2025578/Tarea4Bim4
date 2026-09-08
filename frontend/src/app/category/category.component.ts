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
  deleteWarning = "";

  usageByCategory: { [name: string]: { count: number; total: number } } = {};

  pinned: Set<string> = new Set();

  private readonly PINNED_KEY = "pinned_categories";

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private settingsService: SettingsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPinned();

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

    list.sort((a, b) => {
      const aPinned = this.pinned.has(a.name) ? 0 : 1;
      const bPinned = this.pinned.has(b.name) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;

      if (this.sortBy === "nameAsc") return a.name.localeCompare(b.name);
      if (this.sortBy === "nameDesc") return b.name.localeCompare(a.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }

  get maxUsageTotal(): number {
    return Object.values(this.usageByCategory).reduce((max, u) => Math.max(max, u.total), 0);
  }

  get topSpending(): { name: string; total: number; icon: string; color: string; percent: number }[] {
    const maxTotal = this.maxUsageTotal;
    return this.categories
      .filter((c) => c.type === "expense" && this.usageByCategory[c.name]?.total > 0)
      .map((c) => ({
        name: c.name,
        total: this.usageByCategory[c.name].total,
        icon: c.icon,
        color: c.color,
        percent: maxTotal > 0 ? Math.round((this.usageByCategory[c.name].total / maxTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  getUsagePercent(category: Category): number {
    const usage = this.getUsage(category);
    if (!usage || this.maxUsageTotal <= 0) return 0;
    return Math.round((usage.total / this.maxUsageTotal) * 100);
  }

  getUsage(category: Category): { count: number; total: number } | null {
    return this.usageByCategory[category.name] || null;
  }

  isPinned(category: Category): boolean {
    return this.pinned.has(category.name);
  }

  togglePin(category: Category): void {
    if (this.pinned.has(category.name)) {
      this.pinned.delete(category.name);
    } else {
      this.pinned.add(category.name);
    }
    try {
      localStorage.setItem(this.PINNED_KEY, JSON.stringify([...this.pinned]));
    } catch {
      /* ignorar error de almacenamiento */
    }
  }

  private loadPinned(): void {
    try {
      const raw = localStorage.getItem(this.PINNED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) this.pinned = new Set(arr.filter((n) => typeof n === "string"));
      }
    } catch {
      this.pinned = new Set();
    }
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
    this.deleteWarning = this.getUsage(category)?.count
      ? this.t("category.cantDeleteInUse")
      : "";
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