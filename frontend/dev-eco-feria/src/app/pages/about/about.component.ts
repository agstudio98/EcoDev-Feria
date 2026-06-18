import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../layout/navbar.component';
import { FooterComponent } from '../../layout/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="about-container">
      <section class="team-header animate-fade-in">
        <span class="view-subtitle">Eco-Dev</span>
        <h2>Integrantes del Proyecto</h2>
        <div class="divider"></div>
        <p class="about-intro">
          Somos un equipo de estudiantes de segundo y tercer año de la Tecnicatura Superior en Desarrollo de Software, 
          unidos por el compromiso con la innovación tecnológica y la Responsabilidad Social Empresaria.
        </p>
      </section>

      <div class="team-flex animate-fade-in" style="animation-delay: 0.2s;">
        <div class="member-card" *ngFor="let member of equipoFila1">
          <div class="avatar-wrapper">
            <div class="member-avatar">
              <img *ngIf="member.image" [src]="member.image" [alt]="member.name" class="avatar-img">
              <svg *ngIf="!member.image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <a *ngIf="member.linkedin" [href]="member.linkedin" target="_blank" class="linkedin-overlay" title="Ver perfil de LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
          <h3>{{member.name}}</h3>
          <span class="member-role">{{member.role}}</span>
        </div>
      </div>

      <div class="team-flex animate-fade-in" style="animation-delay: 0.3s; margin-bottom: 4rem;">
        <div class="member-card" *ngFor="let member of equipoFila2">
          <div class="avatar-wrapper">
            <div class="member-avatar">
              <img *ngIf="member.image" [src]="member.image" [alt]="member.name" class="avatar-img">
              <svg *ngIf="!member.image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <a *ngIf="member.linkedin" [href]="member.linkedin" target="_blank" class="linkedin-overlay" title="Ver perfil de LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
          <h3>{{member.name}}</h3>
          <span class="member-role">{{member.role}}</span>
        </div>
      </div>

      <section class="academic-journey animate-fade-in" style="animation-delay: 0.4s">
        <div class="journey-content">
          <div class="journey-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          </div>
          <div class="journey-text">
            <h3>Nuestra Formación Académica</h3>
            <p>
              Este proyecto es el resultado tangible de un proceso de aprendizaje continuo dentro de nuestra tecnicatura. 
              Consolidamos la interfaz y la lógica reactiva gracias a los <strong>conocimientos de Angular</strong> adquiridos en la cátedra de <strong>Fullstack</strong>, 
              mientras que la robustez en el manejo de información proviene de los <strong>módulos de Base de Datos</strong> cursados desde nuestro primer año. 
              Asimismo, la integración con el hardware y las simulaciones en <strong>Wokwi</strong> fueron posibles gracias a la materia 
              <strong>Aproximación al Mundo del Trabajo</strong>, que nos brindó las herramientas necesarias para conectar el código con el mundo físico de las microestaciones.
            </p>
          </div>
        </div>
      </section>

      <section class="mentors-section animate-fade-in" style="animation-delay: 0.5s">
        <div class="mentors-header">
          <h3>Profesores a Cargo</h3>
        </div>
        <div class="mentors-grid">
          <div class="mentor-card" *ngFor="let mentor of mentors">
            <h4>{{mentor.name}}</h4>
            <span>Cátedra de Práctica Profesionalizante I</span>
          </div>
        </div>
      </section>

      <section class="institution-section animate-fade-in" style="animation-delay: 0.6s">
        <div class="inst-content">
          <h3>Tecnicatura Superior en Desarrollo de Software</h3>
          <p>Feria de Ciencias, Tecnologías, Artes, Movimiento e Innovación “Alberto Maiztegui”</p>
          <span class="year">Córdoba, Argentina | 2026</span>
        </div>
      </section>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .avatar-wrapper {
      position: relative;
      width: 180px;
      height: 180px;
      margin: 0 auto 1.5rem;
    }
    .member-avatar {
      position: relative;
      overflow: hidden;
      border-radius: 50%;
      width: 100%;
      height: 100%;
      border: 3px solid var(--color-accent-soft);
      background: var(--color-panel-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .linkedin-overlay {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 36px;
      height: 36px;
      background: #0077b5;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      padding: 8px;
      z-index: 20;
      border: 2px solid var(--color-base);
    }
    .linkedin-overlay:hover {
      background: #00a0dc;
      transform: scale(1.15);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .linkedin-overlay svg {
      width: 100%;
      height: 100%;
    }

    .academic-journey {
      max-width: 900px;
      margin: 0 auto 4rem;
      background: rgba(100, 255, 218, 0.03);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 2.5rem;
      backdrop-filter: blur(10px);
    }
    .journey-content {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    .journey-icon {
      width: 64px;
      height: 64px;
      color: var(--color-accent);
      flex-shrink: 0;
      background: rgba(100, 255, 218, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
    }
    .journey-text h3 {
      margin-top: 0;
      color: var(--color-accent);
      font-size: 1.4rem;
      margin-bottom: 1rem;
    }
    .journey-text p {
      line-height: 1.7;
      color: var(--color-text-muted);
      margin: 0;
      font-size: 1.05rem;
      text-align: justify;
    }
    .journey-text strong {
      color: var(--color-text);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .journey-content { flex-direction: column; text-align: center; }
      .academic-journey { padding: 1.5rem; }
    }
  `]
})
/**
 * Componente que muestra la información sobre el equipo de desarrollo del proyecto Eco-Dev.
 */
export class AboutComponent {
  /** Primera fila del equipo de desarrollo, enfocada en hardware, QA y UI. */
  equipoFila1 = [
    { 
      name: 'Luciano Cañas', 
      role: 'Desarrollo de Hardware & IoT', 
      image: 'assets/Luciano_Cañas.jpeg',
      linkedin: 'https://www.linkedin.com/in/luciano-adolfo-canas/'
    },
    { 
      name: 'Lorena Pereyra', 
      role: 'Scrum Master & QA Testing', 
      image: 'assets/Lorena_Pereyra.jpeg',
      linkedin: 'https://www.linkedin.com/in/lorenapereyra2026/'
    },
    { 
      name: 'Agustin Nicolas Gallardo Rios', 
      role: 'Frontend Developer & Diseño UI', 
      image: 'assets/Agustin_Nicolas_Gallardo_Rios.jpeg',
      linkedin: 'https://www.linkedin.com/in/agustin-gallardo-922b461a1/'
    }
  ];

  /** Segunda fila del equipo de desarrollo, enfocada en frontend, hardware y backend. */
  equipoFila2 = [
    { 
      name: 'Agustin Tanno', 
      role: 'Frontend Developer & Integración Web', 
      image: 'assets/Agustin_Tanno.jpeg',
      linkedin: 'https://www.linkedin.com/in/agustin-tanno-6513542a9/'
    },
    { 
      name: 'Romina Huk', 
      role: 'Ingeniería de Hardware & Sensores', 
      image: 'assets/Romina_Huk.jpeg',
      linkedin: 'https://www.linkedin.com/in/romina-huk/'
    },
    { 
      name: 'Nancy Maribel Morales', 
      role: 'Backend Developer & Arquitectura Cloud', 
      image: 'assets/Nancy_Maribel_Morales.jpeg',
      linkedin: 'https://www.linkedin.com/in/nancy-morales-m'
    },
    { 
      name: 'Julieta Cabrera', 
      role: 'Backend Developer & Firebase', 
      image: 'assets/Julieta_Cabrera.jpeg',
      linkedin: 'https://www.linkedin.com/in/julieta-cabrera-45a0b1404/'
    }
  ];

  /** Lista de profesores que supervisan el proyecto. */
  mentors = [
    { name: 'Ing. Castro Fabiana' },
    { name: 'Lic. Giraudo Maximiliano' }
  ];
}