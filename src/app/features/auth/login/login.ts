import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { extractApiErrors } from '../../../core/api-error.util';
import { AuthService } from '../../../core/services/auth.service';
import { ListErrors } from '../../../shared/components/list-errors/list-errors';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ListErrors],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly errors = signal<Record<string, string[]> | null>(null);
  protected readonly isSubmitting = signal(false);

  protected readonly form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required]),
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.errors.set(null);
    this.isSubmitting.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(extractApiErrors(error, 'Unable to sign in'));
      },
    });
  }
}
