import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';

import { Article, ArticleListConfig } from '../../core/models/article.model';
import { ArticlesService } from '../../core/services/articles.service';
import { AuthService } from '../../core/services/auth.service';
import { TagsService } from '../../core/services/tags.service';
import { ArticleList } from '../../shared/components/article-list/article-list';
import { TagListSelect } from '../../shared/components/tag-list-select/tag-list-select';

type FeedType = 'your' | 'global' | 'tag';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-home',
  imports: [ArticleList, TagListSelect],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly articlesService = inject(ArticlesService);
  private readonly tagsService = inject(TagsService);
  protected readonly authService = inject(AuthService);

  protected readonly feedType = signal<FeedType>('global');
  protected readonly selectedTag = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly articles = signal<Article[]>([]);
  protected readonly articlesCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly tags = signal<string[]>([]);

  constructor() {
    this.tagsService.getAll().subscribe((tags) => this.tags.set(tags));

    effect(() => {
      const config = this.buildConfig(this.feedType(), this.selectedTag(), this.currentPage());
      this.loadArticles(config);
    });
  }

  private buildConfig(feedType: FeedType, tag: string | null, page: number): ArticleListConfig {
    return {
      type: feedType === 'your' ? 'feed' : 'all',
      filters: {
        tag: feedType === 'tag' ? (tag ?? undefined) : undefined,
        limit: this.pageSize,
        offset: (page - 1) * this.pageSize,
      },
    };
  }

  private loadArticles(config: ArticleListConfig): void {
    this.isLoading.set(true);
    this.articlesService.query(config).subscribe({
      next: ({ articles, articlesCount }) => {
        this.articles.set(articles);
        this.articlesCount.set(articlesCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectGlobalFeed(): void {
    this.feedType.set('global');
    this.currentPage.set(1);
  }

  selectYourFeed(): void {
    this.feedType.set('your');
    this.currentPage.set(1);
  }

  selectTag(tag: string): void {
    this.feedType.set('tag');
    this.selectedTag.set(tag);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onArticleUpdated(updated: Article): void {
    this.articles.update((articles) =>
      articles.map((article) => (article.slug === updated.slug ? updated : article)),
    );
  }
}
