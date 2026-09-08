import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../services/auth.service";
import { SettingsService, ThemeOption, LanguageOption } from "../services/settings.service";

@Component({
  selector: "app-config",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.css"],
})
export class ConfigComponent implements OnInit, OnDestroy {
  userName = "";
  userEmail = "";
  userInitials = "";

  theme: ThemeOption = "dark";
  language: LanguageOption = "es";
  currency: "Q" | "$" = "Q";

  notifyEmail = true;
  notifyPush = true;
  notifyWeekly = false;

  savedMessage = "";
  saveError = "";

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombre || "";
      this.userEmail = user.email || "";
      this.userInitials = this.userName.substring(0, 2).toUpperCase();
    }
    this.loadSettings();

    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => {
        this.theme = s.theme;
        this.language = s.language;
        this.currency = s.currency;
        this.notifyEmail = s.notifyEmail;
        this.notifyPush = s.notifyPush;
        this.notifyWeekly = s.notifyWeekly;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  t(key: string): string {
    return this.settingsService.t(key);
  }

  private loadSettings(): void {
    const s = this.settingsService.settings;
    this.theme = s.theme;
    this.language = s.language;
    this.currency = s.currency;
    this.notifyEmail = s.notifyEmail;
    this.notifyPush = s.notifyPush;
    this.notifyWeekly = s.notifyWeekly;
  }

  onThemeChange(): void {
    this.settingsService.update({ theme: this.theme });
  }

  onSettingsChange(): void {
    this.settingsService.update({
      currency: this.currency,
      language: this.language,
    });
  }

  onNotificationsChange(): void {
    this.settingsService.update({
      notifyEmail: this.notifyEmail,
      notifyPush: this.notifyPush,
      notifyWeekly: this.notifyWeekly,
    });
  }

  saveProfile(): void {
    const name = this.userName.trim();
    const email = this.userEmail.trim();
    if (!name) {
      this.saveError = this.t("config.nameEmpty");
      this.showSaved("");
      setTimeout(() => (this.saveError = ""), 3000);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.saveError = this.t("config.invalidEmail");
      this.showSaved("");
      setTimeout(() => (this.saveError = ""), 3000);
      return;
    }
    this.userInitials = name.substring(0, 2).toUpperCase();
    this.authService.updateProfile(name, email);
    this.saveError = "";
    this.showSaved(this.t("config.profileSaved"));
  }

  savePreferences(): void {
    this.settingsService.update({
      theme: this.theme,
      currency: this.currency,
      language: this.language,
    });
    this.saveError = "";
    this.showSaved(this.t("config.preferencesSaved"));
  }

  saveNotifications(): void {
    this.settingsService.update({
      notifyEmail: this.notifyEmail,
      notifyPush: this.notifyPush,
      notifyWeekly: this.notifyWeekly,
    });
    this.saveError = "";
    this.showSaved(this.t("config.notificationsSaved"));
  }

  resetSettings(): void {
    this.settingsService.reset();
    this.saveError = "";
    this.showSaved(this.t("config.resetDone"));
  }

  closeToast(): void {
    this.savedMessage = "";
  }

  private showSaved(msg: string): void {
    this.savedMessage = msg;
    if (msg) {
      setTimeout(() => {
        if (this.savedMessage === msg) this.savedMessage = "";
      }, 3000);
    }
  }
}