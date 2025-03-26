import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'trips',
    loadComponent: () => import('./features/trips/trips.component').then(m => m.TripsComponent)
  },
  {
    path: 'itinerary',
    loadComponent: () => import('./features/itinerary/itinerary.component').then(m => m.ItineraryComponent)
  },
  {
    path: 'currency',
    loadComponent: () => import('./features/currency/currency.component').then(m => m.CurrencyComponent)
  },
  // {
  //   path: 'food',
  //   loadComponent: () => import('./features/food/food.component').then(m => m.FoodComponent)
  // },
  // {
  //   path: 'transport',
  //   loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent)
  // },
  {
    path: 'checklist',
    loadComponent: () => import('./features/checklist/checklist.component').then(m => m.ChecklistComponent)
  },
  // {
  //   path: 'settings',
  //   loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  // },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
