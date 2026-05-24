import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'form',
    loadComponent: () => import('./form/form.page').then(m => m.FormPage),
  },
  {
    path: 'scan',
    loadComponent: () => import('./scan/scan.page').then(m => m.ScanPage),
  },
];
