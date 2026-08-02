import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL } from '../api.config';

interface TagsResponse {
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<string[]> {
    return this.http.get<TagsResponse>(`${this.apiUrl}/tags`).pipe(map((res) => res.tags));
  }
}
