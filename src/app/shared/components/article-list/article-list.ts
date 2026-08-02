import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Article } from '../../../core/models/article.model';
import { ArticlePreview } from '../article-preview/article-preview';

@Component({
  selector: 'app-article-list',
  imports: [ArticlePreview],
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleList {
  readonly articles = input.required<Article[]>();
  readonly articlesCount = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly isLoading = input<boolean>(false);

  readonly pageChange = output<number>();
  readonly articleUpdated = output<Article>();

  readonly totalPages = computed(() =>
    Array.from({ length: Math.ceil(this.articlesCount() / this.pageSize()) }, (_, i) => i + 1),
  );

  setPage(page: number): void {
    this.pageChange.emit(page);
  }
}
