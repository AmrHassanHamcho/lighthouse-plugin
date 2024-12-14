// lighthouse-audit.component.ts
import { Component } from '@angular/core';
import { LighthouseService } from '../../services/lighthouse.service';
import { PerformanceMetrics } from '../../models/performance-metrics.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lighthouse-audit',
  templateUrl: './lighthouse-audit.component.html',
  imports:[CommonModule],
  styleUrls: ['./lighthouse-audit.component.scss']
})
export class LighthouseAuditComponent {
  metrics: PerformanceMetrics | null = null;

  constructor(private lighthouseService: LighthouseService) {}

  runAudit(url: string): void {
    this.lighthouseService.getPerformanceMetrics(url).subscribe({
      next: (data) => this.metrics = data,
      error: (error) => console.error('Failed to load performance metrics', error)
    });
  }
}
