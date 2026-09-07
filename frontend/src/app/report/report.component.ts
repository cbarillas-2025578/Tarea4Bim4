import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ReportService, ReportData } from "./services/report.service";

@Component({
  selector: "app-report",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"],
})
export class ReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userName = "Usuario";
  userInitials = "US";

  monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  shortMonthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  yearOptions: number[] = [];

  selectedYear = new Date().getFullYear();
  selectedMonthIdx = 0; // 0 = anual, 1..12 = mes
  periodLabel = "";

  report: ReportData | null = null;
  loading = false;
  errorMessage = "";

  // Bar chart state
  barLabels: string[] = [];
  barIncome: number[] = [];
  barExpense: number[] = [];
  barMax = 0;
  barNiceMax = 1000;
  barYLabels: string[] = [];

  // Donut state
  donutTotal = 0;
  donutSegments: { color: string; dash: string; offset: string; delay: string }[] = [];
  donutCategories: { name: string; amount: number; color: string; percent: number }[] = [];

  // Income donut
  incomeDonutTotal = 0;
  incomeDonutSegments: { color: string; dash: string; offset: string; delay: string }[] = [];
  incomeDonutCategories: { name: string; amount: number; color: string; percent: number }[] = [];

  private donutColors = ["#38BDF8", "#FACC15", "#EF4444", "#22C55E", "#8B5CF6", "#EC4899", "#F97316", "#14B8A6", "#10B981", "#6B7280"];

  constructor(
    private authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.selectedYear = now.getFullYear();

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
      .subscribe((user) => {
        if (user) {
          this.userName = user.nombre || "Usuario";
          this.userInitials = this.userName.substring(0, 2).toUpperCase();
        }
      });

    this.loadReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReport(): void {
    this.loading = true;
    this.errorMessage = "";

    const month = this.selectedMonthIdx > 0 ? this.selectedMonthIdx : undefined;
    this.periodLabel = month
      ? `${this.monthNames[month - 1]} ${this.selectedYear}`
      : `Año ${this.selectedYear}`;

    this.reportService.getReport(this.selectedYear, month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.report = data;
          this.computeBarChart(data);
          this.computeExpenseDonut(data);
          this.computeIncomeDonut(data);
          this.loading = false;
        },
        error: () => {
          this.errorMessage = "No se pudo generar el reporte.";
          this.loading = false;
        },
      });
  }

  onPeriodChange(): void {
    this.loadReport();
  }

  selectMonth(idx: number): void {
    this.selectedMonthIdx = idx;
    this.loadReport();
  }

  private computeBarChart(data: ReportData): void {
    const months = data.monthly;

    if (data.month) {
      const m = months[data.month - 1];
      this.barLabels = [this.monthNames[data.month - 1]];
      this.barIncome = [m.income];
      this.barExpense = [m.expense];
    } else {
      this.barLabels = months.map((m) => m.label);
      this.barIncome = months.map((m) => m.income);
      this.barExpense = months.map((m) => m.expense);
    }

    const allValues = [...this.barIncome, ...this.barExpense];
    const maxVal = Math.max(...allValues, 1);
    this.barMax = maxVal;
    this.barNiceMax = maxVal <= 1000 ? 1000 : Math.ceil(maxVal / 1000) * 1000;
    this.barNiceMax = this.barNiceMax || 1000;

    this.barYLabels = [];
    const steps = 4;
    for (let i = 4; i >= 0; i--) {
      const val = (this.barNiceMax / steps) * i;
      this.barYLabels.push(val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K` : String(Math.round(val)));
    }
  }

  private buildDonut(items: { name: string; amount: number; percent: number }[], total: number) {
    const circumference = 2 * Math.PI * 80;
    let accumulated = 0;
    const segments = items.map((item, i) => {
      const color = this.donutColors[i % this.donutColors.length];
      const percent = item.percent;
      const segmentLen = (percent / 100) * circumference;
      const offset = -accumulated;
      accumulated += segmentLen;
      return {
        color,
        dash: `${segmentLen} ${circumference - segmentLen}`,
        offset: `${offset}`,
        delay: `${0.2 + i * 0.12}s`,
      };
    });
    return { total, segments };
  }

  private computeExpenseDonut(data: ReportData): void {
    const items = data.expenseByCategory;
    const total = items.reduce((s, i) => s + i.amount, 0);
    this.donutTotal = total;

    const catItems = items.map((item, i) => ({
      name: item.name,
      amount: item.amount,
      color: this.donutColors[i % this.donutColors.length],
      percent: item.percent,
    }));
    this.donutCategories = catItems;

    const built = this.buildDonut(items, total);
    this.donutSegments = built.segments;
  }

  private computeIncomeDonut(data: ReportData): void {
    const items = data.incomeBySource;
    const total = items.reduce((s, i) => s + i.amount, 0);
    this.incomeDonutTotal = total;

    const catItems = items.map((item, i) => ({
      name: item.name,
      amount: item.amount,
      color: this.donutColors[i % this.donutColors.length],
      percent: item.percent,
    }));
    this.incomeDonutCategories = catItems;

    const built = this.buildDonut(items, total);
    this.incomeDonutSegments = built.segments;
  }

  barPercent(value: number): number {
    return this.barNiceMax > 0 ? (value / this.barNiceMax) * 100 : 0;
  }

  formatCurrency(amount: number): string {
    return "Q " + Math.abs(amount).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatNumber(value: number): string {
    return value.toLocaleString("es-GT");
  }

  formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }

  logout(): void {
    this.authService.logout();
  }
}