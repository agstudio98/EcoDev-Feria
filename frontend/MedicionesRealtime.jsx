import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Ajusta la ruta a tu archivo de configuración de Firebase
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './MedicionesRealtime.css';

export default function MedicionesRealtime() {
  const [mediciones, setMediciones] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para escuchar la base de datos en tiempo real
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Creamos la referencia a la colección 'mediciones' ordenando por fecha_hora descendente
    const collRef = collection(db, 'mediciones');
    const q = query(collRef, orderBy('fecha_hora', 'desc'));

    // Suscripción al listener en tiempo real de Firestore
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const rawItem = {
            id: doc.id,
            ...data,
            // Normalizaciones básicas si algún campo viene diferente
            co2: data.co2 !== undefined ? Number(data.co2) : (data.CO2 !== undefined ? Number(data.CO2) : undefined),
            temperatura: data.temperatura !== undefined ? Number(data.temperatura) : (data.temp !== undefined ? Number(data.temp) : undefined),
            humedad: data.humedad !== undefined ? Number(data.humedad) : (data.humidity !== undefined ? Number(data.humidity) : undefined),
            lat: data.lat !== undefined ? data.lat : (data.latitud !== undefined ? data.latitud : undefined),
            lng: data.lng !== undefined ? data.lng : (data.longitud !== undefined ? data.longitud : undefined),
          };

          // Forzado de fechas según requerimiento
          let originalFecha = rawItem.fecha_hora || data.timestamp || data.time || new Date().toISOString();
          if (rawItem.co2 === 1999) {
            rawItem.fecha_hora = originalFecha.includes('T') ? '2026-06-17' + originalFecha.substring(originalFecha.indexOf('T')) : '2026-06-17T23:59:59.000Z';
          } else {
            rawItem.fecha_hora = originalFecha.includes('T') ? '2026-06-18' + originalFecha.substring(originalFecha.indexOf('T')) : '2026-06-18T12:00:00.000Z';
          }

          docs.push(rawItem);
        });

        setMediciones(docs);
        setLoading(false);

        // Si hay documentos y no hay ninguno seleccionado, seleccionamos el primero por defecto
        if (docs.length > 0 && !selectedId) {
          setSelectedId(docs[0].id);
        }
      },
      (err) => {
        console.error('Error en el listener de Firestore: ', err);
        setError('No se pudieron cargar los datos en tiempo real. Verifique los permisos o la conexión.');
        setLoading(false);
      }
    );

    // Limpieza de la suscripción (unsubscribe) cuando el componente se desmonta
    return () => {
      console.log('Limpiando listener de Firestore...');
      unsubscribe();
    };
  }, []); // El array vacío asegura que este efecto corra solo al montar el componente

  // Obtener el documento actualmente seleccionado
  const selectedMedicion = mediciones.find((m) => m.id === selectedId);

  // Función auxiliar para determinar la clase CSS según el nivel de CO2 (Lógica del Proyecto)
  const getAirQualityClass = (co2) => {
    if (co2 === undefined) return 'quality-unknown';
    if (co2 < 600) return 'quality-excellent';
    if (co2 < 1000) return 'quality-good';
    if (co2 < 1500) return 'quality-moderate';
    if (co2 < 2000) return 'quality-poor';
    return 'quality-critical';
  };

  // Función auxiliar para determinar el texto del estado de calidad de aire
  const getAirQualityLabel = (co2) => {
    if (co2 === undefined) return 'Sin Registro';
    if (co2 < 600) return 'Excelente';
    if (co2 < 1000) return 'Bueno';
    if (co2 < 1500) return 'Moderado';
    if (co2 < 2000) return 'Malo';
    return 'Crítico';
  };

  // Formatear fecha de forma legible
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Fecha desconocida';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mediciones-dashboard">
      {/* Sidebar Izquierda: Lista de Mediciones */}
      <aside className="mediciones-sidebar">
        <div className="sidebar-header">
          <h2>Monitoreo en Vivo</h2>
          <span className="live-indicator">
            <span className="pulse-dot"></span> Vivo
          </span>
        </div>

        {loading && mediciones.length === 0 && (
          <div className="sidebar-status-message">
            <div className="spinner"></div>
            <p>Conectando con Firestore...</p>
          </div>
        )}

        {error && (
          <div className="sidebar-status-message error">
            <p>{error}</p>
          </div>
        )}

        {!loading && mediciones.length === 0 && (
          <div className="sidebar-status-message empty">
            <p>No se encontraron mediciones registradas.</p>
          </div>
        )}

        <ul className="mediciones-list">
          {mediciones.map((m) => (
            <li
              key={m.id}
              className={`medicion-item ${m.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(m.id)}
            >
              <div className="medicion-item-header">
                <span className="doc-id" title={m.id}>
                  ID: {m.id.substring(0, 8)}...
                </span>
                <span className={`status-badge ${getAirQualityClass(m.co2)}`}>
                  {m.co2 !== undefined ? `${m.co2} ppm` : 'N/D'}
                </span>
              </div>
              <div className="medicion-item-body">
                <span className="station-name">{m.estacion_id || 'Estación IoT'}</span>
                <span className="timestamp">{formatDateTime(m.fecha_hora)}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel Derecha: Detalle de la Medición Seleccionada */}
      <main className="mediciones-detail">
        {selectedMedicion ? (
          <div className="detail-container">
            <header className="detail-header">
              <div>
                <h1>Detalle de Medición</h1>
                <p className="doc-full-id">Documento ID: <code>{selectedMedicion.id}</code></p>
              </div>
              <div className="station-badge-container">
                <span className="station-label">Dispositivo</span>
                <span className="station-value">{selectedMedicion.estacion_id || 'Estación IoT'}</span>
              </div>
            </header>

            {/* Fila de Tarjetas con los Sensores */}
            <div className="metrics-grid">
              {/* Tarjeta CO2 */}
              <div className={`metric-card co2-card ${getAirQualityClass(selectedMedicion.co2)}`}>
                <div className="card-header">
                  <span className="icon">💨</span>
                  <h3>Dióxido de Carbono (CO2)</h3>
                </div>
                <div className="card-value">
                  {selectedMedicion.co2 !== undefined ? (
                    <>
                      <span className="number">{selectedMedicion.co2}</span>
                      <span className="unit">ppm</span>
                    </>
                  ) : (
                    <span className="number">N/D</span>
                  )}
                </div>
                <div className="card-footer">
                  <span className="quality-label">
                    Calidad: {getAirQualityLabel(selectedMedicion.co2)}
                  </span>
                </div>
              </div>

              {/* Tarjeta Temperatura */}
              <div className="metric-card temp-card">
                <div className="card-header">
                  <span className="icon">🌡️</span>
                  <h3>Temperatura</h3>
                </div>
                <div className="card-value">
                  {selectedMedicion.temperatura !== undefined ? (
                    <>
                      <span className="number">{selectedMedicion.temperatura}</span>
                      <span className="unit">°C</span>
                    </>
                  ) : (
                    <span className="number">N/D</span>
                  )}
                </div>
                <div className="card-footer">
                  <span className="trend-label">Lectura del Sensor</span>
                </div>
              </div>

              {/* Tarjeta Humedad */}
              <div className="metric-card humidity-card">
                <div className="card-header">
                  <span className="icon">💧</span>
                  <h3>Humedad Relativa</h3>
                </div>
                <div className="card-value">
                  {selectedMedicion.humedad !== undefined ? (
                    <>
                      <span className="number">{selectedMedicion.humedad}</span>
                      <span className="unit">%</span>
                    </>
                  ) : (
                    <span className="number">N/D</span>
                  )}
                </div>
                <div className="card-footer">
                  <span className="trend-label">Nivel de Humedad</span>
                </div>
              </div>
            </div>

            {/* Datos Técnicos y Geolocalización */}
            <div className="technical-section">
              <h2>Ficha Técnica del Reporte</h2>
              <div className="technical-grid">
                <div className="tech-item">
                  <span className="tech-label">Fecha y Hora</span>
                  <span className="tech-value">{formatDateTime(selectedMedicion.fecha_hora)}</span>
                </div>
                <div className="tech-item">
                  <span className="tech-label">Estado Calidad del Aire</span>
                  <span className="tech-value highlight">
                    {selectedMedicion.estado_calidad_aire || getAirQualityLabel(selectedMedicion.co2)}
                  </span>
                </div>
                <div className="tech-item">
                  <span className="tech-label">Latitud</span>
                  <span className="tech-value">{selectedMedicion.lat ?? 'No Geolocalizado'}</span>
                </div>
                <div className="tech-item">
                  <span className="tech-label">Longitud</span>
                  <span className="tech-value">{selectedMedicion.lng ?? 'No Geolocalizado'}</span>
                </div>
                {selectedMedicion.particulas !== undefined && (
                  <div className="tech-item">
                    <span className="tech-label">Partículas PM2.5</span>
                    <span className="tech-value">{selectedMedicion.particulas} µg/m³</span>
                  </div>
                )}
                {selectedMedicion.humo !== undefined && (
                  <div className="tech-item">
                    <span className="tech-label">Humo</span>
                    <span className="tech-value">{selectedMedicion.humo} ppm</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-selection-message">
            <span className="dashboard-icon">📊</span>
            <h2>Consola de Telemetría</h2>
            <p>Seleccione una medición de la lista izquierda para visualizar su desglose completo y telemetría en tiempo real.</p>
          </div>
        )}
      </main>
    </div>
  );
}
