import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth.interceptor';
import { routes } from './app.routes';


import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura'

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme:{
        preset: Aura      
      },
      license: 'eyJpZCI6ImQ0NTJhZWFlLWVjODItNGVlYy1hYzhhLTMxNmFmYmU5NTAxZSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTExMzk4NTYsImV4cCI6MTgyMjY3NTg1Nn0.FlEGw_pZ1uEFbZq7TSflZTXQPnr__775rQgCdAecQk8GDacYTYbN6S0-qcvsbwZZ6F3_KPEENi0kiQG6m6_6AQ'
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}; 
