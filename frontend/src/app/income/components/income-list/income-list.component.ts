import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IncomeService } from "../../services/income.service";
import { Income, IncomeFilters } from "../../models/income.model";
import { SettingsService } from "../../../services/settings.service";
import { IncomeFormComponent } from "../income-form/income-form.component";
import { IncomeFiltersComponent } from "../income-filters/income-filters.component";

@Component({
  selector: "app-income-list",
  standalone: true,
  imports: [CommonModule, IncomeFormComponent, IncomeFiltersComponent],
  templateUrl: "./income-list.component.html",
  styleUrls: ["./income-list.component.css"],
})
export class IncomeListComponent implements OnInit {
  incomes: Income[] = [];
  incomeToEdit: Income | null = null;
  currentFilters: IncomeFilters = {};
  loading = false;
  errorMessage = "";

  constructor(
    private incomeService: IncomeService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadIncomes();
  }

  loadIncomes(): void {
    this.loading = true;
    this.errorMessage = "";
    this.incomeService.getAll(this.currentFilters).subscribe({
      next: (data) => {
        this.incomes = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "No se pudieron cargar los ingresos. Verifica que el backend esté corriendo.";
        this.loading = false;
      },
    });
  }

  onFiltersChanged(filters: IncomeFilters): void {
    this.currentFilters = filters;
    this.loadIncomes();
  }

  onSaved(): void {
    this.incomeToEdit = null;
    this.loadIncomes();
  }

  editIncome(income: Income): void {
    this.incomeToEdit = { ...income };
  }

  cancelEdit(): void {
    this.incomeToEdit = null;
  }

  deleteIncome(income: Income): void {
    const confirmed = confirm(`¿Eliminar el ingreso de ${this.formatCurrency(income.amount)} en "${income.source}"?`);
    if (!confirmed) return;

    this.incomeService.delete(income.id).subscribe({
      next: () => this.loadIncomes(),
      error: () => (this.errorMessage = "No se pudo eliminar el ingreso."),
    });
  }

  get total(): number {
    return this.incomes.reduce((sum, i) => sum + i.amount, 0);
  }

  formatCurrency(amount: number): string {
    return this.settingsService.formatCurrency(amount);
  }

  t(key: string): string {
    return this.settingsService.t(key);
  }
}
