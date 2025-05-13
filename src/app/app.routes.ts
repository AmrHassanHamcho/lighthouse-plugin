// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lighthouse' },
  {
    path: 'lighthouse',
    loadComponent: () =>
      import('./lighthouse/components/lighthouse-audit/lighthouse-audit.component')
        .then(m => m.LighthouseAuditComponent)
  },
  // ...etc.
];
