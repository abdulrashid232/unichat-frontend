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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly errorFormatter: ErrorFormatterService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        university: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [this.passwordMatchValidator] }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;

    const { name, email, university, password } = this.registerForm.value;

    this.authService.register(name, email, password, university).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Account created successfully!');
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error(this.errorFormatter.formatError(error, 'Registration failed'));
      },
    } );


}
  private formatErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';

    // Handle specific error cases
    if (error.status === 409) {
      return 'An account with this email already exists';
    }

    if (error.status === 400) {
      return 'Please check your information and try again';
    }

    // Extract message from different error formats
    let message = 'Registration failed';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error.message) {
      message = error.message;
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (Array.isArray(error.error?.errors)) {
      // Handle validation errors array
      message = error.error.errors.map((e: any) => e.message || e).join('. ');
    }
    
    // Clean up common backend messages
    message = message
      .replace('Error: ', '')
      .replace(/^[a-z]/, (c) => c.toUpperCase());
    
    return message;
  }
}
