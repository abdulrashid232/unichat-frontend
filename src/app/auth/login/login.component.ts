import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ErrorFormatterService } from '../../services/error-formatter.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly errorFormatter: ErrorFormatterService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Login successful!');
        this.router.navigate(['/chat']);
      },
      error: (error) =>{
        this.isLoading = false;
        this.toastService.error(this.errorFormatter.formatError(error, 'Login failed'));
      },
    }); 
  }
  private formatErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';
    if (error.status === 401) {
      return 'Invalid email or password';
    }

    if (error.status === 404) {
      return 'Account not found. Please check your email';
    }
    let message = 'Login failed';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error.message) {
      message = error.message;
    } else if (error.error?.message) {
      message = error.error.message;
    }
    message = message
      .replace('Error: ', '')
      .replace(/^[a-z]/, (c) => c.toUpperCase());
    
    return message;
  }
}
