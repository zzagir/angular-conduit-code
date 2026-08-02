import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api.config';
import { ProfileResponse } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profiles/${username}`);
  }

  follow(username: string): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(`${this.apiUrl}/profiles/${username}/follow`, {});
  }

  unfollow(username: string): Observable<ProfileResponse> {
    return this.http.delete<ProfileResponse>(`${this.apiUrl}/profiles/${username}/follow`);
  }
}
