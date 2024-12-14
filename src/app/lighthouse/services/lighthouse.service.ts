// lighthouse.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceMetrics } from '../models/performance-metrics.model';

@Injectable({
  providedIn: 'root'
})
export class LighthouseService {
  constructor(private http: HttpClient) {}

  getPerformanceMetrics(url: string): Observable<PerformanceMetrics> {
    return this.http.post<PerformanceMetrics>('http://localhost:3000/api/lighthouse/run', { url });
  }
}
