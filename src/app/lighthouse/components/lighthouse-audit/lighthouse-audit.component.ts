import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LighthouseService } from '../../services/lighthouse.service';
import { GoalService } from '../../services/goal.service';

@Component({
  selector: 'app-lighthouse-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lighthouse-audit.component.html',
  styleUrls: ['./lighthouse-audit.component.scss']
})
export class LighthouseAuditComponent {
  // Audit metrics container
  metrics: any = {
    performance: {},
    sustainability: {
      resourceBreakdown: [],
    },
  };
  loading: boolean = false;

  // URL and goal properties
  auditUrl: string = 'https://apw.bss.design/';
  goal: number | null = null;
  goalMessage: string = '';
  savedGoal: any = null;

  constructor(
    private lighthouseService: LighthouseService,
    private goalService: GoalService
  ) {}

  // Trigger Lighthouse audit and update metrics
  runAudit(url: string): void {
    this.loading = true;
    this.lighthouseService.getPerformanceMetrics(url).subscribe({
      next: (data) => {
        console.log(data);
        const audits = data.audits;

        // Set performance metrics
        this.metrics.performance = {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 0,
          speedIndex: audits['speed-index']?.displayValue || 0,
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 0,
          interactive: audits['interactive']?.displayValue || 0,
          totalBlockingTime: audits['total-blocking-time']?.displayValue || 0,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 0,
        };

        // Set sustainability metrics based on resource breakdown audit
        const resourceItems = audits['resource-breakdown-audit']?.details.items || [];
        const totalCO2 = resourceItems.reduce(
          (sum: number, item: any) => sum + (item.size * 0.02),
          0
        );

        this.metrics.sustainability = {
          totalCO2: totalCO2,
          co2Emissions: audits['co2-estimation-audit']?.details.items[0]?.value || 0,
          resourceBreakdown: resourceItems.map((item: any) => {
            const co2 = item.size * 0.02;
            const contribution = ((co2 / totalCO2) * 100).toFixed(2);
            return {
              resourceType: item.resourceType,
              size: item.size,
              co2: co2.toFixed(2),
              contribution,
            };
          }),
        };

        this.loading = false;
        // Retrieve any saved goal for this URL after updating metrics
        this.getGoal();
      },
      error: (error) => {
        console.error('Failed to load metrics', error);
        this.loading = false;
      },
    });
  }

  // Apply a suggested goal based on a 10% reduction from current total CO₂ emissions
  applySuggestedGoal(): void {
    const currentCO2 = this.metrics.sustainability?.totalCO2;
    if (currentCO2) {
      this.goal = +(currentCO2 * 0.9).toFixed(2);
      this.goalMessage = 'Suggested goal applied. You can adjust it if needed.';
    }
  }

  // Save the sustainability goal using the GoalService
  saveGoal(): void {
    if (!this.auditUrl || this.goal === null) {
      this.goalMessage = 'Please provide a valid URL and goal.';
      return;
    }
    this.goalService.saveGoal(this.auditUrl, { sustainabilityGoal: this.goal }).subscribe({
      next: (data) => {
        this.goalMessage = 'Goal saved successfully.';
        this.savedGoal = data.goal;
      },
      error: (error) => {
        console.error('Failed to save goal', error);
        this.goalMessage = 'Failed to save goal.';
      },
    });
  }

  // Retrieve the saved goal for the current audit URL
  getGoal(): void {
    if (!this.auditUrl) {
      return;
    }
    this.goalService.getGoal(this.auditUrl).subscribe({
      next: (data) => {
        this.savedGoal = data;
      },
      error: (error) => {
        console.error('Error retrieving saved goal', error);
        this.savedGoal = null;
      },
    });
  }
}
