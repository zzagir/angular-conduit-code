import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ArticlesService } from '../../../core/services/articles.service';
import { AuthService } from '../../../core/services/auth.service';
import { Article } from '../../../core/models/article.model';
import { TagList } from '../tag-list/tag-list';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-article-preview',
  imports: [RouterLink, DatePipe, TagList, Icon],
  templateUrl: './article-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePreview {
  private readonly articlesService = inject(ArticlesService);
  protected readonly authService = inject(AuthService);

  readonly article = input.required<Article>();
  readonly toggleFavorite = output<Article>();

  onToggleFavorite(article: Article): void {
    const request = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);

    request.subscribe(({ article: updated }) => this.toggleFavorite.emit(updated));
  }
}
