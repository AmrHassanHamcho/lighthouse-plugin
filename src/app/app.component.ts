// app.component.ts
import { Component } from '@angular/core';
import { LighthouseAuditComponent } from './lighthouse/components/lighthouse-audit/lighthouse-audit.component';

@Component({
  selector: 'app-root',
  template: `<app-lighthouse-audit></app-lighthouse-audit>`,
  standalone: true,
  imports: [LighthouseAuditComponent],
})
export class AppComponent {}
