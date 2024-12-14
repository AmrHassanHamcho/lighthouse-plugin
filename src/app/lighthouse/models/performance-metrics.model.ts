// performance-metrics.model.ts

export interface PerformanceMetrics {
    firstContentfulPaint: number;
    speedIndex: number;
    largestContentfulPaint: number;
    interactive: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
  }
  