// // main.ts
// import { enableProdMode } from '@angular/core';
// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { environment } from './app/lighthouse/environments/environment';
// import { provideHttpClient } from "@angular/common/http";

// if (environment.production) {
//   enableProdMode();
// }

// bootstrapApplication(AppComponent, {
//   providers: [provideHttpClient()],
// }).catch((err) => console.error(err));
// src/main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication }        from '@angular/platform-browser';
import { provideRouter, RouterModule, withHashLocation }               from '@angular/router';
import { AppComponent }                from './app/app.component';
import { appRoutes }                   from './app/app.routes';
import { environment } from './app/lighthouse/environments/environment';
import { provideHttpClient, withFetch } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      appRoutes,
      withHashLocation()                // ← enable hash-based routing
    ),
    provideHttpClient( withFetch()),
    // importProvidersFrom(
    //   RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' })
    // ),
    // any other providers…
  ]
})
.catch(err => console.error(err));
