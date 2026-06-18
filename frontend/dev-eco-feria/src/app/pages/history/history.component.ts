import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../layout/navbar.component';
import { FooterComponent } from '../../layout/footer.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="history-container">
      <section class="history-header animate-fade-in">
        <span class="view-subtitle">Nuestra Trayectoria</span>
        <h2>La Historia detrás de Eco-Dev</h2>
        <div class="divider"></div>
        <p class="history-intro">
          Desde la identificación de una problemática ambiental crítica hasta la consolidación de una solución tecnológica innovadora.
        </p>
      </section>

      <div class="timeline">
        <div class="timeline-line"></div>
        
        <!-- Fase 1: El Problema -->
        <div class="timeline-item left animate-fade-in" style="animation-delay: 0.2s;">
          <div class="timeline-dot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="timeline-content">
            <span class="timeline-date">Fase 1: El Desafío</span>
            <h3>La Problemática</h3>
            <p>
              Observamos una creciente degradación ambiental en entornos urbanos y agrícolas debido a la falta de monitoreo preciso de variables críticas como la calidad del aire, la humedad del suelo y la temperatura. Las soluciones existentes eran costosas, poco escalables o de difícil acceso para la comunidad.
            </p>
            <div class="timeline-visual">
              <div class="problem-animation">
                <div class="particle p1"></div>
                <div class="particle p2"></div>
                <div class="particle p3"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fase 2: Investigación -->
        <div class="timeline-item right animate-fade-in" style="animation-delay: 0.4s;">
          <div class="timeline-dot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div class="timeline-content">
            <span class="timeline-date">Fase 2: El Análisis</span>
            <h3>Investigación y Desarrollo</h3>
            <p>
              Iniciamos un proceso profundo de investigación sobre sensores IoT, protocolos de comunicación y análisis de datos. Realizamos pruebas de campo utilizando microcontroladores y simulaciones en entornos como Wokwi para validar la precisión de las mediciones y la robustez del sistema bajo diferentes condiciones climáticas.
            </p>
            <div class="timeline-visual">
              <div class="research-animation">
                <svg class="search-svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-dasharray="200" stroke-dashoffset="200"></circle>
                  <circle cx="50" cy="50" r="5" fill="var(--color-accent)"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Fase 3: Propuesta -->
        <div class="timeline-item left animate-fade-in" style="animation-delay: 0.6s;">
          <div class="timeline-dot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div class="timeline-content">
            <span class="timeline-date">Fase 3: El Nacimiento</span>
            <h3>Nuestra Propuesta: Eco-Dev</h3>
            <p>
              Diseñamos una red de microestaciones inteligentes modulares, capaces de recolectar datos en tiempo real y transmitirlos a una plataforma centralizada. Nuestra solución combina hardware de bajo costo con un dashboard intuitivo, permitiendo a los usuarios tomar decisiones informadas para la preservación del ecosistema.
            </p>
            <div class="timeline-visual">
              <div class="proposal-animation">
                <div class="node n1"></div>
                <div class="node n2"></div>
                <div class="node n3"></div>
                <div class="connection"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fase 4: Impacto -->
        <div class="timeline-item right animate-fade-in" style="animation-delay: 0.8s;">
          <div class="timeline-dot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="timeline-content">
            <span class="timeline-date">Fase 4: El Futuro</span>
            <h3>Visión e Impacto</h3>
            <p>
              Eco-Dev no es solo un proyecto técnico, es una herramienta para la educación ambiental y el desarrollo sostenible. Buscamos democratizar el acceso a la información ambiental, empoderando a las comunidades para proteger su entorno a través de la tecnología y la ciencia ciudadana.
            </p>
            <div class="timeline-visual">
              <div class="impact-animation">
                <div class="globe-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="interactive-callout animate-fade-in" style="animation-delay: 1s;">
        <h3>¿Quieres conocer los datos en tiempo real?</h3>
        <p>Explora nuestras microestaciones activas y descubre cómo estamos transformando el monitoreo ambiental.</p>
        <button class="primary-btn" routerLink="/dashboard">Ver Dashboard</button>
      </section>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .history-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--padding-base);
      overflow-x: hidden;
    }

    .history-header {
      text-align: center;
      margin-bottom: 5rem;
    }

    .timeline {
      position: relative;
      max-width: 1000px;
      margin: 4rem auto;
      padding: 2rem 0;
    }

    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, transparent, var(--color-accent), transparent);
      transform: translateX(-50%);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 6rem;
      width: 50%;
      padding: 0 3rem;
    }

    .timeline-item.left { left: 0; text-align: right; }
    .timeline-item.right { left: 50%; text-align: left; }

    .timeline-dot {
      position: absolute;
      top: 0;
      width: 48px;
      height: 48px;
      background: var(--color-base);
      border: 2px solid var(--color-accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent);
      z-index: 10;
      box-shadow: 0 0 20px rgba(100, 255, 218, 0.2);
      transition: var(--transition-smooth);
    }

    .timeline-item.left .timeline-dot { right: -24px; }
    .timeline-item.right .timeline-dot { left: -24px; }

    .timeline-item:hover .timeline-dot {
      transform: scale(1.2) rotate(360deg);
      background: var(--color-accent);
      color: var(--color-base);
      box-shadow: 0 0 30px var(--color-accent);
    }

    .timeline-content {
      background: var(--color-panel-bg);
      border: 1px solid var(--color-border);
      padding: 2rem;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      transition: var(--transition-smooth);
    }

    .timeline-content:hover {
      transform: translateY(-10px);
      border-color: var(--color-accent);
      box-shadow: 0 10px 30px rgba(100, 255, 218, 0.1);
    }

    .timeline-date {
      display: block;
      color: var(--color-accent);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 1rem;
    }

    .timeline-content h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .timeline-content p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.7;
    }

    .timeline-visual {
      margin-top: 2rem;
      height: 120px;
      background: rgba(100, 255, 218, 0.05);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* Animations */
    .problem-animation {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .particle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ff4d4d;
      border-radius: 50%;
      filter: blur(2px);
    }
    .p1 { top: 20%; left: 30%; animation: float 3s infinite; }
    .p2 { top: 60%; left: 70%; animation: float 4s infinite 1s; }
    .p3 { top: 40%; left: 50%; animation: float 5s infinite 2s; }

    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
      50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
    }

    .research-animation .search-svg {
      width: 80px;
      height: 80px;
      animation: rotate 10s linear infinite;
    }
    .research-animation .search-svg circle:first-child {
      animation: dash 2s ease-in-out infinite;
    }

    @keyframes rotate { to { transform: rotate(360deg); } }
    @keyframes dash {
      0% { stroke-dashoffset: 200; }
      50% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -200; }
    }

    .proposal-animation {
      position: relative;
      width: 150px;
      height: 60px;
    }
    .node {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--color-accent);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--color-accent);
    }
    .n1 { left: 0; top: 50%; animation: pulse-node 2s infinite; }
    .n2 { left: 50%; top: 50%; transform: translateX(-50%); animation: pulse-node 2s infinite 0.5s; }
    .n3 { right: 0; top: 50%; animation: pulse-node 2s infinite 1s; }
    .connection {
      position: absolute;
      top: 55%;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to right, var(--color-accent), transparent, var(--color-accent));
      background-size: 200% 100%;
      animation: flow 2s linear infinite;
    }

    @keyframes pulse-node {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.5); opacity: 1; }
    }
    @keyframes flow {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }

    .impact-animation {
      width: 60px;
      height: 60px;
      background: var(--color-accent);
      border-radius: 50%;
      position: relative;
      animation: glow-pulse 3s infinite;
    }
    .globe-glow {
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 2px solid var(--color-accent);
      border-radius: 50%;
      animation: expand-glow 3s infinite;
    }

    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 10px var(--color-accent); }
      50% { box-shadow: 0 0 40px var(--color-accent); }
    }
    @keyframes expand-glow {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    .interactive-callout {
      text-align: center;
      margin: 8rem 0;
      padding: 4rem 2rem;
      background: var(--color-accent-subtle);
      border-radius: 24px;
      border: 1px solid var(--color-border);
    }

    .interactive-callout h3 { margin-bottom: 1rem; }
    .interactive-callout p { margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }

    @media (max-width: 768px) {
      .timeline-line { left: 30px; }
      .timeline-item { width: 100%; padding-left: 80px; padding-right: 0; text-align: left !important; }
      .timeline-item.right { left: 0; }
      .timeline-dot { left: 6px !important; right: auto !important; }
      .timeline-content { padding: 1.5rem; }
    }
  `]
})
export class HistoryComponent {}
