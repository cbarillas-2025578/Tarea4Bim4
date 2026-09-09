import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  infoMessage = '';
  logoUrl = 'assets/logo.png';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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
