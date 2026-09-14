import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { INCOME_SOURCES, IncomeFilters } from "../../models/income.model";

@Component({
  selector: "app-income-filters",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./income-filters.component.html",
  styleUrls: ["./income-filters.component.css"],
})
export class IncomeFiltersComponent {
  @Output() filtersChanged = new EventEmitter<IncomeFilters>();

  sources = INCOME_SOURCES;
  months = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
  ];

  selectedMonth: number | null = null;
  selectedSource = "";

  applyFilters(): void {
    this.filtersChanged.emit({
      month: this.selectedMonth ?? undefined,
      source: this.selectedSource || undefined,
    });
  }

  clearFilters(): void {
    this.selectedMonth = null;
    this.selectedSource = "";
    this.filtersChanged.emit({});
  }
}
