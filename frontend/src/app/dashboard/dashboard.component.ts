import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { forkJoin, Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';
import { IncomeService } from '../income/services/income.service';
import { Income } from '../income/models/income.model';
import { environment } from '../../environments/environment';

interface KpiCard {
  title: string;
  amount: number;
  color: string;
  icon: string;
}

interface Transaction {
  name: string;
  category: string;
  amount: number;
  date: string;
  sortDate: Date;
}

interface MonthlyData {
  label: string;
  income: number;
  expense: number;
}

interface CategoryTotal {
  name: string;
  amount: number;
  color: string;
  percent: number;
}

interface ExpenseRecord {
  id: number;
  amount: number;
  category: string;
  transactionDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentMonth = 'Agosto 2026';
  userName = 'Benjamin';
  userInitials = 'US';

  kpis: KpiCard[] = [
    { title: 'Ingresos', amount: 0, color: '#00A3FF', icon: '' },
    { title: 'Gastos', amount: 0, color: '#FF3B5C', icon: '' },
    { title: 'Balance', amount: 0, color: '#FFC700', icon: '' }
  ];

  recentTransactions: Transaction[] = [];
  monthlyData: MonthlyData[] = [];
  categoryTotals: CategoryTotal[] = [];

  chartIncomePoints = '';
  chartIncomeArea = '';
  chartExpensePoints = '';
  chartExpenseArea = '';
  chartIncomePath = '';
  chartExpensePath = '';
  chartIncomeDots: { cx: number; cy: number }[] = [];
  chartExpenseDots: { cx: number; cy: number }[] = [];
  chartYLabels: string[] = [];
  chartXLabels: string[] = [];

  donutTotal = 0;
  donutSegments: { color: string; dash: string; offset: string; delay: string }[] = [];

  private allIncomes: Income[] = [];
  private allExpenses: ExpenseRecord[] = [];

  private kpiIcons: { [key: string]: string } = {
    Ingresos: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    Gastos: '<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path>',
    Balance: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private incomeService: IncomeService,
    private http: HttpClient,
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombre || 'Benjamin';
      this.userInitials = this.userName.substring(0, 2).toUpperCase();
    }

    this.loadDashboardData();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        if (event.url === '/dashboard') {
          this.loadDashboardData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    const currentYear = new Date().getFullYear();

    forkJoin({
      incomes: this.incomeService.getAll({ year: currentYear }),
      expenses: this.http.get<ExpenseRecord[]>(`${environment.apiUrl}/expenses`)
    }).subscribe({
      next: ({ incomes, expenses }) => {
        this.allIncomes = incomes;
        this.allExpenses = expenses;

        this.computeKPIs();
        this.computeMonthlyData(currentYear);
        this.computeChart();
        this.computeDonut();
        this.computeRecentTransactions();
      },
      error: (err) => {
        console.warn('Error loading dashboard data:', err);
      }
    });
  }

  private computeKPIs(): void {
    const totalIncome = this.allIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = this.allExpenses.reduce((sum, e) => sum + e.amount, 0);

    this.kpis = [
      { title: 'Ingresos', amount: totalIncome, color: '#00A3FF', icon: '' },
      { title: 'Gastos', amount: totalExpenses, color: '#FF3B5C', icon: '' },
      { title: 'Balance', amount: totalIncome - totalExpenses, color: '#FFC700', icon: '' }
    ];
  }

  private computeMonthlyData(year: number): void {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const months: MonthlyData[] = [];
    for (let mIdx = 0; mIdx < 12; mIdx++) {
      months.push({ label: monthNames[mIdx], income: 0, expense: 0 });
    }

    this.allIncomes.forEach(inc => {
      const d = new Date(inc.transactionDate);
      if (d.getFullYear() === year) {
        const mIdx = d.getMonth();
        months[mIdx].income += inc.amount;
      }
    });

    this.allExpenses.forEach(exp => {
      const d = new Date(exp.transactionDate);
      if (d.getFullYear() === year) {
        const mIdx = d.getMonth();
        months[mIdx].expense += exp.amount;
      }
    });

    this.monthlyData = months;
    this.chartXLabels = months.map(m => m.label);
  }

  private computeChart(): void {
    const data = this.monthlyData;
    if (data.length === 0) return;

    const allValues = data.flatMap(d => [d.income, d.expense]);
    const maxVal = Math.max(...allValues, 1);
    const niceMax = Math.ceil(maxVal / 1000) * 1000 || 1000;

    this.chartYLabels = [];
    for (let i = 4; i >= 0; i--) {
      const val = (niceMax / 4) * i;
      this.chartYLabels.push(val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K` : String(Math.round(val)));
    }

    const svgWidth = 600;
    const svgHeight = 200;
    const stepX = data.length > 1 ? svgWidth / (data.length - 1) : svgWidth;
    const toY = (val: number) => svgHeight - (val / niceMax) * svgHeight;

    const incPoints: string[] = [];
    const expPoints: string[] = [];

    data.forEach((d, i) => {
      const x = i * stepX;
      incPoints.push(`${x},${toY(d.income)}`);
      expPoints.push(`${x},${toY(d.expense)}`);
    });

    this.chartIncomePoints = incPoints.join(' ');
    this.chartExpensePoints = expPoints.join(' ');

    const incCoords = data.map((d, i) => ({ x: i * stepX, y: toY(d.income) }));
    const expCoords = data.map((d, i) => ({ x: i * stepX, y: toY(d.expense) }));
    this.chartIncomePath = this.computeBezierPath(incCoords);
    this.chartExpensePath = this.computeBezierPath(expCoords);
    this.chartIncomeArea = `${this.chartIncomePath} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;
    this.chartExpenseArea = `${this.chartExpensePath} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

    this.chartIncomeDots = data.map((d, i) => ({ cx: i * stepX, cy: toY(d.income) }));
    this.chartExpenseDots = data.map((d, i) => ({ cx: i * stepX, cy: toY(d.expense) }));
  }

  private computeBezierPath(points: { x: number; y: number }[]): string {
    const n = points.length;
    if (n < 2) return '';
    if (n === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

    // Interpolación cúbica monótona (Fritsch-Carlson) para evitar
    // torceduras/overshoot cuando varios meses tienen valores cercanos.
    const h: number[] = [];
    const s: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      h.push(points[i + 1].x - points[i].x);
      s.push((points[i + 1].y - points[i].y) / h[i]);
    }

    // Tangentes (derivadas) en cada punto, respetando la monotonicidad
    const m: number[] = new Array(n).fill(0);
    m[0] = s[0];
    m[n - 1] = s[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (s[i - 1] * s[i] <= 0) {
        m[i] = 0;
      } else {
        m[i] = 3 * (h[i - 1] + h[i]) /
          ((h[i - 1] + 2 * h[i]) / s[i - 1] + (2 * h[i - 1] + h[i]) / s[i]);
      }
    }

    // Construir path Bezier cúbico con las tangentes monótonas
    const t = 1 / 3;
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < n - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const c1x = p1.x + h[i] * t;
      const c1y = p1.y + m[i] * h[i] * t;
      const c2x = p2.x - h[i] * t;
      const c2y = p2.y - m[i + 1] * h[i] * t;
      d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  private computeDonut(): void {
    const colors = ['#00A3FF', '#FF3B5C', '#FFC700', '#FF6B00', '#A855F7', '#10B981'];
    const categoryMap: { [key: string]: number } = {};

    this.allExpenses.forEach(exp => {
      const cat = exp.category || 'Otros';
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
    });

    const total = Object.values(categoryMap).reduce((s, v) => s + v, 0);
    this.donutTotal = total;

    const sorted = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const circumference = 2 * Math.PI * 80;
    let accumulated = 0;

    this.categoryTotals = sorted.map(([name, amount], i) => ({
      name,
      amount,
      color: colors[i % colors.length],
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
        delay: `${0.2 + i * 0.2}s`
      };
    });
  }

  private computeRecentTransactions(): void {
    const txs: Transaction[] = [];

    this.allIncomes.forEach(inc => {
      const d = new Date(inc.transactionDate);
      txs.push({
        name: inc.source,
        category: 'Ingresos',
        amount: inc.amount,
        date: this.formatShortDate(d),
        sortDate: d
      });
    });

    this.allExpenses.forEach(exp => {
      const d = new Date(exp.transactionDate);
      txs.push({
        name: exp.category || 'Gasto',
        category: exp.category || 'Gastos',
        amount: -exp.amount,
        date: this.formatShortDate(d),
        sortDate: d
      });
    });

    txs.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    this.recentTransactions = txs.slice(0, 6);
  }

  private formatShortDate(d: Date): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  getKpiIcon(title: string): SafeHtml {
    const path = this.kpiIcons[title] || '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  formatCurrency(amount: number): string {
    return this.settingsService.formatCurrency(amount);
  }

  t(key: string): string {
    return this.settingsService.t(key);
  }

  logout(): void {
    this.authService.logout();
  }
}
