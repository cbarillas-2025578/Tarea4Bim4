import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EXPENSE_CATEGORIES, ExpenseFilters } from "../../models/expense.model";

@Component({
  selector: "app-expense-filters",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./expense-filters.component.html",
})
export class ExpenseFiltersComponent {
  @Output() filtersChanged = new EventEmitter<ExpenseFilters>();

  categories = EXPENSE_CATEGORIES;
  months = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
  ];

  selectedMonth: number | null = null;
  selectedCategory = "";

  applyFilters(): void {
    this.filtersChanged.emit({
      month: this.selectedMonth ?? undefined,
      category: this.selectedCategory || undefined,
    });
  }

  clearFilters(): void {
    this.selectedMonth = null;
    this.selectedCategory = "";
    this.filtersChanged.emit({});
  }
}
