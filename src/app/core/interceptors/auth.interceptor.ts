import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_URL } from '../api.config';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiUrl = inject(API_URL);

  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  const token = authService.getToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Token ${token}` },
    }),
  );
};
