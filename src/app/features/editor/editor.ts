import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ArticlesService } from '../../core/services/articles.service';
import { ListErrors } from '../../shared/components/list-errors/list-errors';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-editor',
  imports: [ReactiveFormsModule, FormsModule, ListErrors, Icon],
  templateUrl: './editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Editor {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly articlesService = inject(ArticlesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly errors = signal<Record<string, string[]> | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly tagList = signal<string[]>([]);
  protected readonly tagInput = signal('');
  protected readonly slug = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: this.fb.control('', [Validators.required]),
    description: this.fb.control('', [Validators.required]),
    body: this.fb.control('', [Validators.required]),
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const slug = params.get('slug');
      this.slug.set(slug);
      this.form.reset({ title: '', description: '', body: '' });
      this.tagList.set([]);

      if (slug) {
        this.articlesService.get(slug).subscribe(({ article }) => {
          this.form.setValue({
            title: article.title,
            description: article.description,
            body: article.body,
          });
          this.tagList.set(article.tagList);
        });
      }
    });
  }

  addTag(): void {
    const tag = this.tagInput().trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string): void {
    this.tagList.update((tags) => tags.filter((t) => t !== tag));
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.errors.set(null);
    this.isSubmitting.set(true);

    const payload = { ...this.form.getRawValue(), tagList: this.tagList() };
    const slug = this.slug();
    const request = slug
      ? this.articlesService.update(slug, payload)
      : this.articlesService.create(payload);

    request.subscribe({
      next: ({ article }) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/article', article.slug]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(error.error?.errors ?? { '': ['Unable to save article'] });
      },
    });
  }
}
