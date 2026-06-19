import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirestoreService, Medicion } from '../services/firestore.service';
import { ExportService } from '../services/export.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.mobile-open]="isOpen">
      <div class="logo-container">
        <img src="assets/icon.jpg" alt="Eco-Dev Logo" class="logo">
      </div>
      <nav class="nav-menu">
        <a routerLink="/dashboard/general" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="label">General</span>
        </a>
        <a routerLink="/dashboard/history" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="12 8 12 12 14 14"></polyline>
            <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
          </svg>
          <span class="label">Historial</span>
        </a>
        <a routerLink="/dashboard/heatmap" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c1.88 0 3.39 1.19 4.32 2.83.85.3 1.68.73 2.48 1.28a9.91 9.91 0 0 1 2.2 2.2c.55.8.98 1.63 1.28 2.48C22.81 11.61 24 13.12 24 15c0 4.97-4.03 9-9 9s-9-4.03-9-9c0-1.88 1.19-3.39 2.83-4.32.3-.85.73-1.68 1.28-2.48a9.91 9.91 0 0 1 2.2-2.2c.8-.55 1.63-.98 2.48-1.28C10.61 3.19 9.12 2 12 2z"></path>
            <path d="M12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
          </svg>
          <span class="label">Mapa de Calor</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <button class="cta-button" (click)="downloadFullReport()">Descargar Reporte</button>
        <button class="logout-link" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
    <div class="sidebar-overlay" *ngIf="isOpen" (click)="closeSidebar()"></div>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private exportService = inject(ExportService);
  private router = inject(Router);

  onItemClick() {
    if (window.innerWidth <= 1024) {
      this.closeSidebar();
    }
  }

  closeSidebar() {
    this.close.emit();
  }

  logout() {
    this.authService.logout();
    this.closeSidebar();
    this.router.navigate(['/']);
  }

  downloadFullReport() {
    this.onItemClick();
    
    // Obtener datos actuales para el reporte desde las señales del servicio global
    const mediciones = this.firestoreService.medicionesGeneral();
    const stations = this.firestoreService.stations;

    let htmlContent = `
      <h1 style="color: #0d9488; text-align: center;">REPORTE DE CALIDAD DEL AIRE - DEVECO FERIA</h1>
      <p style="text-align: center;"><i>Fecha de generación: ${new Date().toLocaleString()}</i></p>
      <hr>
      <h2>1. Resumen Ejecutivo</h2>
      <p>El presente documento detalla el estado actual de la red de microestaciones de monitoreo ambiental desplegadas en puntos estratégicos. Los sensores analizan parámetros críticos para la salud pública y el medio ambiente.</p>
      
      <h2>2. Estado por Estación</h2>
    `;

    stations.forEach(s => {
      const latest = mediciones.find(m => m.estacion_id === s.id);
      htmlContent += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc;">
          <h3 style="color: #2563eb;">${s.nombre}</h3>
          ${latest ? `
            <ul>
              <li><b>Estado General:</b> ${latest.estado_calidad_aire}</li>
              <li><b>Dióxido de Carbono:</b> ${latest.co2} ppm</li>
              <li><b>Partículas PM2.5:</b> ${latest.particulas ?? '---'} mg/m³</li>
              <li><b>Humedad:</b> ${latest.humedad}%</li>
              <li><b>Temperatura:</b> ${latest.temperatura}°C</li>
              <li><b>Presencia de Humo:</b> ${latest.humo ?? '---'} u</li>
            </ul>
          ` : '<p><i>No se registran datos recientes para esta estación.</i></p>'}
        </div>
      `;
    });

    htmlContent += `
      <h2>3. Conclusiones y Recomendaciones</h2>
      <p>Basado en los niveles de CO2 y Partículas PM2.5 detectados, se recomienda ${this.getRecommendation(mediciones)}.</p>
      <br>
      <p style="font-size: 0.8rem; color: #666;">Sistema DevEco Feria - Monitoreo en Tiempo Real</p>
    `;

    this.exportService.exportToWord(htmlContent, 'Reporte_Ambiental_Completo');
  }

  private getRecommendation(mediciones: Medicion[]): string {
    const avgCO2 = mediciones.length > 0 
      ? mediciones.reduce((acc, m) => acc + (m.co2 || 0), 0) / mediciones.length 
      : 0;
    
    if (avgCO2 > 800) return 'incrementar la ventilación en áreas cerradas y monitorear focos de emisión.';
    if (avgCO2 > 600) return 'mantener el monitoreo preventivo y asegurar circulación de aire.';
    return 'continuar con las actividades normales dado que los niveles son óptimos.';
  }
}
