import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExpenseService } from "../../services/expense.service";
import { Expense, ExpenseFilters } from "../../models/expense.model";
import { ExpenseFormComponent } from "../expense-form/expense-form.component";
import { ExpenseFiltersComponent } from "../expense-filters/expense-filters.component";

@Component({
  selector: "app-expense-history",
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent, ExpenseFiltersComponent],
  templateUrl: "./expense-history.component.html",
})
export class ExpenseHistoryComponent implements OnInit {
  expenses: Expense[] = [];
  expenseToEdit: Expense | null = null;
  currentFilters: ExpenseFilters = {};
  loading = false;
  errorMessage = "";

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getAll(this.currentFilters).subscribe({
      next: (data) => {
        this.expenses = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "No se pudieron cargar los gastos. Verifica que el backend esté corriendo.";
        this.loading = false;
      },
    });
  }

  onFiltersChanged(filters: ExpenseFilters): void {
    this.currentFilters = filters;
    this.loadExpenses();
  }

  onSaved(): void {
    this.expenseToEdit = null;
    this.loadExpenses();
  }

  editExpense(expense: Expense): void {
    this.expenseToEdit = { ...expense };
  }

  cancelEdit(): void {
    this.expenseToEdit = null;
  }

  deleteExpense(expense: Expense): void {
    const confirmed = confirm(`¿Eliminar el gasto de Q${expense.amount} en "${expense.category}"?`);
    if (!confirmed) return;

    this.expenseService.delete(expense.id).subscribe({
      next: () => this.loadExpenses(),
      error: () => (this.errorMessage = "No se pudo eliminar el gasto."),
    });
  }

  get total(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }
}
