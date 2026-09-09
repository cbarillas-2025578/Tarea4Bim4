import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IncomeService } from "../../services/income.service";
import { INCOME_SOURCES, Income } from "../../models/income.model";

@Component({
  selector: "app-income-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./income-form.component.html",
  styleUrls: ["./income-form.component.css"],
})
export class IncomeFormComponent implements OnChanges {
  @Input() incomeToEdit: Income | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  sources = INCOME_SOURCES;

  amount: number | null = null;
  source = "";
  description = "";
  transactionDate = "";
  errorMessage = "";

  constructor(private incomeService: IncomeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["incomeToEdit"] && this.incomeToEdit) {
      this.amount = this.incomeToEdit.amount;
      this.source = this.incomeToEdit.source;
      this.description = this.incomeToEdit.description;
      const raw = this.incomeToEdit.transactionDate;
      this.transactionDate = raw ? String(raw).slice(0, 16) : "";
    }
  }

  submit(): void {
    this.errorMessage = "";

    if (!this.amount || this.amount <= 0 || !this.source || !this.transactionDate) {
      this.errorMessage = "Completa monto, fuente y fecha antes de guardar.";
      return;
    }

    const payload = {
      amount: this.amount,
      source: this.source,
      description: this.description,
      transactionDate: new Date(this.transactionDate).toISOString(),
    };

    const request$ = this.incomeToEdit
      ? this.incomeService.update(this.incomeToEdit.id, payload)
      : this.incomeService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.saved.emit();
      },
      error: () => {
        this.errorMessage = "Ocurrió un error al guardar el ingreso. Intenta de nuevo.";
      },
    });
  }

  cancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.amount = null;
    this.source = "";
    this.description = "";
    this.transactionDate = "";
  }
}
