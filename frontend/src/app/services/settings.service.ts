import { Injectable, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { BehaviorSubject } from "rxjs";

export type ThemeOption = "dark" | "light" | "system";
export type LanguageOption = "es" | "en";

export interface AppSettings {
  theme: ThemeOption;
  language: LanguageOption;
  currency: "Q" | "$";
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyWeekly: boolean;
}

const SETTINGS_KEY = "app_settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  language: "es",
  currency: "Q",
  notifyEmail: true,
  notifyPush: true,
  notifyWeekly: false,
};

interface Dictionary {
  [key: string]: { es: string; en: string };
}

const TRANSLATIONS: Dictionary = {
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.expenses": { es: "Gastos", en: "Expenses" },
  "nav.income": { es: "Ingresos", en: "Income" },
  "nav.reports": { es: "Reportes", en: "Reports" },
  "nav.categories": { es: "Categorías", en: "Categories" },
  "nav.settings": { es: "Configuración", en: "Settings" },
  "nav.logout": { es: "Cerrar sesión", en: "Log out" },
  "app.brand": { es: "Control de Gastos", en: "Expense Tracker" },
  "dash.title": { es: "Inicio", en: "Home" },
  "dash.subtitle": { es: "Resumen de tu actividad financiera", en: "Financial activity summary" },
  "dash.greeting": { es: "Hola, ", en: "Hello, " },
  "dash.incomeVsExpense": { es: "Ingresos vs Gastos", en: "Income vs Expenses" },
  "dash.expenseByCategory": { es: "Gastos por Categoría", en: "Expenses by Category" },
  "dash.recentTransactions": { es: "Últimos Movimientos", en: "Recent Transactions" },
  "dash.totalExpenses": { es: "Total Gastos", en: "Total Expenses" },
  "dash.noExpenses": { es: "Sin gastos registrados", en: "No expenses registered" },
  "dash.noTransactions": { es: "Sin movimientos aún", en: "No movements yet" },
  "dash.transaction": { es: "Transacción", en: "Transaction" },
  "dash.amount": { es: "Monto", en: "Amount" },
  "dash.date": { es: "Fecha", en: "Date" },
  "config.title": { es: "Configuración", en: "Settings" },
  "config.profile": { es: "Perfil", en: "Profile" },
  "config.preferences": { es: "Preferencias", en: "Preferences" },
  "config.notifications": { es: "Notificaciones", en: "Notifications" },
  "config.theme": { es: "Tema", en: "Theme" },
  "config.dark": { es: "Oscuro", en: "Dark" },
  "config.light": { es: "Claro", en: "Light" },
  "config.system": { es: "Sistema", en: "System" },
  "config.currency": { es: "Moneda", en: "Currency" },
  "config.language": { es: "Idioma", en: "Language" },
  "config.name": { es: "Nombre", en: "Name" },
  "config.email": { es: "Correo electrónico", en: "Email address" },
  "config.saveProfile": { es: "Guardar perfil", en: "Save profile" },
  "config.savePreferences": { es: "Guardar preferencias", en: "Save preferences" },
  "config.saveNotifications": { es: "Guardar notificaciones", en: "Save notifications" },
  "config.emailNotif": { es: "Notificaciones por correo", en: "Email notifications" },
  "config.emailNotifDesc": { es: "Recibe avisos importantes en tu correo", en: "Receive important alerts in your email" },
  "config.pushNotif": { es: "Notificaciones push", en: "Push notifications" },
  "config.pushNotifDesc": { es: "Alertas inmediatas en el dispositivo", en: "Immediate alerts on your device" },
  "config.weeklyReport": { es: "Reporte semanal", en: "Weekly report" },
  "config.weeklyReportDesc": { es: "Resumen de tus finanzas cada semana", en: "Weekly summary of your finances" },
  "config.profileSaved": { es: "Perfil actualizado correctamente", en: "Profile updated successfully" },
  "config.preferencesSaved": { es: "Preferencias guardadas", en: "Preferences saved" },
  "config.notificationsSaved": { es: "Notificaciones actualizadas", en: "Notifications updated" },
  "config.saved": { es: "Guardado", en: "Saved" },
  "config.dangerZone": { es: "Zona de peligro", en: "Danger zone" },
  "config.dangerZoneDesc": { es: "Restablece la configuración de la aplicación a sus valores por defecto.", en: "Reset the application settings to their default values." },
  "config.reset": { es: "Restablecer configuración", en: "Reset settings" },
  "config.resetDone": { es: "Configuración restablecida", en: "Settings reset" },
  "config.nameEmpty": { es: "El nombre no puede estar vacío.", en: "Name cannot be empty." },
  "config.invalidEmail": { es: "Ingresa un correo electrónico válido.", en: "Enter a valid email address." },
  "config.currencyQuetzal": { es: "Quetzal (Q)", en: "Quetzal (Q)" },
  "config.currencyDollar": { es: "Dólar ($)", en: "Dollar ($)" },
  "config.langSpanish": { es: "Español", en: "Spanish" },
  "config.langEnglish": { es: "Inglés", en: "English" },
  "income.title": { es: "Ingresos", en: "Income" },
  "income.period": { es: "Período", en: "Period" },
  "income.newIncome": { es: "Nuevo Ingreso", en: "New Income" },
  "income.totalMonth": { es: "Total de ingresos del mes", en: "Total income this month" },
  "income.vsPrevMonth": { es: "% del mes anterior", en: "% from last month" },
  "income.history": { es: "Historial de Ingresos", en: "Income History" },
  "income.loading": { es: "Cargando ingresos...", en: "Loading incomes..." },
  "income.description": { es: "Descripción", en: "Description" },
  "income.category": { es: "Categoría", en: "Category" },
  "income.date": { es: "Fecha", en: "Date" },
  "income.amount": { es: "Monto", en: "Amount" },
  "income.actions": { es: "Acciones", en: "Actions" },
  "income.edit": { es: "Editar", en: "Edit" },
  "income.delete": { es: "Eliminar", en: "Delete" },
  "income.noIncomes": { es: "No hay ingresos registrados", en: "No incomes registered" },
  "income.noIncomesHint": { es: "Haz clic en \"+ Nuevo Ingreso\" para comenzar", en: "Click \"+ New Income\" to get started" },
  "income.noIncomesShort": { es: "Sin ingresos registrados", en: "No incomes registered" },
  "income.byCategory": { es: "Ingresos por Categoría", en: "Income by Category" },
  "income.total": { es: "Total", en: "Total" },
  "report.title": { es: "Reportes", en: "Reports" },
  "report.period": { es: "Período", en: "Period" },
  "report.annual": { es: "Anual", en: "Annual" },
  "report.all": { es: "Todo", en: "All" },
  "report.generating": { es: "Generando reporte...", en: "Generating report..." },
  "report.income": { es: "Ingresos", en: "Income" },
  "report.expenses": { es: "Gastos", en: "Expenses" },
  "report.balance": { es: "Balance", en: "Balance" },
  "report.transactions": { es: "transacciones", en: "transactions" },
  "report.totalTransactions": { es: "transacciones totales", en: "total transactions" },
  "report.incomeVsExpenses": { es: "Ingresos vs Gastos", en: "Income vs Expenses" },
  "report.monthlyDetail": { es: "Detalle mensual", en: "Monthly detail" },
  "report.month": { es: "Mes", en: "Month" },
  "report.expenseByCategory": { es: "Gastos por categoría", en: "Expenses by category" },
  "report.noExpenses": { es: "Sin gastos registrados", en: "No expenses registered" },
  "report.incomeBySource": { es: "Ingresos por fuente", en: "Income by source" },
  "report.noIncomes": { es: "Sin ingresos registrados", en: "No incomes registered" },
  "report.year": { es: "Año", en: "Year" },
  "report.topExpenseCategory": { es: "Categoría con mayor gasto", en: "Top expense category" },
  "report.topIncomeSource": { es: "Fuente principal de ingreso", en: "Main income source" },
  "category.title": { es: "Categorías", en: "Categories" },
  "category.total": { es: "Total", en: "Total" },
  "category.ofExpense": { es: "De gastos", en: "Expenses" },
  "category.ofIncome": { es: "De ingresos", en: "Income" },
  "category.new": { es: "Nueva Categoría", en: "New Category" },
  "category.hint": { es: "Organiza tus gastos e ingresos por categoría", en: "Organize your expenses and income by category" },
  "category.editTitle": { es: "Editar categoría", en: "Edit category" },
  "category.newTitle": { es: "Nueva categoría", en: "New category" },
  "category.name": { es: "Nombre", en: "Name" },
  "category.namePlaceholder": { es: "Ej. Alimentación", en: "e.g. Food" },
  "category.type": { es: "Tipo", en: "Type" },
  "category.typeExpense": { es: "Gasto", en: "Expense" },
  "category.typeIncome": { es: "Ingreso", en: "Income" },
  "category.color": { es: "Color", en: "Color" },
  "category.icon": { es: "Icono", en: "Icon" },
  "category.defaultName": { es: "Categoría", en: "Category" },
  "category.saveChanges": { es: "Guardar cambios", en: "Save changes" },
  "category.create": { es: "Crear categoría", en: "Create category" },
  "category.cancel": { es: "Cancelar", en: "Cancel" },
  "category.mine": { es: "Mis categorías", en: "My categories" },
  "category.loading": { es: "Cargando categorías...", en: "Loading categories..." },
  "category.noCategories": { es: "No hay categorías registradas", en: "No categories registered" },
  "category.noCategoriesHint": { es: "Haz clic en \"Nueva Categoría\" para comenzar", en: "Click \"New Category\" to get started" },
  "category.edit": { es: "Editar", en: "Edit" },
  "category.delete": { es: "Eliminar", en: "Delete" },
  "expense.title": { es: "Gastos", en: "Expenses" },
  "expense.period": { es: "Período", en: "Period" },
  "expense.newExpense": { es: "Nuevo Gasto", en: "New Expense" },
  "expense.totalMonth": { es: "Total de gastos del mes", en: "Total expenses this month" },
  "expense.vsPrevMonth": { es: "% del mes anterior", en: "% from last month" },
  "expense.history": { es: "Historial de Gastos", en: "Expense History" },
  "expense.loading": { es: "Cargando gastos...", en: "Loading expenses..." },
  "expense.category": { es: "Categoría", en: "Category" },
  "expense.date": { es: "Fecha", en: "Date" },
  "expense.amount": { es: "Monto", en: "Amount" },
  "expense.actions": { es: "Acciones", en: "Actions" },
  "expense.edit": { es: "Editar", en: "Edit" },
  "expense.delete": { es: "Eliminar", en: "Delete" },
  "expense.noExpenses": { es: "No hay gastos registrados", en: "No expenses registered" },
  "expense.noExpensesHint": { es: "Haz clic en \"+ Nuevo Gasto\" para comenzar", en: "Click \"+ New Expense\" to get started" },
  "expense.noExpensesShort": { es: "Sin gastos registrados", en: "No expenses registered" },
  "expense.byCategory": { es: "Gastos por Categoría", en: "Expenses by Category" },
  "expense.total": { es: "Total", en: "Total" },
  "expense.links": { es: "Accesos rápidos", en: "Quick links" },
  "expense.linkHome": { es: "Inicio", en: "Home" },
  "expense.linkIncome": { es: "Ingresos", en: "Income" },
  "expense.linkReports": { es: "Reportes", en: "Reports" },
  "expense.linkCategories": { es: "Categorías", en: "Categories" },
  "expense.linkHomeDesc": { es: "Resumen de tu actividad financiera", en: "Financial activity summary" },
  "expense.linkIncomeDesc": { es: "Registra tus ingresos", en: "Register your income" },
  "expense.linkReportsDesc": { es: "Analiza tus finanzas", en: "Analyze your finances" },
  "expense.linkCategoriesDesc": { es: "Organiza tus categorías", en: "Organize your categories" },
  "expense.avg": { es: "Promedio por gasto", en: "Average per expense" },
  "expense.monthBudget": { es: "Presupuesto mensual", en: "Monthly budget" },
  "expense.remaining": { es: "Disponible", en: "Remaining" },
  "expense.used": { es: "Utilizado", en: "Used" },
};

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<AppSettings>(this.load());
  public settings$ = this.settingsSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.applyTheme(this.settingsSubject.value.theme);
  }

  get settings(): AppSettings {
    return this.settingsSubject.value;
  }

  get currency(): "Q" | "$" {
    return this.settingsSubject.value.currency;
  }

  get language(): LanguageOption {
    return this.settingsSubject.value.language;
  }

  get theme(): ThemeOption {
    return this.settingsSubject.value.theme;
  }

  update(partial: Partial<AppSettings>): void {
    const next = { ...this.settingsSubject.value, ...partial };
    this.settingsSubject.next(next);
    this.persist(next);
    if (partial.theme) this.applyTheme(next.theme);
  }

  reset(): void {
    this.settingsSubject.next({ ...DEFAULT_SETTINGS });
    this.persist(DEFAULT_SETTINGS);
    this.applyTheme(DEFAULT_SETTINGS.theme);
  }

  formatCurrency(amount: number): string {
    const symbol = this.currency;
    const abs = Math.abs(amount);
    const formatted = abs.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (amount < 0 ? "-" : "") + symbol + " " + formatted;
  }

  t(key: string): string {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[this.language];
  }

  private applyTheme(theme: ThemeOption): void {
    const resolved = theme === "system"
      ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : theme;
    this.document.body.setAttribute("data-theme", resolved);
  }

  private persist(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  private load(): AppSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }
}