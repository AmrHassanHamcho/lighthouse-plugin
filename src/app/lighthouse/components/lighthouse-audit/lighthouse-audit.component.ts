// // component.ts
// import { Component } from '@angular/core';
// import { LighthouseService } from '../../services/lighthouse.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-lighthouse-audit',
//   templateUrl: './lighthouse-audit.component.html',
//   imports: [CommonModule],
//   styleUrls: ['./lighthouse-audit.component.scss']
// })
// export class LighthouseAuditComponent {
//   metrics: any = null;
//   loading: boolean = false; // Added loading indicator

//   constructor(private lighthouseService: LighthouseService) {}

//   runAudit(url: string): void {
//     this.loading = true; // Start loading
//     this.lighthouseService.getPerformanceMetrics(url).subscribe({
//       next: (data) => {
//         console.log(data)
//         const audits = data.audits;
//         this.metrics = {
//           firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 0,
//           speedIndex: audits['speed-index']?.displayValue || 0,
//           largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 0,
//           interactive: audits['interactive']?.displayValue || 0,
//           totalBlockingTime: audits['total-blocking-time']?.displayValue || 0,
//           cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 0,
//         };
//         this.loading = false; // Stop loading on success
//       },
//       error: (error) => {
//         console.error('Failed to load performance metrics', error);
//         this.loading = false; // Stop loading on error
//       }
//     });
//   }
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
  metrics: any = {
    performance: {},
    sustainability: {
      resourceBreakdown: [], // Initialize as an empty array
    },
  };
  loading: boolean = false;

  constructor(private lighthouseService: LighthouseService) {}

  runAudit(url: string): void {
    this.loading = true;

    this.lighthouseService.getPerformanceMetrics(url).subscribe({
      next: (data) => {
        console.log(data);
        const audits = data.audits;

        // Performance Metrics
        this.metrics.performance = {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 0,
          speedIndex: audits['speed-index']?.displayValue || 0,
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 0,
          interactive: audits['interactive']?.displayValue || 0,
          totalBlockingTime: audits['total-blocking-time']?.displayValue || 0,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 0,
        };

        // Sustainability Metrics
        const resourceItems = audits['resource-breakdown-audit']?.details.items || [];
        const totalCO2 = resourceItems.reduce((sum: number, item: any) => sum + (item.size * 0.02), 0); // Calculate total CO₂

        this.metrics.sustainability = {
          co2Emissions: audits['co2-estimation-audit']?.details.items[0]?.value || 0,
          resourceBreakdown: resourceItems.map((item: any) => {
            const co2 = item.size * 0.02; // CO₂ emissions for this resource
            const contribution = ((co2 / totalCO2) * 100).toFixed(2); // Percentage contribution
            return {
              resourceType: item.resourceType,
              size: item.size, // Total size in MB
              co2: co2.toFixed(2),
              contribution, // Contribution percentage
            };
          }),
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load metrics', error);
        this.loading = false;
      }
    });
  }
}
