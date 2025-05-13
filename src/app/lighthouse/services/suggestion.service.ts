// src/app/services/suggestion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SuggestionResponse {
  suggestedGoal: number | null;     // in grams, if history exists
  fallbackReduction: number | null; // e.g. 0.10 if no history
}

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private suggestUrl = 'http://localhost:3000/api/goals/suggest';

  constructor(private http: HttpClient) {}

  getSuggestion(url: string): Observable<SuggestionResponse> {
    const params = new HttpParams().set('url', url);    // <— remove encodeURIComponent
    return this.http
      .get<SuggestionResponse>(this.suggestUrl, { params })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          // if the route itself 404s (shouldn’t), or you want to default
          if (err.status === 404) {
            return of({ suggestedGoal: null, fallbackReduction: 0.10 });
          }
          return throwError(() => err);
        })
      );
  }
}
