# Documentación Técnica - Proyecto Eco-Dev 2026

## 1. Introducción
El proyecto **Eco-Dev** es una Red de Microestaciones Inteligentes diseñada para el monitoreo de la calidad del aire en tiempo real. Utiliza tecnologías IoT para la recolección de datos y una plataforma web moderna para la visualización y análisis de la telemetría ambiental.

## 2. Arquitectura del Sistema
El sistema se basa en una arquitectura de cliente-servidor desacoplada:
- **Frontend**: Aplicación SPA (Single Page Application) desarrollada con **Angular 19**.
- **Backend/Backend-as-a-Service**: **Firebase**, utilizando:
  - **Realtime Database (RTDB)**: Para la recepción de telemetría de baja latencia desde los dispositivos IoT.
  - **Cloud Firestore**: Para la persistencia de datos históricos y failover.
  - **Firebase Auth**: Para la gestión de usuarios y seguridad.

## 3. Estructura del Proyecto Frontend
La aplicación sigue el patrón de diseño por componentes y servicios de Angular:

### 3.1. Servicios Principales (`src/app/services/`)
- **`FirestoreService`**: El corazón de la gestión de datos. Normaliza la información proveniente de RTDB y Firestore (incluyendo la normalización inteligente de IDs de estaciones), realiza estimaciones dinámicas de métricas faltantes, calcula la calidad del aire y expone señales reactivas (Signals) a los componentes.
- **`AuthService`**: Gestiona el ciclo de vida de la sesión del usuario mediante Firebase Auth.
- **`ConnectivityService`**: Detecta el estado de la conexión a internet y permite la simulación de modo offline mediante un interruptor manual.
- **`ThemeService`**: Gestiona la persistencia y el cambio entre temas claro y oscuro.
- **`ExportService`**: Utiliza `xlsx` para generar reportes descargables del historial de mediciones.

### 3.2. Vistas del Dashboard (`src/app/pages/dashboard/`)
- **Panel General**: Visualización en tiempo real con gráficos de Chart.js (ordenados cronológicamente de izquierda a derecha), indicadores de estado semánticos y selección de estaciones. Muestra los primeros reportes (Lectura 1) como resumen global para cada estación.
- **Historial y Reporte**: Tabla detallada de registros históricos ordenados de forma cronológica ascendente (las lecturas más antiguas van en las primeras filas, denominadas Lectura 1, Lectura 2, etc.), con selectores para filtrar dinámicamente por estación y estado, y capacidad de exportación a Excel/CSV.
- **Mapa de Calor**: Visualización geoespacial de la concentración de contaminantes enfocada en la Lectura 1 de cada estación.

## 4. Lógica de Calidad del Aire e Inteligencia de Datos

### 4.1. Clasificación del Estado del Aire
El sistema implementa un algoritmo de clasificación automática basado en niveles de CO2 (ppm):
- **Excelente**: < 600 ppm
- **Bueno**: 600 - 1000 ppm
- **Moderado**: 1000 - 1500 ppm
- **Malo**: 1500 - 2000 ppm
- **Crítico**: > 2000 ppm

Esta lógica está centralizada en `FirestoreService` para asegurar consistencia en toda la interfaz.

### 4.2. Normalización de Identificadores de Estación
Para garantizar consistencia con los datos provenientes de dispositivos IoT heterogéneos y RTDB, `FirestoreService` realiza una normalización automática de los IDs de estación:
- Si contiene texto relacionado con `"terminal"`, `"omnibus"` u `"ómnibus"`, se normaliza a `Terminal de Omnibus`.
- Si contiene texto relacionado con `"cordoba"`, `"córdoba"`, `"microestacion_01"` o `"microestación"`, se normaliza a `Cordoba Central`.

Las estaciones oficiales registradas son:
- **Plaza San Martín** (`plaza_san_martin`)
- **Av. Colón y Gral. Paz** (`av_colon_gral_paz`)
- **Estación Terminal de Ómnibus** (`Terminal de Omnibus`)
- **Cordoba central** (`Cordoba Central`)
- **Central de Río Cuarto** (`Rio Cuarto`)

### 4.3. Algoritmo de Estimación Dinámica de Métricas
En caso de pérdida de telemetría de ciertos sensores, `FirestoreService` implementa algoritmos de estimación para completar los registros:
- **Para Cordoba Central**: Si el valor de CO2 es faltante o inválido (<= 0), se estima dinámicamente utilizando la temperatura, humedad, humo y partículas de polvo mediante la fórmula:
  $$\text{CO2} = \max(400, \min(400 + (\text{humo} \times 3.5) + (\text{particulas} \times 4.8) + ((\text{temperatura} - 20) \times 5) - ((\text{humedad} - 50) \times 1.5), 2500))$$
- **Para las demás estaciones**: Si los valores de humo o partículas no están presentes, se estiman a partir de los niveles de CO2, temperatura y humedad:
  - **Humo (gases)**: $\max(5, \min(10 + (\text{excesoCO2} \times 0.12) + ((\text{temp} - 20) \times 0.5) - ((\text{hum} - 50) \times 0.2), 800))$
  - **Partículas (polvo)**: $\max(2, \min(8 + (\text{excesoCO2} \times 0.04) + ((\text{temp} - 20) \times 0.2) - ((\text{hum} - 50) \times 0.1), 150))$ (con precisión de un decimal).

## 5. Modelos de Datos
### Medicion
```typescript
export interface Medicion {
  id?: string;
  estacion_id: string;
  humo: number;
  temperatura: number;
  particulas: number;
  co2: number;
  humedad: number;
  estado_calidad_aire: string;
  fecha_hora: string;
  lat?: number;
  lng?: number;
}
```

## 6. Características Especiales
- **Modo Offline**: Implementado mediante un Toggle en el Navbar que permite probar la resiliencia de la app ante desconexiones.
- **Dashboard Reactivo**: Utiliza Angular Signals para actualizaciones instantáneas de la interfaz sin recargas de página cuando llegan nuevos datos IoT.
- **Responsividad Crítica**: Diseñado con un enfoque "Mobile-First" para ser consultado desde dispositivos móviles en plantas industriales o en el hogar.
