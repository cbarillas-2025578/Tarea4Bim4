import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../services/auth.service";
import { SettingsService } from "../services/settings.service";
import { IncomeService } from "./services/income.service";
import { Income, INCOME_SOURCES } from "./models/income.model";
import { IncomeFormComponent } from "./components/income-form/income-form.component";

interface CategoryTotal {
  name: string;
  amount: number;
  color: string;
  percent: number;
}

@Component({
  selector: "app-income",
  standalone: true,
  imports: [CommonModule, FormsModule, IncomeFormComponent],
  templateUrl: "./income.component.html",
  styleUrls: ["./income.component.css"],
})
export class IncomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentMonth = "";
  currentYear = 0;
  userName = "Usuario";
  userInitials = "US";
  selectedPeriodMonthIdx = 0;
  selectedPeriodYear = 0;

  incomes: Income[] = [];
  loading = false;
  errorMessage = "";
  showForm = false;
  incomeToEdit: Income | null = null;

  pendingDeleteIncome: Income | null = null;

  totalIncome = 0;
  previousMonthTotal = 0;
  trendPercent = 0;

  donutTotal = 0;
  donutSegments: { color: string; dash: string; offset: string; delay: string }[] = [];
  categoryTotals: CategoryTotal[] = [];

  monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  yearOptions: number[] = [];

  private donutColors = ["#56D8F6", "#FACC15", "#EF4444", "#22C55E", "#10B981", "#6B7280"];

  private iconPaths: { [key: string]: string } = {
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
    trash: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
  };

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private incomeService: IncomeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentMonth = this.monthNames[now.getMonth()];
    this.currentYear = now.getFullYear();
    this.selectedPeriodMonthIdx = now.getMonth();
    this.selectedPeriodYear = now.getFullYear();

    this.yearOptions = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) {
      this.yearOptions.push(y);
    }

    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombre || "Usuario";
      this.userInitials = this.userName.substring(0, 2).toUpperCase();
    }

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = user.nombre || "Usuario";
          this.userInitials = this.userName.substring(0, 2).toUpperCase();
        }
      });

    this.loadIncomes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIncomes(): void {
    this.loading = true;
    this.errorMessage = "";

    this.incomeService.getAll({
      year: this.selectedPeriodYear,
      month: this.selectedPeriodMonthIdx + 1
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.incomes = data;
        this.computeTotals();
        this.computeDonut();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "No se pudieron cargar los ingresos.";
        this.loading = false;
      }
    });
  }

  onPeriodChange(): void {
    this.loadIncomes();
  }

  private computeTotals(): void {
    const previousDate = new Date(this.selectedPeriodYear, this.selectedPeriodMonthIdx - 1, 1);

    this.totalIncome = this.incomes.reduce((sum, i) => sum + i.amount, 0);

    this.incomeService.getAll({
      year: previousDate.getFullYear(),
      month: previousDate.getMonth() + 1
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (prevIncomes) => {
        this.previousMonthTotal = prevIncomes.reduce((sum, i) => sum + i.amount, 0);
        if (this.previousMonthTotal > 0) {
          this.trendPercent = Math.round(((this.totalIncome - this.previousMonthTotal) / this.previousMonthTotal) * 100);
        } else {
          this.trendPercent = this.totalIncome > 0 ? 100 : 0;
        }
      }
    });
  }

  private computeDonut(): void {
    const categoryMap: { [key: string]: number } = {};

    this.incomes.forEach(inc => {
      const cat = inc.source || "Otros";
      categoryMap[cat] = (categoryMap[cat] || 0) + inc.amount;
    });

    const total = Object.values(categoryMap).reduce((s, v) => s + v, 0);
    this.donutTotal = total;

    const sorted = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1]);

    const circumference = 2 * Math.PI * 80;
    let accumulated = 0;

    this.categoryTotals = sorted.map(([name, amount], i) => ({
      name,
      amount,
      color: this.donutColors[i % this.donutColors.length],
      percent: total > 0 ? Math.round((amount / total) * 100) : 0
    }));

    this.donutSegments = this.categoryTotals.map((cat, i) => {
      const segmentLen = (cat.percent / 100) * circumference;
      const offset = -accumulated;
      accumulated += segmentLen;
      return {
        color: cat.color,
        dash: `${segmentLen} ${circumference - segmentLen}`,
        offset: `${offset}`,
        delay: `${0.2 + i * 0.15}s`
      };
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.incomeToEdit = null;
    }
  }

  onSaved(): void {
    this.showForm = false;
    this.incomeToEdit = null;
    this.loadIncomes();
  }

  cancelForm(): void {
    this.showForm = false;
    this.incomeToEdit = null;
  }

  editIncome(income: Income): void {
    this.incomeToEdit = { ...income };
    this.showForm = true;
  }

  askDelete(income: Income): void {
    this.pendingDeleteIncome = income;
    this.showForm = false;
  }

  cancelDelete(): void {
    this.pendingDeleteIncome = null;
  }

  performDelete(): void {
    const income = this.pendingDeleteIncome;
    if (!income) return;
    this.pendingDeleteIncome = null;
    this.errorMessage = "";

    this.incomeService.delete(income.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => this.loadIncomes(),
      error: () => (this.errorMessage = "No se pudo eliminar el ingreso.")
    });
  }

  getIcon(name: string): SafeHtml {
    const path = this.iconPaths[name] || "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  formatCurrency(amount: number): string {
    return this.settingsService.formatCurrency(amount);
  }

  t(key: string): string {
    return this.settingsService.t(key);
  }

  formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  logout(): void {
    this.authService.logout();
  }
}
