import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { combineLatest } from 'rxjs';

import { Article, ArticleListConfig } from '../../core/models/article.model';
import { Profile } from '../../core/models/profile.model';
import { ArticlesService } from '../../core/services/articles.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfilesService } from '../../core/services/profiles.service';
import { ArticleList } from '../../shared/components/article-list/article-list';
import { Icon } from '../../shared/components/icon/icon';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, RouterLinkActive, ArticleList, Icon],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly articlesService = inject(ArticlesService);
  private readonly profilesService = inject(ProfilesService);
  protected readonly authService = inject(AuthService);

  protected readonly profile = signal<Profile | null>(null);
  protected readonly articles = signal<Article[]>([]);
  protected readonly articlesCount = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly isLoading = signal(false);
  protected readonly isFavoritesView = signal(false);
  protected readonly pageSize = PAGE_SIZE;

  constructor() {
    combineLatest([this.route.paramMap, this.route.data])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, data]) => {
        const username = params.get('username');
        if (!username) {
          return;
        }
        this.isFavoritesView.set(!!data['favoritesOnly']);
        this.currentPage.set(1);
        this.profilesService.get(username).subscribe(({ profile }) => this.profile.set(profile));
        this.loadArticles(username, this.isFavoritesView(), 1);
      });
  }

  private loadArticles(username: string, favoritesOnly: boolean, page: number): void {
    const config: ArticleListConfig = {
      type: 'all',
      filters: {
        author: favoritesOnly ? undefined : username,
        favorited: favoritesOnly ? username : undefined,
        limit: this.pageSize,
        offset: (page - 1) * this.pageSize,
      },
    };

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

  onPageChange(page: number): void {
    const username = this.profile()?.username;
    if (!username) {
      return;
    }
    this.currentPage.set(page);
    this.loadArticles(username, this.isFavoritesView(), page);
  }

  onArticleUpdated(updated: Article): void {
    this.articles.update((articles) =>
      articles.map((article) => (article.slug === updated.slug ? updated : article)),
    );
  }

  toggleFollow(): void {
    const profile = this.profile();
    if (!profile) {
      return;
    }
    const request = profile.following
      ? this.profilesService.unfollow(profile.username)
      : this.profilesService.follow(profile.username);
    request.subscribe(({ profile: updated }) => this.profile.set(updated));
  }
}
