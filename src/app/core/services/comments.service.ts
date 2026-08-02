import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api.config';
import { CommentResponse, MultipleCommentsResponse } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(slug: string): Observable<MultipleCommentsResponse> {
    return this.http.get<MultipleCommentsResponse>(`${this.apiUrl}/articles/${slug}/comments`);
  }

  add(slug: string, body: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.apiUrl}/articles/${slug}/comments`, {
      comment: { body },
    });
  }

  delete(slug: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${slug}/comments/${id}`);
  }
}
