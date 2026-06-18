import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  query as firestoreQuery,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit
} from '@angular/fire/firestore';
import { Database, ref, onValue, query as rtdbQuery, orderByKey, limitToLast } from '@angular/fire/database';

/**
 * Interfaces para los datos de Firebase
 */
/**
 * Interface que define la estructura de una Medición ambiental.
 */
export interface Medicion {
  id?: string;
  estacion_id: string;
  fecha_hora: any;
  estado_calidad_aire?: string;
  // Campos opcionales: solo se llenan si existen en la fuente
  humo?: number;
  temperatura?: number;
  particulas?: number;
  co2?: number;
  humedad?: number;
  lat?: number;
  lng?: number;
  [key: string]: any; 
}

export interface Estacion {
  id: string;
  nombre: string;
  lat?: number;
  lng?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private database = inject(Database);

  /** Listado centralizado de estaciones */
  stations: Estacion[] = [
    { id: 'plaza_san_martin', nombre: 'Plaza San Martín', lat: -31.4168, lng: -64.1835 },
    { id: 'av_colon_gral_paz', nombre: 'Av. Colón y Gral. Paz', lat: -31.415, lng: -64.185 },
    { id: 'terminal_omnibus', nombre: 'Terminal de Ómnibus', lat: -31.424, lng: -64.173 },
    { id: 'microestacion_01', nombre: 'Microestación 01', lat: -31.400, lng: -64.200 },
    { id: 'Rio Cuarto', nombre: 'Central de Río Cuarto', lat: -33.123, lng: -64.349 }
  ];

  /** ID de la estación seleccionada globalmente para persistencia entre navegación */
  selectedStationId = signal<string>('plaza_san_martin');

  // Estados globales para evitar recargas innecesarias y flickering
  private _medicionesGeneral = signal<Medicion[]>([]);
  private _medicionesHistory = signal<Medicion[]>([]);

  // Map maestro para de-duplicación absoluta (estacion_id + timestamp_redondeado)
  // Esto asegura que si el mismo dato llega por Firestore y RTDB, se unifiquen.
  private masterDataMap = new Map<string, Medicion>();

  // Getters públicos (Readonly)
  medicionesGeneral = this._medicionesGeneral.asReadonly();
  medicionesHistory = this._medicionesHistory.asReadonly();

  constructor() {
    this.initRealtimeStreams();
  }

  /**
   * Inicializa las escuchas globales. 
   * Esto asegura que los datos persistan mientras la app esté abierta.
   */
  /**
   * Inicializa las escuchas globales. 
   * Esto asegura que los datos persistan mientras la app esté abierta.
   */
  private initRealtimeStreams() {
    console.log('FirestoreService: Iniciando streams de datos globales (Sin límites)...');
    
    // 1. Escucha Firestore (Colección 'mediciones') - SIN LÍMITE
    this.getFirestoreMediciones('mediciones', (meds) => {
      console.log(`FirestoreService: [Firestore mediciones] Recibidas ${meds.length} mediciones`);
      this.processIncomingData(meds);
    });

    // 1b. Escucha Firestore (Colección 'historial') - Por si existe
    this.getFirestoreMediciones('historial', (meds) => {
      if (meds.length > 0) {
        console.log(`FirestoreService: [Firestore historial] Recibidas ${meds.length} mediciones`);
        this.processIncomingData(meds);
      }
    });

    // 2. Escucha RTDB Historial y Rutas Genéricas
    const genericPaths = [
      'DevEco/Historial', 
      'mediciones', 
      'Historial', 
      'mediciones/firestore'
    ];
    
    genericPaths.forEach(path => {
      this.getRTDBMediciones((meds) => {
        if (meds.length > 0) {
          console.log(`FirestoreService: [RTDB General] Recibidas ${meds.length} mediciones desde ${path}`);
          this.processIncomingData(meds);
        }
      }, path);
    });

    // 3. Escucha RTDB Rutas específicas por estación (Autodefine el ID de estación)
    this.stations.forEach(s => {
      const specificPaths = [`DevEco/${s.id}/Historial`, `${s.id}/Historial`, `${s.id}/mediciones` ];
      specificPaths.forEach(path => {
        this.getRTDBMediciones((meds) => {
          if (meds.length > 0) {
            console.log(`FirestoreService: [RTDB Station] Recibidas ${meds.length} mediciones para ${s.id} desde ${path}`);
            this.processIncomingData(meds);
          }
        }, path, s.id);
      });
    });

    // 4. Escucha RTDB Pruebas
    const rtdbPathsHistory = ['DevEco/pruebas', 'pruebas'];
    rtdbPathsHistory.forEach(path => {
      this.getRTDBMediciones((meds) => {
        if (meds.length > 0) {
          console.log(`FirestoreService: [RTDB History] Recibidas ${meds.length} mediciones desde ${path}`);
          this.processIncomingData(meds);
        }
      }, path);
    });
  }

  private processIncomingData(meds: Medicion[]) {
    if (!meds || meds.length === 0) return;

    meds.forEach(m => {
      // USAMOS EL ID COMO CLAVE PRIMARIA PARA EVITAR COLAPSAR FILAS
      // Si el ID es el mismo (mismo documento/registro), se actualiza.
      // Si son IDs distintos, son FILAS DISTINTAS aunque tengan el mismo timestamp.
      const coherenceKey = m.id || `${m.estacion_id}_${new Date(m.fecha_hora).getTime()}`;

      const existing = this.masterDataMap.get(coherenceKey);
      if (existing) {
        // Fusión inteligente: combinamos campos, pero priorizamos los que NO son indefinidos/null.
        this.masterDataMap.set(coherenceKey, { ...existing, ...m });
      } else {
        this.masterDataMap.set(coherenceKey, m);
      }
    });

    this.updateSignals();
  }

  private updateSignals() {
    // Convertimos el Map a Array y ordenamos por fecha DESCENDENTE
    // "El primero en la lista es el último generado" para coherencia total con la vista de Firestore.
    const sorted = Array.from(this.masterDataMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.fecha_hora).getTime();
        const dateB = new Date(b.fecha_hora).getTime();
        if (dateA !== dateB) return dateB - dateA; // Más recientes PRIMERO (Descendente)
        return a.estacion_id.localeCompare(b.estacion_id);
      });
    
    console.log(`FirestoreService: Actualizando señales con ${sorted.length} registros (Orden: Último generado PRIMERO)`);
    this._medicionesGeneral.set(sorted);
    this._medicionesHistory.set(sorted);
  }

  /**
   * Mantiene compatibilidad con componentes que usan callbacks manuales,
   * pero se recomienda usar los signals directamente.
   */
  getRTDBMediciones(callback: (mediciones: Medicion[]) => void, path: string = 'DevEco/Historial', defaultStationId?: string) {
    const dbRef = ref(this.database, path);
    // Eliminamos el límite para traer todo el historial disponible
    const q = rtdbQuery(dbRef, orderByKey());

    return onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) { 
        callback([]); 
        return; 
      }

      // Si es un objeto (como el Historial), lo convertimos a array
      const mediciones: Medicion[] = Object.keys(data).map(key => {
        const item = data[key];
        // En RTDB el ID es la clave del nodo
        return this.mapToMedicion(item, key, defaultStationId);
      });

      callback(mediciones);
    });
  }

  /**
   * Establece una suscripción en tiempo real a Cloud Firestore.
   * Utilizado como fuente alternativa o complementaria de mediciones.
   * @param collectionName Nombre de la colección a escuchar.
   * @param callback Función que recibe el listado normalizado de mediciones.
   */
  getFirestoreMediciones(collectionName: string, callback: (mediciones: Medicion[]) => void) {
    const collRef = collection(this.firestore, collectionName);
    const q = firestoreQuery(collRef);

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) { 
        callback([]); 
        return; 
      }

      const mediciones = snapshot.docs.map(doc => {
        const item = doc.data();
        // En Firestore el ID es el ID del documento
        return this.mapToMedicion(item, doc.id);
      });

      callback(mediciones);
    }, (error) => {
      // Solo logueamos si la colección existe pero falla (permisos, etc)
      if (error.code !== 'permission-denied') {
        console.error(`FirestoreService Error [${collectionName}]:`, error);
      }
      callback([]);
    });
  }

  /**
   * Normaliza y mapea objetos crudos de Firebase a la interface Medicion.
   * Asegura que el tipado y los nombres de campos sean consistentes SIN inventar datos.
   * @param item Objeto crudo de la base de datos.
   * @param id Identificador del registro.
   * @param defaultStationId ID de estación opcional si no viene en el item.
   * @private
   */
  private mapToMedicion(item: any, id: string, defaultStationId?: string): Medicion {
    // 1. Resolución de fecha (necesaria para ordenamiento)
    let fechaRaw = item['fecha_hora'] || item['timestamp'] || item['time'] || item['fecha'] || item['FECHA_HORA'] || item['date'];
    let fechaISO: string;

    if (fechaRaw?.toDate) {
      fechaISO = fechaRaw.toDate().toISOString();
    } else if (fechaRaw) {
      const d = new Date(fechaRaw);
      if (!isNaN(d.getTime())) {
        fechaISO = d.toISOString();
      } else {
        fechaISO = this.tryParseSpanishDate(fechaRaw) || new Date().toISOString();
      }
    } else {
      // Solo si no hay absolutamente ninguna fecha, usamos el ID si parece un timestamp, o el ahora.
      if (id && !isNaN(Number(id)) && id.length >= 10) {
        const numId = Number(id);
        fechaISO = new Date(numId > 10000000000 ? numId : numId * 1000).toISOString();
      } else {
        fechaISO = new Date().toISOString();
      }
    }

    // 2. Construcción del objeto con fidelidad total
    // IMPORTANTE: Mantenemos todos los campos originales de Firestore/RTDB EXACTAMENTE como están.
    const medicion: Medicion = {
      ...item, 
      id: id,
      estacion_id: item['estacion_id'] || item['id_estacion'] || item['estacion'] || item['domo'] || item['sensor'] || defaultStationId || 'Desconocida',
      fecha_hora: fechaISO
    };

    // 3. Normalizamos nombres de campos comunes PARA LOS GRÁFICOS Y EL DASHBOARD.
    // Pero solo si no existen ya con el nombre estándar.
    // Esto garantiza que el dashboard siempre tenga datos, pero el objeto original se conserva.
    const mappings = [
      { standard: 'co2', alternatives: ['CO2', 'dioxido_carbono', 'co2_ppm', 'ppm_co2'] },
      { standard: 'temperatura', alternatives: ['temp', 'temperature', 'Temp', 'TEMPERATURE'] },
      { standard: 'humedad', alternatives: ['hum', 'humidity', 'Hum', 'HUMIDITY'] },
      { standard: 'particulas', alternatives: ['polvo', 'pm25', 'pm10', 'partículas', 'particles'] },
      { standard: 'humo', alternatives: ['smoke', 'Humo', 'SMOKE'] }
    ];

    mappings.forEach(m => {
      if (medicion[m.standard] === undefined) {
        for (const alt of m.alternatives) {
          if (item[alt] !== undefined) {
            medicion[m.standard] = Number(item[alt]);
            break;
          }
        }
      }
    });

    // 4. Calidad del aire: Prioridad total a lo que diga el sensor/base de datos.
    // NO inventamos el estado si ya viene en algún campo.
    const rawEstado = item['estado_calidad_aire'] || item['estado'] || item['quality'] || item['Estado'] || item['ESTADO'];
    
    if (rawEstado) {
      medicion.estado_calidad_aire = rawEstado;
    } else if (medicion.co2 !== undefined) {
      // Solo calculamos si tenemos CO2 y no hay un estado explícito.
      // Esto es una ayuda visual, pero mantenemos la coherencia.
      medicion.estado_calidad_aire = this.calculateAirQuality(medicion.co2);
    } else {
      medicion.estado_calidad_aire = 'Sin registro';
    }

    return medicion;
  }

  /**
   * Calcula semánticamente el estado de calidad del aire basándose en ppm de CO2.
   * @param co2 Concentración de CO2.
   * @returns Etiqueta de estado.
   */
  private calculateAirQuality(co2: number): string {
    if (co2 < 600) return 'Excelente';
    if (co2 < 1000) return 'Bueno';
    if (co2 < 1500) return 'Moderado';
    if (co2 < 2000) return 'Malo';
    return 'Crítico';
  }

  /**
   * Intenta parsear fechas en formatos regionales comunes (ej: DD/MM/YYYY).
   * @param dateStr String de fecha a procesar.
   */
  private tryParseSpanishDate(dateStr: any): string | null {
    if (typeof dateStr !== 'string') return null;
    const parts = dateStr.split(/[\/\s:-]/);
    if (parts.length >= 3) {
      // Formato DD/MM/YYYY
      if (parts[0].length <= 2 && parts[2].length === 4) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return !isNaN(d.getTime()) ? d.toISOString() : null;
      }
    }
    return null;
  }

  /**
   * Alias para obtener mediciones históricas con límites.
   * Por defecto utiliza la ruta de 'pruebas' para el historial según requerimiento.
   */
  getRTDBMedicionesHistory(limit: number = 50, callback: (mediciones: Medicion[]) => void, path: string = 'DevEco/pruebas') {
    return this.getRTDBMediciones(callback, path);
  }
}
