import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ListErrors } from '../../shared/components/list-errors/list-errors';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, ListErrors],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly errors = signal<Record<string, string[]> | null>(null);
  protected readonly isSubmitting = signal(false);

  private readonly user = this.authService.currentUser();

  protected readonly form = this.fb.group({
    image: this.fb.control(this.user?.image ?? ''),
    username: this.fb.control(this.user?.username ?? '', [Validators.required]),
    bio: this.fb.control(this.user?.bio ?? ''),
    email: this.fb.control(this.user?.email ?? '', [Validators.required, Validators.email]),
    password: this.fb.control(''),
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.errors.set(null);
    this.isSubmitting.set(true);

    const { password, ...rest } = this.form.getRawValue();
    const update = password ? { ...rest, password } : rest;

    this.authService.updateUser(update).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/profile', this.authService.username()]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(error.error?.errors ?? { '': ['Unable to update settings'] });
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
