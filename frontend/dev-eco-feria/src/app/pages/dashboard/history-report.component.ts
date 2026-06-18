import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService, Medicion } from '../../services/firestore.service';
import { ExportService } from '../../services/export.service';

/**
 * Componente encargado de visualizar el historial detallado de mediciones.
 * Permite filtrar por estación y exportar los datos recolectados.
 */
@Component({
  selector: 'app-history-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-view animate-fade-in">
      <header class="view-header">
        <h2>Historial de Mediciones Completo</h2>
        <p>Registro íntegro de la colección de Firestore. Visualización de todos los datos desde el primer registro hasta el último detectado.</p>
      </header>

      <div class="filters-bar">
        <div class="filters-main">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" 
                   [ngModel]="searchText()" 
                   (ngModelChange)="searchText.set($event)" 
                   placeholder="Buscar por ID de estación o estado...">
          </div>
          <div class="stats-badge">
            <strong>{{ filteredMediciones().length }}</strong> registros encontrados
          </div>
        </div>
        <button class="export-button" (click)="exportData()" [disabled]="filteredMediciones().length === 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span class="btn-text">Exportar Listado (CSV)</span>
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Estación</th>
              <!-- Columnas Dinámicas -->
              <th *ngFor="let header of dynamicHeaders()">{{ formatHeader(header) }}</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredMediciones()">
              <td class="text-nowrap">{{ formatDate(item.fecha_hora) }}</td>
              <td><strong>{{ item.estacion_id }}</strong></td>
              
              <!-- Celdas Dinámicas -->
              <td *ngFor="let col of dynamicHeaders()">
                <span [class.alert-val]="isAlert(col, item[col])">
                  {{ item[col] ?? '---' }}
                </span>
              </td>

              <td>
                <span class="status-tag" [class]="getAirQualityClass(item.estado_calidad_aire)">
                  {{ item.estado_calidad_aire }}
                </span>
              </td>
            </tr>
            <tr *ngIf="filteredMediciones().length === 0">
              <td [attr.colspan]="dynamicHeaders().length + 3" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
                No se han encontrado registros que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
      .filters-bar {
        display: flex;
        justify-content: space-between;
        gap: 1.5rem;
        align-items: center;
        background-color: var(--color-panel-bg);
        padding: 1.25rem;
        border-radius: 12px;
        flex-wrap: wrap;
        border: 1px solid var(--color-border);
        backdrop-filter: blur(10px);
      }
      .filters-main {
        display: flex;
        gap: 1.5rem;
        flex: 1;
        min-width: 280px;
        align-items: center;
      }
      .search-box {
        position: relative;
        flex: 1;
      }
      .stats-badge {
        font-size: 0.8rem;
        color: var(--color-text-muted);
        background: rgba(100, 255, 218, 0.05);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--color-border);
        white-space: nowrap;
      }
      .stats-badge strong {
        color: var(--color-accent);
      }
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--color-accent);
        opacity: 0.6;
      }
      .search-box input {
        background: var(--color-input-bg);
        border: 1px solid var(--color-border);
        color: var(--color-text);
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
        width: 100%;
        transition: var(--transition-smooth);
      }
      .export-button {
        background: transparent;
        border: 1px solid var(--color-accent);
        color: var(--color-accent);
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
      }
      .export-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      @media (max-width: 768px) {
        .filters-main { width: 100%; order: 2; flex-direction: column; align-items: stretch; }
        .export-button { width: 100%; order: 1; justify-content: center; }
        .view-header h2 { font-size: 1.5rem; }
      }

      .table-container {
        background-color: var(--color-panel-bg);
        border-radius: 12px;
        overflow-x: auto;
        border: 1px solid var(--color-border);
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        max-height: 70vh; /* Permite scroll interno para muchos datos */
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
      }
      .data-table thead {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--color-base);
      }
      .data-table th, .data-table td {
        padding: 1.25rem 1rem;
        text-align: left;
        border-bottom: 1px solid var(--color-border);
        font-size: 0.85rem;
      }
     small { opacity: 0.6; font-size: 0.7rem; }
    .status-tag {
      padding: 0.4rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .status-tag.positive { background: rgba(40, 167, 69, 0.1); color: #28a745; border: 1px solid #28a745; }
    .status-tag.neutral { background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid #ffc107; }
    .status-tag.error { background: rgba(220, 53, 69, 0.1); color: #dc3545; border: 1px solid #dc3545; }
    .alert-val { color: #dc3545; font-weight: 700; }
  `]
})
export class HistoryReportComponent implements OnInit {
  // Inyección de servicios
  private firestoreService = inject(FirestoreService);
  private exportService = inject(ExportService);
  
  /** Signal que contiene la lista de mediciones históricas desde el servicio global */
  mediciones = this.firestoreService.medicionesHistory;
  
  /** Signal para el texto de búsqueda */
  searchText = signal('');

  /** Mediciones filtradas según el texto de búsqueda */
  filteredMediciones = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const meds = this.mediciones();
    
    if (!search) return meds;
    
    return meds.filter(m => 
      m.estacion_id?.toLowerCase().includes(search) || 
      m.estado_calidad_aire?.toLowerCase().includes(search)
    );
  });

  /** Identifica dinámicamente qué columnas existen en los datos para mostrarlas todas */
  dynamicHeaders = computed(() => {
    const meds = this.mediciones();
    if (meds.length === 0) return [];
    
    const allKeys = new Set<string>();
    meds.forEach(m => Object.keys(m).forEach(k => {
      // Solo agregamos la clave si tiene un valor definido en al menos un registro
      if (m[k] !== undefined && m[k] !== null) {
        allKeys.add(k);
      }
    }));
    
    // Campos que NUNCA queremos como columnas dinámicas porque ya tienen columna fija
    const excluded = ['id', 'estacion_id', 'fecha_hora', 'estado_calidad_aire', 'lat', 'lng', 'fecha', 'timestamp'];
    
    // Mapeo de normalización para detectar duplicados (coherencia)
    const normalizedToOriginal: Record<string, string[]> = {
      co2: ['CO2', 'dioxido_carbono', 'co2_ppm', 'ppm_co2'],
      temperatura: ['temp', 'temperature', 'Temp', 'TEMPERATURE'],
      humedad: ['hum', 'humidity', 'Hum', 'HUMIDITY'],
      particulas: ['polvo', 'pm25', 'pm10', 'partículas', 'particles'],
      humo: ['smoke', 'Humo', 'SMOKE']
    };

    let headers = Array.from(allKeys).filter(k => !excluded.includes(k));

    // REGLA DE COHERENCIA: Si existe el campo original y el normalizado, y tienen el mismo valor,
    // preferimos mostrar el original y ocultar el normalizado para evitar redundancia.
    const toRemove = new Set<string>();
    headers.forEach(h => {
      if (normalizedToOriginal[h]) {
        // h es una clave normalizada (ej: 'co2'). 
        // Si ALGUNA de sus alternativas originales existe en las claves, marcamos 'co2' para borrar.
        const alternatives = normalizedToOriginal[h];
        if (alternatives.some(alt => allKeys.has(alt))) {
          toRemove.add(h);
        }
      }
    });

    headers = headers.filter(h => !toRemove.has(h));
    
    // Ordenar para que las columnas importantes aparezcan primero
    const priority = ['co2', 'CO2', 'particulas', 'pm25', 'temperatura', 'temp', 'humedad', 'hum', 'humo', 'smoke'];
    
    return headers.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  });

  ngOnInit() { }

  formatHeader(key: string): string {
    const labels: Record<string, string> = {
      co2: 'CO2 (ppm)',
      particulas: 'PM2.5 (mg/m³)',
      temperatura: 'Temp (°C)',
      humedad: 'Hum (%)',
      humo: 'Humo (u)'
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  }

  isAlert(key: string, value: any): boolean {
    const val = Number(value);
    if (isNaN(val)) return false;
    if (key === 'co2') return val > 1000;
    if (key === 'particulas') return val > 50;
    if (key === 'humo') return val > 200;
    return false;
  }

  /**
   * Formatea la fecha para visualización en tabla.
   * @param timestamp Valor de fecha crudo.
   */
  formatDate(timestamp: any): string {
    if (!timestamp) return '---';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Retorna la clase CSS basada en la semántica de calidad del aire para las etiquetas.
   */
  getAirQualityClass(status: string | undefined): string {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    
    if (s.includes('óptimo') || s.includes('optimo') || s.includes('bueno') || s.includes('excelente') || s.includes('bajo')) {
      return 'positive';
    }
    if (s.includes('moderado') || s.includes('aceptable') || s.includes('medio') || s.includes('normal')) {
      return 'neutral';
    }
    if (s.includes('alerta') || s.includes('riesgo') || s.includes('crítico') || s.includes('critico') || s.includes('peligro') || s.includes('malo')) {
      return 'error';
    }
    return 'neutral';
  }

  /**
   * Procesa y exporta las mediciones actuales a un archivo Excel.
   * Ahora incluye todas las columnas dinámicas.
   */
  exportData() {
    const headers = this.dynamicHeaders();
    const dataToExport = this.filteredMediciones().map(m => {
      const row: any = {
        Fecha_Hora: this.formatDate(m.fecha_hora),
        Estacion: m.estacion_id
      };
      
      // Añadir todas las columnas dinámicas
      headers.forEach(h => {
        row[this.formatHeader(h)] = m[h];
      });
      
      row['Estado'] = m.estado_calidad_aire;
      return row;
    });

    this.exportService.exportToExcel(dataToExport, 'Historial_Ambiental_Completo_DevEco');
  }
}
