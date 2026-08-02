import { HttpErrorResponse } from '@angular/common/http';

/**
 * The RealWorld API returns validation failures as `{ errors: { field: string[] } }`.
 * A `status: 0` HttpErrorResponse means the request never got a response at all
 * (CORS rejection, DNS/connection failure, offline) — Angular can't tell those
 * apart, so `error.error` in that case is a raw ProgressEvent, not API JSON.
 * Surfacing that distinction in the UI saves a trip to devtools to tell "the
 * server rejected this" apart from "the request never reached the server".
 */
export function extractApiErrors(
  error: HttpErrorResponse,
  fallbackMessage: string,
): Record<string, string[]> {
  if (error.status === 0) {
    return {
      '': [
        'Could not reach the API (network/CORS error). Check your connection, or that the API server is reachable from this origin.',
      ],
    };
  }

  if (error.error && typeof error.error === 'object' && error.error.errors) {
    return error.error.errors;
  }

  return { '': [fallbackMessage] };
}
