import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ExpenseService } from "../../services/expense.service";
import { EXPENSE_CATEGORIES, Expense } from "../../models/expense.model";
import { SettingsService } from "../../../services/settings.service";

@Component({
  selector: "app-expense-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./expense-form.component.html",
  styleUrls: ["./expense-form.component.css"],
})
export class ExpenseFormComponent implements OnChanges {
  @Input() expenseToEdit: Expense | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  categories = EXPENSE_CATEGORIES;
  currencySymbol = "Q";

  amount: number | null = null;
  category = "";
  transactionDate = "";
  errorMessage = "";

  constructor(
    private expenseService: ExpenseService,
    private settingsService: SettingsService
  ) {
    this.currencySymbol = this.settingsService.currency;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["expenseToEdit"] && this.expenseToEdit) {
      this.amount = this.expenseToEdit.amount;
      this.category = this.expenseToEdit.category;
      const raw = this.expenseToEdit.transactionDate;
      this.transactionDate = raw ? String(raw).slice(0, 16) : "";
    }
  }

  submit(): void {
    this.errorMessage = "";

    if (!this.amount || this.amount <= 0 || !this.category || !this.transactionDate) {
      this.errorMessage = "Completa monto, categoría y fecha antes de guardar.";
      return;
    }

    const payload = {
      amount: this.amount,
      category: this.category,
      transactionDate: new Date(this.transactionDate).toISOString(),
    };

    const request$ = this.expenseToEdit
      ? this.expenseService.update(this.expenseToEdit.id, payload)
      : this.expenseService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.saved.emit();
      },
      error: () => {
        this.errorMessage = "Ocurrió un error al guardar el gasto. Intenta de nuevo.";
      },
    });
  }

  cancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.amount = null;
    this.category = "";
    this.transactionDate = "";
  }
}
