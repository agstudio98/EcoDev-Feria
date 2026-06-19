import { Component, inject, OnInit, signal, OnDestroy, ViewChild, ElementRef, effect, AfterViewInit, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { FirestoreService, Medicion } from '../../services/firestore.service';
import { Router } from '@angular/router';

/**
 * Configuración para la visualización de métricas individuales.
 */
interface MetricDisplayConfig {
  /** Clave de la propiedad en el objeto Medicion */
  key: string;
  /** Etiqueta descriptiva para el usuario */
  label: string;
  /** Unidad de medida (ej: ppm, °C) */
  unit: string;
  /** SVG o clase de icono */
  icon: string;
  /** Valor límite para alertas */
  threshold?: number;
  /** Tipo de umbral: si es alerta por valor alto o bajo */
  thresholdType?: 'high' | 'low';
}

/**
 * Componente principal del Panel General (Dashboard).
 * Proporciona una vista en tiempo real de la telemetría ambiental,
 * incluyendo gráficos dinámicos y estados de alerta por estación.
 */
@Component({
  selector: 'app-general-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-view animate-fade-in">
      <header class="view-header">
        <div class="header-main">
          <div class="header-text">
            <span class="view-subtitle">Red de Microestaciones Inteligentes</span>
            <h2>Monitorización de Calidad del Aire</h2>
          </div>
          <div class="header-actions">
            <div class="live-indicator">
              <span class="dot pulse"></span>
              EN VIVO
            </div>
            <button class="logout-btn-panel" (click)="logout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Salir</span>
            </button>
          </div>
        </div>
        <p>Sistema dinámico de telemetría ambiental. Los datos se actualizan automáticamente al detectarse cambios en los sensores.</p>
      </header>

      <!-- Selector de Estaciones (Slider) -->
      <div class="station-slider-container">
        <button class="slide-btn prev" (click)="prevStation()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <div class="station-track">
          <div *ngFor="let s of stations" 
               class="station-chip" 
               [class.active]="selectedStationId() === s.id"
               (click)="selectStation(s.id)">
            <span class="chip-dot"></span>
            {{ s.nombre }}
          </div>
        </div>

        <button class="slide-btn next" (click)="nextStation()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- Estado General (Resumen) -->
      @if (latestMedicion(); as data) {
        <div class="summary-card" [ngClass]="getAirQualityClass(data.estado_calidad_aire)">
          <div class="summary-icon">
            @if (getAirQualityClass(data.estado_calidad_aire) === 'positive') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            } @else if (getAirQualityClass(data.estado_calidad_aire) === 'neutral') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            }
          </div>
          <div class="summary-content">
            <span class="summary-label">Estado de la Estación: <strong>{{ getStationName(selectedStationId()) }}</strong></span>
            <h3>{{ data.estado_calidad_aire }}</h3>
          </div>
        </div>
      } @else {
        <div class="summary-card neutral">
          <div class="summary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="summary-content">
            <span class="summary-label">Estado de la Estación: <strong>{{ getStationName(selectedStationId()) }}</strong></span>
            <h3>SIN DATOS / CONECTANDO...</h3>
          </div>
        </div>
      }

      <!-- Resumen de todas las Estaciones -->
      @if (latestByStation().length > 1) {
        <div class="summary-grid-container">
          <div class="all-stations-summary animate-fade-in" style="animation-delay: 0.2s">
            <div class="card-header">
              <h3>Estado Actual por Estación</h3>
              <span class="badge">{{ latestByStation().length }} activas</span>
            </div>
            <div class="summary-table-wrapper">
              <table class="summary-table">
                <thead>
                  <tr>
                    <th>Estación</th>
                    <th>CO2</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of latestByStation()" 
                      [class.active-row]="s.estacion_id === selectedStationId()"
                      (click)="selectStation(s.estacion_id)">
                    <td><strong>{{ getStationName(s.estacion_id) }}</strong></td>
                    <td>{{ s.co2 ?? '---' }} <small>ppm</small></td>
                    <td>
                      <span class="status-dot" [class]="getAirQualityClass(s.estado_calidad_aire)"></span>
                      {{ s.estado_calidad_aire }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="recent-activity-card animate-fade-in" style="animation-delay: 0.3s">
            <div class="card-header">
              <h3>Actividad Reciente</h3>
              <span class="badge">Últimos 10</span>
            </div>
            <div class="activity-list">
              <div *ngFor="let m of recentActivity()" class="activity-item">
                <div class="activity-time">Lectura {{ getReadingNumber(m) }}</div>
                <div class="activity-desc">
                  <strong>{{ getStationName(m.estacion_id) }}</strong>: 
                  {{ m.co2 ?? '---' }} ppm | {{ m.temperatura ?? '---' }}°C
                </div>
                <div class="status-dot mini" [class]="getAirQualityClass(m.estado_calidad_aire)"></div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Métricas Dinámicas -->
      <div class="metrics-grid">
        <div *ngFor="let config of metricConfigs; let i = index" 
             class="metric-card" 
             [class.featured-card]="config.key === 'humo'"
             [style.animation-delay]="(i * 0.1) + 's'">
          <div class="metric-icon" [innerHTML]="sanitizeHtml(config.icon)"></div>
          <div class="metric-info">
            <span class="metric-label">{{ config.label }}</span>
            <span class="metric-value">
              {{ latestMedicion() ? latestMedicion()![config.key] : '---' }}
              <small>{{ config.unit }}</small>
            </span>
            <span class="metric-change" [ngClass]="getMetricStatusClass(config)">
              {{ getMetricStatusLabel(config) }}
            </span>
          </div>
          @if (config.key === 'humo' && latestMedicion()) {
            <div class="metric-detail-overlay">
              <span>Nivel detectado en tiempo real</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getHumoPercentage(latestMedicion()!.humo || 0)"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="main-grid">
        <!-- Gráfico de Gases y Partículas -->
        <div class="content-card animate-fade-in" style="animation-delay: 0.7s">
          <div class="card-header">
            <h3>Calidad del Aire</h3>
            <div class="sensor-tag">Historial de Estación</div>
          </div>
          <div class="chart-container">
            <canvas #gasesChart></canvas>
          </div>
        </div>

        <!-- Gráfico de Variables Ambientales -->
        <div class="content-card animate-fade-in" style="animation-delay: 0.8s">
          <div class="card-header">
            <h3>Variables Ambientales</h3>
            <div class="sensor-tag">Temp & Hum</div>
          </div>
          <div class="chart-container">
            <canvas #envChart></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; align-items: center; gap: 1.5rem; }
    .live-indicator { 
      display: flex; align-items: center; gap: 0.5rem; 
      font-size: 0.7rem; font-weight: 800; color: #ff4d4d;
      padding: 0.4rem 0.8rem; background: rgba(255, 77, 77, 0.1);
      border-radius: 4px; border: 1px solid rgba(255, 77, 77, 0.2);
    }

    /* Station Slider Styles */
    .station-slider-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
      padding: 0.5rem;
      background: rgba(100, 255, 218, 0.03);
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }
    .station-track {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      flex: 1;
      scrollbar-width: none;
      scroll-behavior: smooth;
      padding: 0.5rem 0.25rem;
      mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
    }
    .station-track::-webkit-scrollbar { display: none; }
    
    .station-chip {
      padding: 0.6rem 1.25rem;
      background: var(--color-panel-bg);
      border: 1px solid var(--border-color, rgba(100, 255, 218, 0.08));
      border-radius: 50px;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: var(--transition-smooth);
      flex-shrink: 0;
    }
    .station-chip:hover { border-color: var(--color-accent); color: var(--color-text); }
    .station-chip.active {
      background: rgba(100, 255, 218, 0.1);
      border-color: var(--color-accent);
      color: var(--color-accent);
      box-shadow: 0 0 15px rgba(100, 255, 218, 0.1);
    }
    .chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    
    .slide-btn {
      background: rgba(100, 255, 218, 0.05);
      border: 1px solid var(--color-border);
      color: var(--color-accent);
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .slide-btn:hover { background: var(--color-accent); color: var(--color-base); }
    .slide-btn svg { width: 18px; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-auto-flow: dense;
      gap: 1.5rem;
    }
    .metric-card {
      background: var(--color-panel-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .metric-card.featured-card {
      grid-row: span 2;
      border-color: var(--color-accent);
      background: linear-gradient(135deg, var(--color-panel-bg) 0%, rgba(100, 255, 218, 0.05) 100%);
      justify-content: center;
    }
    .metric-detail-overlay {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      margin-top: 0.5rem;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--color-accent);
      border-radius: 10px;
      transition: width 1s ease-in-out;
    }

    .summary-card {
      display: flex; align-items: center; gap: 2rem;
      padding: 2rem; border-radius: 12px; border: 1px solid var(--color-border);
      background: var(--color-panel-bg); backdrop-filter: blur(10px);
      transition: var(--transition-smooth);
    }
    .summary-card.positive { border-color: #28a745; box-shadow: 0 0 20px rgba(40, 167, 69, 0.1); background: rgba(40, 167, 69, 0.05); }
    .summary-card.neutral { border-color: #ffc107; box-shadow: 0 0 20px rgba(255, 193, 7, 0.1); background: rgba(255, 193, 7, 0.05); }
    .summary-card.error { border-color: #dc3545; box-shadow: 0 0 20px rgba(220, 53, 69, 0.1); background: rgba(220, 53, 69, 0.05); }
    .summary-icon { width: 48px; height: 48px; color: var(--color-accent); flex-shrink: 0; }
    .summary-card.positive .summary-icon { color: #28a745; }
    .summary-card.neutral .summary-icon { color: #ffc107; }
    .summary-card.error .summary-icon { color: #dc3545; }
    .summary-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .summary-label strong { color: var(--color-accent); }
    .summary-content h3 { font-size: 1.5rem; margin: 0.25rem 0 0; }

    /* Layout para el resumen y actividad */
    .summary-grid-container {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .all-stations-summary, .recent-activity-card {
      background: var(--color-panel-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
    }
    .all-stations-summary .card-header, .recent-activity-card .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    /* Estilos Actividad Reciente */
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 250px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    .activity-list::-webkit-scrollbar { width: 4px; }
    .activity-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    
    .activity-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      font-size: 0.85rem;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .activity-item:hover { border-color: var(--color-accent); background: rgba(100, 255, 218, 0.02); }
    .activity-time { color: var(--color-accent); font-family: monospace; font-weight: 600; font-size: 0.75rem; }
    .activity-desc { color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status-dot.mini { width: 6px; height: 6px; margin-right: 0; }

    .badge {
      background: rgba(100, 255, 218, 0.1);
      color: var(--color-accent);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .summary-table-wrapper { overflow-x: auto; }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .summary-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      color: var(--color-text-muted);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid var(--color-border);
    }
    .summary-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.2s;
    }
    .summary-table tr:hover td { background: rgba(100, 255, 218, 0.03); }
    .summary-table tr.active-row td { 
      background: rgba(100, 255, 218, 0.05);
      border-left: 2px solid var(--color-accent);
    }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    .status-dot.positive { background: #28a745; box-shadow: 0 0 8px #28a745; }
    .status-dot.neutral { background: #ffc107; box-shadow: 0 0 8px #ffc107; }
    .status-dot.error { background: #dc3545; box-shadow: 0 0 8px #dc3545; }

    .metric-value small { font-size: 0.9rem; opacity: 0.6; margin-left: 4px; }

    @media (max-width: 1024px) {
      .summary-grid-container { grid-template-columns: 1fr; }
    }
    
    .chart-container {
      position: relative;
      height: 350px;
      width: 100%;
      margin-top: 1rem;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 2rem;
    }

    @media (max-width: 1200px) {
      .main-grid {
        grid-template-columns: 1fr;
      }
      .chart-container {
        height: 300px;
      }
    }

    @media (max-width: 768px) {
      .summary-card { flex-direction: column; text-align: center; gap: 1rem; padding: 1.25rem; }
      .header-actions { width: 100%; justify-content: space-between; }
      .view-header h2 { font-size: 1.5rem; }
      .station-chip { padding: 0.5rem 1rem; font-size: 0.75rem; }
      .chart-container {
        height: 250px;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GeneralPanelComponent implements OnInit, AfterViewInit, OnDestroy {
  // Inyección de servicios necesarios
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  /** Referencias a los elementos canvas de Chart.js */
  @ViewChild('gasesChart') gasesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('envChart') envCanvas!: ElementRef<HTMLCanvasElement>;

  /** Estado reactivo (Signals) */
  /** La medición más reciente de la estación seleccionada */
  latestMedicion = signal<Medicion | null>(null);
  /** Últimas mediciones de cada estación para el resumen global */
  latestByStation = signal<Medicion[]>([]);
  /** Lista de las últimas mediciones globales (actividad reciente) */
  recentActivity = signal<Medicion[]>([]);
  /** Listado de mediciones históricas filtradas para gráficos */
  historicalMediciones = signal<Medicion[]>([]);
  /** ID de la estación que se está visualizando actualmente (persiste vía servicio) */
  selectedStationId = this.firestoreService.selectedStationId;

  /** Instancias de Chart.js */
  gasesChart: any = null;
  envChart: any = null;
  /** Flag para asegurar que la vista está lista para gráficos */
  private viewInitialized = false;
  /** Referencia dinámica a la librería Chart.js */
  private Chart: any;

  /**
   * Listener para ajustar los gráficos al cambiar el tamaño de la ventana.
   */
  private resizeTimeout: any;
  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId) && this.historicalMediciones().length > 0) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.updateCharts(this.historicalMediciones());
      }, 250);
    }
  }

  /** Listado de estaciones disponibles para monitoreo */
  stations = this.firestoreService.stations;

  /** Configuración de las métricas que se muestran en tarjetas */
  metricConfigs: MetricDisplayConfig[] = [
    { 
      key: 'co2', label: 'Dióxido de Carbono', unit: 'ppm', 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20"></path></svg>',
      threshold: 800, thresholdType: 'high'
    },
    { 
      key: 'particulas', label: 'Partículas PM2.5', unit: 'mg/m³', 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
      threshold: 50, thresholdType: 'high'
    },
    { 
      key: 'humo', label: 'Presencia de Humo', unit: 'u', 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M8 12v.01"></path><path d="M12 12v.01"></path><path d="M16 12v.01"></path></svg>',
      threshold: 200, thresholdType: 'high'
    },
    { 
      key: 'humedad', label: 'Humedad Relativa', unit: '%', 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      threshold: 30, thresholdType: 'low'
    },
    { 
      key: 'temperatura', label: 'Temperatura', unit: '°C', 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>'
    }
  ];

  constructor() {
    /**
     * Efecto: Actualiza gráficos automáticamente cuando cambian los datos históricos.
     */
    effect(() => {
      const data = this.historicalMediciones();
      if (data.length > 0 && this.viewInitialized && isPlatformBrowser(this.platformId)) {
        this.updateCharts(data);
      }
    });

    /**
     * Efecto: Filtra y procesa los datos globales de FirestoreService basándose en la estación seleccionada.
     */
    effect(() => {
      const all = this.firestoreService.medicionesGeneral();
      const stationId = this.selectedStationId();
      
      console.log(`GeneralPanel: Procesando ${all.length} registros (Orden: Último Primero)`);
      
      // 1. Obtener la última medición de CADA estación (Resumen Global)
      // Como el orden es DESCENDENTE, el primer elemento de cada grupo es el más reciente.
      const latests: Medicion[] = [];
      const stationsInData = [...new Set(all.map(m => m.estacion_id))];
      
      stationsInData.forEach(sId => {
        const stationMeds = all.filter(m => m.estacion_id === sId);
        if (stationMeds.length > 0) {
          latests.push(stationMeds[stationMeds.length - 1]); // El ÚLTIMO es el más antiguo (Lectura 1)
        }
      });
      // El resumen ya está ordenado por el servicio (descendente general),
      // pero aquí nos aseguramos de que las estaciones se vean por su último reporte.
      this.latestByStation.set(latests);

      // 2. Actividad Reciente (Primeros 10 de la lista, ordenados ascendente para coincidir con historial)
      const sortedAsc = [...all].sort((a, b) => {
        const dateA = new Date(a.fecha_hora).getTime();
        const dateB = new Date(b.fecha_hora).getTime();
        return dateA - dateB;
      });
      this.recentActivity.set(sortedAsc.slice(0, 10));

      // 3. Filtrar para la estación seleccionada (Gráficos y Métricas)
      const filtered = all.filter(m => m.estacion_id === stationId);
      
      if (filtered.length > 0) {
        this.latestMedicion.set(filtered[filtered.length - 1]); // El ÚLTIMO en la lista descendente es el más antiguo (Lectura 1)
        // El histórico para el gráfico: más nuevas a la izquierda, más antiguas (Lectura 1) a la derecha
        this.historicalMediciones.set(filtered);
      } else {
        this.latestMedicion.set(null);
        this.historicalMediciones.set([]);
      }
    });
  }

  ngOnInit() {
    // Ya no es necesario llamar a listenToMediciones localmente,
    // el servicio ya lo hace de forma global.
  }

  /**
   * Inicialización tras renderizado. Carga dinámicamente Chart.js para evitar errores de SSR.
   */
  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.viewInitialized = true;
      
      const { default: ChartJs } = await import('chart.js/auto');
      this.Chart = ChartJs;

      const data = this.historicalMediciones();
      if (data.length > 0) {
        setTimeout(() => this.updateCharts(data), 0);
      }
    }
  }

  ngOnDestroy() {
    // Destrucción de gráficos para liberar memoria
    if (this.gasesChart) this.gasesChart.destroy();
    if (this.envChart) this.envChart.destroy();
  }

  /**
   * Permite renderizar HTML seguro (como SVGs dinámicos) en el template.
   */
  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Cambia la estación activa para visualizar sus datos específicos.
   */
  selectStation(id: string) {
    this.selectedStationId.set(id);
  }

  /**
   * Obtiene el nombre amigable de una estación por su ID.
   */
  getStationName(id: string): string {
    return this.stations.find(s => s.id === id)?.nombre || id;
  }

  /** Navegación secuencial de estaciones */
  prevStation() {
    const idx = this.stations.findIndex(s => s.id === this.selectedStationId());
    const prevIdx = (idx - 1 + this.stations.length) % this.stations.length;
    this.selectStation(this.stations[prevIdx].id);
  }

  nextStation() {
    const idx = this.stations.findIndex(s => s.id === this.selectedStationId());
    const nextIdx = (idx + 1) % this.stations.length;
    this.selectStation(this.stations[nextIdx].id);
  }

  /**
   * Actualiza o inicializa las instancias de Chart.js con los nuevos datos.
   * Gestiona gradientes y estilos visuales complejos.
   * @param data Conjunto de mediciones filtradas y ordenadas.
   */
  updateCharts(data: Medicion[]) {
    if (!this.gasesCanvas || !this.envCanvas || !this.Chart || !isPlatformBrowser(this.platformId)) return;

    const all = this.firestoreService.medicionesGeneral();
    const sortedAsc = [...all].sort((a, b) => {
      const dateA = new Date(a.fecha_hora).getTime();
      const dateB = new Date(b.fecha_hora).getTime();
      return dateA - dateB;
    });

    const labels = data.map(m => {
      const idx = sortedAsc.findIndex(item => item.id === m.id);
      return `Lectura ${idx !== -1 ? (idx + 1) : 1}`;
    });
    const ctxGases = this.gasesCanvas.nativeElement.getContext('2d');
    const ctxEnv = this.envCanvas.nativeElement.getContext('2d');

    if (!ctxGases || !ctxEnv) return;

    // Configuración común de estilo para ambos gráficos
    const commonOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', align: 'end', labels: { color: '#8892b0' } }
      },
      scales: {
        x: { ticks: { color: '#8892b0', maxTicksLimit: 8 } },
        y: { ticks: { color: '#8892b0' }, grid: { color: 'rgba(100, 255, 218, 0.05)' } }
      }
    };

    // Gráfico 1: Gases y Partículas
    const gasesDatasets = [
      { label: 'CO2 (ppm)', data: data.map(m => m.co2), borderColor: '#64ffda', tension: 0.4 },
      { label: 'PM2.5 (mg)', data: data.map(m => m.particulas), borderColor: '#ffc107', tension: 0.4 },
      { label: 'Humo (u)', data: data.map(m => m.humo), borderColor: '#ff4d4d', tension: 0.4 }
    ];

    if (!this.gasesChart) {
      this.gasesChart = new this.Chart(this.gasesCanvas.nativeElement, {
        type: 'line',
        data: { labels, datasets: gasesDatasets },
        options: commonOptions
      });
    } else {
      this.gasesChart.data.labels = labels;
      this.gasesChart.data.datasets = gasesDatasets;
      this.gasesChart.update('none');
    }

    // Gráfico 2: Variables Ambientales
    const envDatasets = [
      { label: 'Temp (°C)', data: data.map(m => m.temperatura), borderColor: '#ff944d', tension: 0.4 },
      { label: 'Hum (%)', data: data.map(m => m.humedad), borderColor: '#4da3ff', tension: 0.4 }
    ];

    if (!this.envChart) {
      this.envChart = new this.Chart(this.envCanvas.nativeElement, {
        type: 'line',
        data: { labels, datasets: envDatasets },
        options: { ...commonOptions, scales: { ...commonOptions.scales, y: { min: 0, max: 100 } } }
      });
    } else {
      this.envChart.data.labels = labels;
      this.envChart.data.datasets = envDatasets;
      this.envChart.update('none');
    }
  }

  /**
   * Retorna la clase CSS correspondiente a la semántica de la calidad del aire.
   */
  getAirQualityClass(status: string | undefined): string {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('bueno') || s.includes('óptimo') || s.includes('excelente')) return 'positive';
    if (s.includes('moderado') || s.includes('normal')) return 'neutral';
    return 'error';
  }

  /** Clase CSS para indicadores de métricas individuales basados en umbrales */
  getMetricStatusClass(config: MetricDisplayConfig): string {
    const val = this.latestMedicion()?.[config.key];
    if (val === undefined || config.threshold === undefined) return 'neutral';
    const isAlert = config.thresholdType === 'high' ? val > config.threshold : val < config.threshold;
    return isAlert ? 'error' : 'positive';
  }

  /** Calcula porcentaje para la barra de progreso de humo */
  getHumoPercentage(val: number): number {
    return Math.min(Math.max((val / 1000) * 100, 5), 100);
  }

  getMetricStatusLabel(config: MetricDisplayConfig): string {
    const val = this.latestMedicion()?.[config.key];
    if (val === undefined) return 'Cargando...';
    if (config.threshold === undefined) return 'Estable';
    const isAlert = config.thresholdType === 'high' ? val > config.threshold : val < config.threshold;
    return isAlert ? 'Fuera de rango' : 'Normal';
  }

  /** Formatea timestamp para mostrar solo hora y minutos en etiquetas */
  formatTime(timestamp: any): string {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getReadingNumber(m: Medicion): number {
    const all = this.firestoreService.medicionesGeneral();
    const sortedAsc = [...all].sort((a, b) => {
      const dateA = new Date(a.fecha_hora).getTime();
      const dateB = new Date(b.fecha_hora).getTime();
      return dateA - dateB;
    });
    const index = sortedAsc.findIndex(item => item.id === m.id);
    return index !== -1 ? (index + 1) : 1;
  }

  /** Finaliza la sesión del usuario */
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
