import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { GeneralPanelComponent } from './pages/dashboard/general-panel.component';
import { HistoryReportComponent } from './pages/dashboard/history-report.component';
import { HeatmapComponent } from './pages/dashboard/heatmap.component';
import { LoginComponent } from './pages/auth/login.component';
import { UserSettingsComponent } from './pages/user/settings.component';
import { HistoryComponent } from './pages/history/history.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'equipo', component: AboutComponent },
  { path: 'historia', component: HistoryComponent },
  { path: 'auth/login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', component: GeneralPanelComponent },
      { path: 'history', component: HistoryReportComponent },
      { path: 'heatmap', component: HeatmapComponent }
    ]
  },
  { path: 'ajustes', component: UserSettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
