import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api.config';
import {
  ArticleListConfig,
  ArticleResponse,
  CreateArticle,
  MultipleArticlesResponse,
  UpdateArticle,
} from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  query(config: ArticleListConfig): Observable<MultipleArticlesResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(config.filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    }

    const endpoint = config.type === 'feed' ? '/articles/feed' : '/articles';
    return this.http.get<MultipleArticlesResponse>(`${this.apiUrl}${endpoint}`, { params });
  }

  get(slug: string): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/articles/${slug}`);
  }

  create(article: CreateArticle): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(`${this.apiUrl}/articles`, { article });
  }

  update(slug: string, article: UpdateArticle): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`${this.apiUrl}/articles/${slug}`, { article });
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${slug}`);
  }

  favorite(slug: string): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(`${this.apiUrl}/articles/${slug}/favorite`, {});
  }

  unfavorite(slug: string): Observable<ArticleResponse> {
    return this.http.delete<ArticleResponse>(`${this.apiUrl}/articles/${slug}/favorite`);
  }
}
