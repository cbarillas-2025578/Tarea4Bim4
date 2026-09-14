import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleGsiId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }): void;
  renderButton(parent: HTMLElement | null, options: object): void;
}

interface GoogleGsi {
  accounts: { id: GoogleGsiId };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  infoMessage = '';
  logoUrl = 'assets/logo.png';
  googleClientId = environment.googleClientId;
  showGoogle = !!environment.googleClientId;
  private googlePollTimer: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Leer el flag de expiración de forma fiable
    if (this.route.snapshot.queryParamMap.has('sessionExpired')) {
      this.infoMessage = 'Su sesión ha expirado. El token venció después de 2 minutos, por favor inicia sesión nuevamente.';
    }

    // Reaccionar si la expiración ocurre mientras ya estamos en el login
    this.route.queryParamMap.subscribe(params => {
      if (params.has('sessionExpired')) {
        this.infoMessage = 'Su sesión ha expirado. El token venció después de 2 minutos, por favor inicia sesión nuevamente.';
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupGoogleButton();
  }

  ngOnDestroy(): void {
    if (this.googlePollTimer) {
      clearInterval(this.googlePollTimer);
      this.googlePollTimer = null;
    }
  }

  private setupGoogleButton(): void {
    if (!this.showGoogle) return;

    const getGoogle = () =>
      (window as unknown as { google?: GoogleGsi }).google;

    // Si el script de Google aún no carga, reintentamos cada 400 ms
    const id = getGoogle()?.accounts?.id;
    if (id) {
      this.renderGoogleButton(id);
      return;
    }
    this.googlePollTimer = setInterval(() => {
      const gid = getGoogle()?.accounts?.id;
      if (gid) {
        this.ngZone.run(() => this.renderGoogleButton(gid));
        if (this.googlePollTimer) {
          clearInterval(this.googlePollTimer);
          this.googlePollTimer = null;
        }
      }
    }, 400);
  }

  private renderGoogleButton(id: GoogleGsiId): void {
    id.initialize({
      client_id: this.googleClientId,
      callback: (response) => this.onGoogleCredential(response.credential),
      auto_select: false
    });
    id.renderButton(document.getElementById('google-login-button'), {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill'
    });
  }

  onGoogleCredential(credential: string): void {
    this.ngZone.run(() => {
      if (!credential) return;
      this.isLoading = true;
      this.errorMessage = '';
      this.infoMessage = '';

      this.authService.googleLogin(credential).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'No se pudo iniciar sesión con Google. Intente de nuevo.';
        }
      });
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.infoMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Credenciales incorrectas. Por favor, intente de nuevo.';
        }
      });
    }
  }
}
