import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { catchError, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      if (!authService.isAuthenticated()) {
        return of(null);
      }
      return authService.fetchCurrentUser().pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            authService.logout();
          }
          return of(null);
        }),
      );
    }),
  ],
};
