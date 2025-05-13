// src/app/services/goal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SavedGoal {
  url: string;
  sustainabilityGoal: number;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private baseUrl = 'http://localhost:3000/api/goals';

  constructor(private http: HttpClient) {}

  getGoal(url: string): Observable<SavedGoal | null> {
    const params = new HttpParams().set('url', url);
    return this.http
      .get<SavedGoal>(this.baseUrl, { params })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            // no saved goal → return null
            return of(null);
          }
          return throwError(() => err);
        })
      );
  }

  saveGoal(url: string, goal: { sustainabilityGoal: number }): Observable<{ goal: SavedGoal }> {
    return this.http.post<{ goal: SavedGoal }>(this.baseUrl, { url, ...goal });
  }
}
