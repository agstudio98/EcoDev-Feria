# Eco-Dev: Red de Microestaciones Inteligentes

Bienvenido al repositorio oficial del proyecto **Eco-Dev**, una plataforma avanzada de monitoreo ambiental desarrollada para la **Feria de Ciencias 2026**.

---

## Sobre el Proyecto
Eco-Dev combina **hardware IoT** y **software web** para monitorear la calidad del aire en **tiempo real**. La aplicación visualiza telemetría ambiental, permite explorar históricos, exportar reportes y observar la distribución espacial mediante un mapa de calor.

---

## Objetivos
- **Monitoreo en Tiempo Real**: visualización instantánea de telemetría ambiental.
- **Alertas Tempranas**: identificación de picos de contaminación (**CO2, Humo, PM2.5**).
- **Accesibilidad**: interfaz responsiva y amigable para el usuario final.
- **Análisis de Datos**: exportación de historiales para estudios detallados.

---

## Stack Tecnológico
- **Frontend Principal**: Angular 19 (**Signals, Standalone Components**).
- **Componentes de Integración Alternativos**: React (**Hooks, onSnapshot**).
- **Visualización**:
  - **Chart.js** (panel general, series temporales y gráficos)
  - **Google Maps** (mapa de calor y geolocalización)
- **Backend / Datos**: Firebase
  - **Realtime Database (RTDB)** (canales de testing e históricos)
  - **Cloud Firestore** (colección de mediciones reales y persistencia de usuarios)
- **Estilos**: Vanilla CSS con enfoque **Mobile-First** y modo **oscuro premium** (glassmorphism).

---

## Integración de Firebase Firestore en Tiempo Real (React & Angular)

Hemos optimizado y agregado soporte de escucha reactiva tanto para la SPA de Angular como para implementaciones basadas en React:

### 1. Componente React en Tiempo Real
Se ha diseñado un módulo autónomo en `/frontend` para la integración rápida con React:
* **`MedicionesRealtime.jsx`**: Implementa `onSnapshot` de la SDK modular de Firestore para recibir actualizaciones de la colección `mediciones` en tiempo real. Cuenta con manejo de estado (`loading`, `error`), visualización en dos paneles (*lista de IDs a la izquierda y desglose de sensores a la derecha*), y limpieza correcta del listener (`unsubscribe`) al desmontar el componente.
* **`MedicionesRealtime.css`**: Hoja de estilos con efectos de desenfoque de fondo (*backdrop-filter*), animaciones de pulso y colores semánticos adaptados al nivel de CO2.
* **`firebaseConfig.js`**: Plantilla de inicialización de conexión a Firebase.

### 2. Sincronización Angular y Lógica de Negocio (`FirestoreService`)
* **Mapeo Robusto de Geolocalización**: Soporta campos alternativos del sensor (`latitud`/`longitud` de Río Cuarto y `lat`/`lng` estándar).
* **Parsea-Fechas en Español**: Implementa un parseador que preserva horas, minutos y segundos de cadenas regionales (`DD/MM/YYYY HH:MM:SS`), asegurando ordenamientos estables al segundo.
* **Coexistencia RTDB y Firestore**: Escucha tanto el canal real de Firestore como las rutas de testing de RTDB.
* **Ordenamiento del Historial**: La tabla de historial se ordena de forma cronológica ascendente (las lecturas más antiguas van en las primeras filas, denominándose correlativamente *Lectura 1*, *Lectura 2*, etc.).
* **Focalización en Lectura 1**: El panel de resumen de métricas principales, la actividad reciente y el mapa de calor de Córdoba se configuraron para visualizar la **Lectura 1** (la medición inicial) de cada estación.

---

## Rutas principales (Frontend Angular)
- `/` → Home
- `/equipo` → Quiénes Somos
- `/historia` → Historia
- `/auth/login` → Login
- `/dashboard` (protegida con `authGuard`) →
  - `/dashboard/general` (Panel General)
  - `/dashboard/history` (Historial y Reporte)
  - `/dashboard/heatmap` (Mapa de Calor)
- `/ajustes` (protegida con `authGuard`) → Perfil / Preferencias (incluye guía asistida)

---

## Documentación
1. **Documentación del Sistema**: `docs/DOCUMENTACION_SISTEMA.md`
2. **Guía de Instalación y Despliegue**: `docs/INSTALACION_Y_DESPLIEGUE.md`
3. **Manual de Usuario**: `docs/MANUAL_USUARIO.md`

---

## Equipo de Desarrollo
- Luciano Cañas: Desarrollo de Hardware & IoT.
- Lorena Pereyra: Scrum Master & QA Testing.
- Agustin Nicolas Gallardo Rios: Frontend Developer & Diseño UI.
- Agustin Tanno: Frontend Developer & Integración Web.
- Romina Huk: Ingeniería de Hardware & Sensores.
- Nancy Maribel Morales: Backend Developer & Arquitectura Cloud.
- Julieta Cabrera: Backend Developer & Firebase.

---

© 2026 Eco-Dev Team - Córdoba, Argentina.  
"Cuidando el aire que respiras."
