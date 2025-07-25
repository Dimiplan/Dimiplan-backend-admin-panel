import type { Routes } from '@angular/router';
import { ApiDocsComponent } from './components/api-docs/api-docs.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DatabaseComponent } from './components/database/database.component';
import { LogsComponent } from './components/logs/logs.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'logs', component: LogsComponent },
  { path: 'database', component: DatabaseComponent },
  { path: 'api-docs', component: ApiDocsComponent },
  { path: '**', redirectTo: '/dashboard' },
];
