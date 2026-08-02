import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './comment-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentForm {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly authService = inject(AuthService);

  readonly commentSubmitted = output<string>();
  readonly isSubmitting = signal(false);

  protected readonly form = this.fb.group({
    body: this.fb.control('', [Validators.required]),
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.commentSubmitted.emit(this.form.getRawValue().body);
    this.form.reset({ body: '' });
  }
}
