import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LighthouseService } from '../../services/lighthouse.service';
import { GoalService } from '../../services/goal.service';
import { SuggestionService } from '../../services/suggestion.service';

@Component({
  selector: 'app-lighthouse-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lighthouse-audit.component.html',
  styleUrls: ['./lighthouse-audit.component.scss']
})
export class LighthouseAuditComponent {
  metrics: any = {
    performance: {},
    sustainability: {
      resourceBreakdown: [] as Array<{
        resourceType: string;
        sizeMB: number;
        co2: number;
        contribution: number;
      }>,
      totalCO2: 0
    },
  };
  loading = false;

  // History-based suggestion:
  suggestedGoalG: number | null = null;   // grams
  suggestedGoalMg: number | null = null;  // milligrams
  fallbackText = '';

  auditUrl = 'https://apw.bss.design/';
  goal: number | null = null;
  goalMessage = '';
  savedGoal: any = null;

  constructor(
    private lighthouseService: LighthouseService,
    private suggestionService: SuggestionService,
    private goalService: GoalService
  ) {}

  runAudit(url: string): void {
    this.loading = true;

    // 1️⃣ run Lighthouse
    this.lighthouseService.getPerformanceMetrics(url).subscribe({
      next: data => {
        const audits = data.audits;

        // performance (unchanged)
        this.metrics.performance = {
          firstContentfulPaint:    audits['first-contentful-paint']?.displayValue || 0,
          speedIndex:             audits['speed-index']?.displayValue           || 0,
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 0,
          interactive:            audits['interactive']?.displayValue           || 0,
          totalBlockingTime:      audits['total-blocking-time']?.displayValue   || 0,
          cumulativeLayoutShift:  audits['cumulative-layout-shift']?.displayValue || 0,
        };

        // sustainability
        const resourceItems = audits['resource-breakdown-audit']?.details.items || [];
        const co2Items      = audits['co2-estimation-audit']?.details.items      || [];

        // total CO₂
        const totalCO2 = co2Items.reduce(
          (sum: number, it: any) => sum + parseFloat(it.co2 ?? it.value ?? '0'),
          0
        );

        // breakdown
        const breakdown = resourceItems.map((item: any) => {
          const sizeMB = item.size || 0;
          // convert bytes → megabytes
          const co2Entry = co2Items.find((c: any) => c.resourceType === item.resourceType);
          const itemCo2 = co2Entry ? parseFloat(co2Entry.co2 ?? co2Entry.value) : 0;
          const contribution = totalCO2 > 0 ? (itemCo2 / totalCO2) * 100 : 0;

          return {
            resourceType:  item.resourceType,
            sizeMB:      +sizeMB.toFixed(2),
            co2:           +itemCo2.toFixed(4),
            contribution:  +contribution.toFixed(2),
          };
        });

        this.metrics.sustainability = {
          totalCO2: +totalCO2.toFixed(4),
          resourceBreakdown: breakdown
        };

        // 2️⃣ fetch history-based suggestion
        this.suggestionService.getSuggestion(url).subscribe({
          next: (resp: any) => {
            if (resp.suggestedGoal != null) {
              this.suggestedGoalG  = +resp.suggestedGoal.toFixed(4);
              this.suggestedGoalMg = +(resp.suggestedGoal * 1000).toFixed(2);
            } else {
              // fallback % if no history
              const p = resp.fallbackReduction ?? 0.1;
              this.fallbackText   = `No history—using ${Math.round(p*100)}% reduction`;
              this.suggestedGoalG  = +(totalCO2 * (1 - p)).toFixed(4);
              this.suggestedGoalMg = +(this.suggestedGoalG * 1000).toFixed(2);
            }

            // load any previously saved goal
            this.getGoal();
            this.loading = false;
          },
          error: e => {
            console.error('Could not retrieve suggested goal', e);
            this.loading = false;
          }
        });
      },
      error: err => {
        console.error('Failed to load metrics', err);
        this.loading = false;
      }
    });
  }

  applySuggestedGoalFromServer() {
    if (this.suggestedGoalG != null) {
      this.goal = this.suggestedGoalG;
      this.goalMessage = 'Applied server-suggested goal';
    }
  }

  saveGoal() {
    if (!this.auditUrl || this.goal == null) {
      this.goalMessage = 'Please enter a goal after running an audit.';
      return;
    }
    this.goalService.saveGoal(this.auditUrl, { sustainabilityGoal: this.goal }).subscribe({
      next: data => {
        this.goalMessage = 'Goal saved successfully.';
        this.savedGoal = data.goal;
      },
      error: err => {
        console.error('Failed to save goal', err);
        this.goalMessage = 'Failed to save goal.';
      }
    });
  }

  getGoal(): void {
    if (!this.auditUrl) return;
    this.goalService.getGoal(this.auditUrl).subscribe({
      next: saved => {
        this.savedGoal = saved;            // savedGoal will be null if none exists
      },
      error: err => {
        console.error('Unexpected error retrieving saved goal', err);
      }
    });
  }
}
