import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  // Updated the base URL to point to the Express backend on port 3000
  private baseUrl = 'http://localhost:3000/api/goals';

  constructor(private http: HttpClient) {}

  getGoal(url: string): Observable<any> {
    return this.http.get(`${this.baseUrl}?url=${encodeURIComponent(url)}`);
  }

  saveGoal(url: string, goal: any): Observable<any> {
    return this.http.post(this.baseUrl, { url, ...goal });
  }
}
