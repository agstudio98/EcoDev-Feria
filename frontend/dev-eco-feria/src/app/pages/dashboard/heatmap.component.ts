import { Component, inject, OnInit, signal, OnDestroy, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FirestoreService, Medicion, Estacion } from '../../services/firestore.service';

declare var google: any;

interface EstacionConEstado extends Estacion {
  id: string; // Hacemos el ID obligatorio para este componente
  ultimaMedicion?: Medicion;
  calidadColor?: string;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-view animate-fade-in">
      <header class="view-header">
        <div class="header-main">
          <h2>Mapa de Calor en Tiempo Real</h2>
          <div class="live-indicator">
            <span class="dot pulse"></span>
            DATOS VIVOS
          </div>
        </div>
        <p>Visualización espacial de los niveles de contaminación detectados por tus microestaciones en red en Córdoba Capital.</p>
      </header>

      <div class="map-container">
        <!-- Mapa Real de Google Maps -->
        <div class="google-map-wrapper">
          <div #mapContainer id="map" class="map-placeholder"></div>
          
          <div *ngIf="!isMapLoaded()" class="map-loading-overlay">
            <div class="spinner"></div>
            <span>Cargando Google Maps...</span>
          </div>

          <!-- Capa de información flotante -->
          <div class="map-floating-info" *ngIf="isMapLoaded()">
            <div class="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Actualizado: {{ lastUpdate | date:'HH:mm:ss' }}</span>
            </div>
            <button (click)="centerOnUser()" class="user-loc-btn" title="Mi ubicación">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </button>
          </div>
        </div>

        <!-- Controles y Leyenda -->
        <aside class="map-controls">
          <div class="control-group">
            <h3>Estaciones en Córdoba</h3>
            <div class="station-status-list">
              <div *ngFor="let e of estacionesConDatos()" class="mini-status-item" (click)="focusStation(e)">
                <span class="status-dot" [style.background]="e.calidadColor"></span>
                <div class="mini-info">
                  <span class="mini-name">{{ e.nombre }}</span>
                  <div class="coord-display">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{{ e.lat?.toFixed(4) }}°, {{ e.lng?.toFixed(4) }}°</span>
                  </div>
                  <span class="mini-val">CO2: {{ e.ultimaMedicion?.co2 || '---' }} ppm</span>
                </div>
              </div>
            </div>
          </div>

          <div class="legend">
            <h3>Nivel de Riesgo (CO2)</h3>
            <div class="legend-item">
              <span class="box high" style="background: #dc3545;"></span>
              <span>Crítico (> 1000 ppm)</span>
            </div>
            <div class="legend-item">
              <span class="box med" style="background: #ffc107;"></span>
              <span>Moderado (600 - 1000 ppm)</span>
            </div>
            <div class="legend-item">
              <span class="box low" style="background: #28a745;"></span>
              <span>Óptimo (< 600 ppm)</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-view {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 2rem;
      min-height: calc(100vh - 120px);
    }
    .header-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .live-indicator { 
      display: flex; align-items: center; gap: 0.5rem; 
      font-size: 0.7rem; font-weight: 800; color: var(--color-accent);
      padding: 0.4rem 0.8rem; background: var(--color-accent-soft);
      border-radius: 4px; border: 1px solid var(--color-border);
    }
    
    .map-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 1.5rem;
      flex: 1;
      min-height: 500px;
    }

    @media (max-width: 1024px) {
      .map-container {
        grid-template-columns: 1fr;
        min-height: auto;
      }
      .google-map-wrapper {
        height: 450px;
        min-height: 400px;
      }
      .map-controls {
        order: 2;
      }
    }

    @media (max-width: 768px) {
      .dashboard-view { padding: 1rem; gap: 1.5rem; }
      .google-map-wrapper { height: 350px; }
      .view-header h2 { font-size: 1.5rem; }
      .map-floating-info { top: 0.5rem; left: 0.5rem; right: 0.5rem; }
      .info-item { padding: 0.4rem 0.75rem; font-size: 0.7rem; }
      .user-loc-btn { width: 32px; height: 32px; }
    }

    .google-map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 500px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      background: #020c1b;
    }

    .map-placeholder {
      width: 100%;
      height: 100%;
      min-height: 500px;
      display: block;
    }

    .map-loading-overlay {
      position: absolute;
      inset: 0;
      background: var(--color-base);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-accent-soft);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .map-floating-info {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      z-index: 5;
    }

    .info-item {
      background: rgba(10, 25, 47, 0.85);
      backdrop-filter: blur(8px);
      padding: 0.5rem 1rem;
      border-radius: 30px;
      border: 1px solid var(--color-border);
      color: var(--color-text);
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      pointer-events: auto;
    }

    .user-loc-btn {
      background: var(--color-accent);
      color: var(--color-base);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }

    .user-loc-btn:hover { transform: scale(1.1); }
    .icon { width: 16px; height: 16px; }

    .station-status-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .mini-status-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.2s;
    }
    .mini-status-item:hover {
      background: rgba(100, 255, 218, 0.05);
      border-color: var(--color-accent);
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: 0 0 10px currentColor;
    }
    .mini-info {
      display: flex;
      flex-direction: column;
    }
    .mini-name { font-size: 0.85rem; font-weight: 600; }
    .coord-display {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      color: var(--color-accent);
      margin: 2px 0;
    }
    .coord-display svg { width: 12px; height: 12px; }
    .mini-val { font-size: 0.75rem; color: var(--color-text-muted); }
  `]
})
export class HeatmapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapElement!: ElementRef;
  
  private firestoreService = inject(FirestoreService);
  private platformId = inject(PLATFORM_ID);
  
  estacionesConDatos = signal<EstacionConEstado[]>([]);
  isMapLoaded = signal(false);
  lastUpdate = new Date();
  
  private map: any;
  private markers: Map<string, any> = new Map();
  private circles: Map<string, any> = new Map();
  private infoWindows: any[] = [];
  private userMarker: any;
  private heatmapLayer: any;
  private isDestroyed = false;

  constructor() {
    /**
     * Efecto: Reacciona a cambios en las mediciones globales.
     * Procesa los datos y actualiza las estaciones.
     */
    effect(() => {
      const allMeds = this.firestoreService.medicionesGeneral();
      if (allMeds.length > 0) {
        this.lastUpdate = new Date();
        this.procesarMediciones(allMeds);
      }
    });
  }

  ngOnInit() {
    this.inicializarEstacionesBase();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    // Limpiar marcadores y círculos
    this.markers.forEach(m => m.setMap(null));
    this.markers.clear();
    this.circles.forEach(c => c.setMap(null));
    this.circles.clear();
  }

  private inicializarEstacionesBase() {
    this.estacionesConDatos.set(this.firestoreService.stations.map(s => ({
      ...s,
      ultimaMedicion: undefined,
      calidadColor: undefined
    })));
  }

  private procesarMediciones(mediciones: Medicion[]) {
    const current = [...this.estacionesConDatos()];
    const lastMedsMap = new Map<string, Medicion>();

    // Obtener la última medición de cada estación
    mediciones.forEach(m => {
      if (!lastMedsMap.has(m.estacion_id)) {
        lastMedsMap.set(m.estacion_id, m);
      }
    });

    let huboCambios = false;

    lastMedsMap.forEach((medicion, id) => {
      const index = current.findIndex(e => e.id === id);
      if (index !== -1) {
        if (current[index].ultimaMedicion?.fecha_hora !== medicion.fecha_hora) {
          current[index] = {
            ...current[index],
            ultimaMedicion: medicion,
            calidadColor: this.getColorByCO2(medicion.co2)
          };
          huboCambios = true;
        }
      } else {
        // Nueva estación dinámica
        current.push({
          id,
          nombre: `Estación ${id}`,
          lat: medicion.lat || (-31.416 + (Math.random() - 0.5) * 0.01),
          lng: medicion.lng || (-64.183 + (Math.random() - 0.5) * 0.01),
          ultimaMedicion: medicion,
          calidadColor: this.getColorByCO2(medicion.co2)
        });
        huboCambios = true;
      }
    });

    if (huboCambios) {
      this.estacionesConDatos.set(current);
      if (this.isMapLoaded()) {
        this.updateMapMarkers();
        this.updateHeatmap();
      }
    }
  }

  initMap() {
    if (this.isDestroyed) return;
    
    console.log("Esperando API de Google Maps...");
    
    const checkGoogle = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(checkGoogle);
        return;
      }
      if (typeof google !== 'undefined' && google.maps) {
        clearInterval(checkGoogle);
        console.log("Google Maps API detectada.");
        this.renderMap();
      }
    }, 500);

    setTimeout(() => {
      if (!this.isMapLoaded() && !this.isDestroyed) {
        console.error("Error: Google Maps no se cargó. Verificá la conexión o la API Key.");
      }
    }, 10000);
  }

  renderMap() {
    if (this.isDestroyed) return;

    const container = this.mapElement?.nativeElement;
    if (!container) {
      console.warn("Contenedor de mapa no listo, reintentando...");
      setTimeout(() => this.renderMap(), 200);
      return;
    }

    try {
      if (this.map) return;

      const cordobaCenter = { lat: -31.416, lng: -64.183 };
      const mapOptions = {
        center: cordobaCenter,
        zoom: 14,
        styles: this.getDarkStyles(),
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      };

      this.map = new google.maps.Map(container, mapOptions);
      this.isMapLoaded.set(true);
      
      this.updateMapMarkers();
      this.trackUserLocation();
    } catch (error) {
      console.error("Error al renderizar el mapa:", error);
    }
  }

  updateMapMarkers() {
    if (!this.map || !isPlatformBrowser(this.platformId)) return;

    this.estacionesConDatos().forEach(e => {
      const stationId = e.id;
      if (!e.lat || !e.lng || !stationId) return;

      const color = e.calidadColor || '#28a745';

      // 1. Gestionar Marcador (Punto central)
      if (!this.markers.has(stationId)) {
        const marker = new google.maps.Marker({
          position: { lat: e.lat, lng: e.lng },
          map: this.map,
          title: e.nombre,
          icon: this.createMarkerIcon(color)
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="color: #333; font-family: sans-serif; padding: 5px;">
            <h4 style="margin: 0 0 5px 0; color: #1a1a1a;">${e.nombre}</h4>
            <p style="margin: 0; font-size: 0.9rem;">CO2: <b style="color: ${color}">${e.ultimaMedicion?.co2 || '---'} ppm</b></p>
            <p style="margin: 3px 0 0 0; font-size: 0.8rem; color: #666;">ID: ${stationId}</p>
          </div>`
        });

        marker.addListener('click', () => {
          this.infoWindows.forEach(iw => iw.close());
          infoWindow.open(this.map, marker);
        });

        this.markers.set(stationId, marker);
        this.infoWindows.push(infoWindow);
      } else {
        const marker = this.markers.get(stationId);
        marker.setIcon(this.createMarkerIcon(color));
      }

      // 2. Gestionar Halo (Círculo que rodea el punto)
      if (!this.circles.has(stationId)) {
        const circle = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.15,
          map: this.map,
          center: { lat: e.lat, lng: e.lng },
          radius: 200 // Radio en metros
        });
        this.circles.set(stationId, circle);
      } else {
        const circle = this.circles.get(stationId);
        circle.setOptions({
          strokeColor: color,
          fillColor: color
        });
      }
    });
  }

  updateHeatmap() {
    if (!this.heatmapLayer) return;

    const heatmapData = this.estacionesConDatos()
      .filter(e => e.lat && e.lng && e.ultimaMedicion)
      .map(e => ({
        location: new google.maps.LatLng(e.lat, e.lng),
        weight: (e.ultimaMedicion?.co2 || 400) / 100
      }));

    this.heatmapLayer.setData(heatmapData);
  }

  trackUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          if (!this.userMarker) {
            this.userMarker = new google.maps.Marker({
              position: pos,
              map: this.map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#fff'
              },
              title: "Tu ubicación"
            });
          } else {
            this.userMarker.setPosition(pos);
          }
        },
        () => console.warn("Error obteniendo ubicación del usuario")
      );
    }
  }

  centerOnUser() {
    if (this.userMarker) {
      this.map.panTo(this.userMarker.getPosition());
      this.map.setZoom(16);
    }
  }

  focusStation(e: EstacionConEstado) {
    if (this.map && e.lat && e.lng) {
      this.map.panTo({ lat: e.lat, lng: e.lng });
      this.map.setZoom(16);
    }
  }

  createMarkerIcon(color: string) {
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#fff',
      scale: 1.5,
      anchor: new google.maps.Point(12, 22)
    };
  }

  getColorByCO2(co2: number | undefined): string {
    if (!co2) return '#8892b0';
    if (co2 < 600) return '#28a745';
    if (co2 < 1000) return '#ffc107';
    return '#dc3545';
  }

  getGradient(color: string | undefined): string {
    return `radial-gradient(circle, ${color || '#28a745'} 0%, transparent 70%)`;
  }

  getDarkStyles() {
    return [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
      { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
      { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59553" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
      { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
    ];
  }
}
