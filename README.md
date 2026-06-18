# Eco-Dev: Red de Microestaciones Inteligentes

Bienvenido al repositorio oficial del proyecto **Eco-Dev**, una plataforma avanzada de monitoreo ambiental desarrollada para la **Feria de Ciencias 2026**.

---

## Sobre el Proyecto
Eco-Dev combina **hardware IoT** y **software web** para monitorear la calidad del aire en **tiempo real**. La aplicación visualiza telemetría ambiental, permite explorar histórico, exportar reportes y observar la distribución espacial mediante un mapa de calor.

---

## Objetivos
- **Monitoreo en Tiempo Real**: visualización instantánea de telemetría ambiental.
- **Alertas Tempranas**: identificación de picos de contaminación (**CO2, Humo, PM2.5**).
- **Accesibilidad**: interfaz responsiva y amigable para el usuario final.
- **Análisis de Datos**: exportación de historiales para estudios detallados.

---

## Stack Tecnológico
- **Frontend**: Angular 19 (**Signals, Standalone Components**).
- **Visualización**:
  - **Chart.js** (panel general y series temporales)
  - **Google Maps** (mapa de calor)
- **Backend / Datos**: Firebase
  - **Realtime Database (RTDB)**
  - **Cloud Firestore**
  - **Firebase Auth**
- **Estilos**: Vanilla CSS con enfoque **Mobile-First** y modo **claro/oscuro**.

---

## Rutas principales (Frontend)
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

> Nota: Esta documentación se actualiza para reflejar fielmente la implementación actual del frontend (rutas, modo offline/simulación, guía asistida y exportación).

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
