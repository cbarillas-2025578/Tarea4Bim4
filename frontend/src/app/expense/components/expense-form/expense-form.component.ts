import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";
import { ExpenseService } from "../../services/expense.service";
import { EXPENSE_CATEGORIES, Expense } from "../../models/expense.model";
import { IncomeService } from "../../../income/services/income.service";
import { SettingsService } from "../../../services/settings.service";

@Component({
  selector: "app-expense-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./expense-form.component.html",
  styleUrls: ["./expense-form.component.css"],
})
export class ExpenseFormComponent implements OnInit, OnChanges {
  @Input() expenseToEdit: Expense | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  categories = EXPENSE_CATEGORIES;
  currencySymbol = "Q";

  amount: number | null = null;
  category = "";
  transactionDate = "";
  errorMessage = "";
  maxDate = "";

  private totalIncome = 0;
  private totalExpenses = 0;
  balanceChecked = false;

  constructor(
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private settingsService: SettingsService
  ) {
    this.currencySymbol = this.settingsService.currency;
    this.maxDate = this.getEndOfTodayLocal();
  }

  ngOnInit(): void {
    this.loadBalance();
  }

  private loadBalance(): void {
    forkJoin({
      incomes: this.incomeService.getAll(),
      expenses: this.expenseService.getAll(),
    }).subscribe({
      next: ({ incomes, expenses }) => {
        this.totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        this.totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        this.balanceChecked = true;
      },
      error: () => {
        this.balanceChecked = false;
      },
    });
  }

  get availableBalance(): number {
    const editingAmount = this.expenseToEdit ? this.expenseToEdit.amount : 0;
    return this.totalIncome - (this.totalExpenses - editingAmount);
  }

  private getEndOfTodayLocal(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return `${local.toISOString().slice(0, 10)}T23:59`;
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

    if (this.transactionDate > this.maxDate) {
      this.errorMessage = "No puedes ingresar una fecha futura.";
      return;
    }

    if (
      !this.balanceChecked ||
      (this.amount !== null && this.amount > this.availableBalance)
    ) {
      this.errorMessage = this.balanceChecked
        ? "Saldo insuficiente."
        : "No se pudo verificar el saldo disponible.";
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
        this.loadBalance();
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

  formatCurrency(amount: number): string {
    return this.settingsService.formatCurrency(amount);
  }

  private resetForm(): void {
    this.amount = null;
    this.category = "";
    this.transactionDate = "";
  }
}
