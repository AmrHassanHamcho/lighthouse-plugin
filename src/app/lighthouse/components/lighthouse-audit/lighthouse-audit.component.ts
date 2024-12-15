// component.ts
import { Component } from '@angular/core';
import { LighthouseService } from '../../services/lighthouse.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lighthouse-audit',
  templateUrl: './lighthouse-audit.component.html',
  imports: [CommonModule],
  styleUrls: ['./lighthouse-audit.component.scss']
})
export class LighthouseAuditComponent {
  metrics: any = null;
  loading: boolean = false; // Added loading indicator

  constructor(private lighthouseService: LighthouseService) {}

  runAudit(url: string): void {
    this.loading = true; // Start loading
    this.lighthouseService.getPerformanceMetrics(url).subscribe({
      next: (data) => {
        const audits = data.lighthouseResult.audits;
        this.metrics = {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 0,
          speedIndex: audits['speed-index']?.displayValue || 0,
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 0,
          interactive: audits['interactive']?.displayValue || 0,
          totalBlockingTime: audits['total-blocking-time']?.displayValue || 0,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 0,
        };
        this.loading = false; // Stop loading on success
      },
      error: (error) => {
        console.error('Failed to load performance metrics', error);
        this.loading = false; // Stop loading on error
      }
    });
  }
}
