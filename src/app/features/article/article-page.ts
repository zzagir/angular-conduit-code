import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Article } from '../../core/models/article.model';
import { Comment } from '../../core/models/comment.model';
import { ArticlesService } from '../../core/services/articles.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentsService } from '../../core/services/comments.service';
import { ProfilesService } from '../../core/services/profiles.service';
import { TagList } from '../../shared/components/tag-list/tag-list';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { CommentForm } from './comment-form/comment-form';
import { CommentList } from './comment-list/comment-list';

@Component({
  selector: 'app-article-page',
  imports: [RouterLink, DatePipe, TagList, CommentForm, CommentList, MarkdownPipe],
  templateUrl: './article-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articlesService = inject(ArticlesService);
  private readonly profilesService = inject(ProfilesService);
  private readonly commentsService = inject(CommentsService);
  protected readonly authService = inject(AuthService);

  protected readonly article = signal<Article | null>(null);
  protected readonly comments = signal<Comment[]>([]);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        return;
      }
      this.articlesService.get(slug).subscribe(({ article }) => this.article.set(article));
      this.commentsService.getAll(slug).subscribe(({ comments }) => this.comments.set(comments));
    });
  }

  toggleFavorite(): void {
    const article = this.article();
    if (!article) {
      return;
    }
    const request = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);
    request.subscribe(({ article: updated }) => this.article.set(updated));
  }

  toggleFollow(): void {
    const article = this.article();
    if (!article) {
      return;
    }
    const request = article.author.following
      ? this.profilesService.unfollow(article.author.username)
      : this.profilesService.follow(article.author.username);
    request.subscribe(({ profile }) =>
      this.article.update((current) => (current ? { ...current, author: profile } : current)),
    );
  }

  deleteArticle(): void {
    const article = this.article();
    if (!article) {
      return;
    }
    this.articlesService.delete(article.slug).subscribe(() => this.router.navigateByUrl('/'));
  }

  addComment(body: string): void {
    const article = this.article();
    if (!article) {
      return;
    }
    this.commentsService.add(article.slug, body).subscribe(({ comment }) => {
      this.comments.update((comments) => [comment, ...comments]);
    });
  }

  deleteComment(id: number): void {
    const article = this.article();
    if (!article) {
      return;
    }
    this.commentsService.delete(article.slug, id).subscribe(() => {
      this.comments.update((comments) => comments.filter((comment) => comment.id !== id));
    });
  }
}
