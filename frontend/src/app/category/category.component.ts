import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../services/auth.service";
import { SettingsService } from "../services/settings.service";
import { CategoryService } from "./services/category.service";
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

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private settingsService: SettingsService
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
      },
      error: () => {
        this.errorMessage = "No se pudieron cargar las categorías.";
        this.loading = false;
      },
    });
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

  deleteCategory(category: Category): void {
    const confirmed = confirm(`¿Eliminar la categoría "${category.name}"?`);
    if (!confirmed) return;

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

  t(key: string): string {
    return this.settingsService.t(key);
  }
}