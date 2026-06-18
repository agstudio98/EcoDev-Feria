import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideService } from '../services/guide.service';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Botón Flotante para iniciar el guía si está habilitado -->
    <button 
      *ngIf="guideService.isEnabled() && !guideService.isVisible() && guideService.steps().length > 0" 
      (click)="guideService.startGuide()"
      class="guide-launcher animate-fade-in"
      title="Iniciar Guía"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      <span>¿Necesitas ayuda?</span>
    </button>

    <!-- Overlay y Modal del Guía -->
    <div *ngIf="guideService.isVisible()" class="guide-overlay animate-fade-in">
      <div class="guide-modal" [ngClass]="currentStep().position">
        <div class="guide-header">
          <div class="step-indicator">Paso {{guideService.currentStepIndex() + 1}} de {{guideService.steps().length}}</div>
          <button (click)="guideService.closeGuide()" class="close-btn">&times;</button>
        </div>
        
        <div class="guide-body">
          <h3>{{currentStep().title}}</h3>
          <p>{{currentStep().content}}</p>
        </div>

        <div class="guide-footer">
          <button 
            (click)="guideService.prevStep()" 
            [disabled]="guideService.currentStepIndex() === 0"
            class="guide-btn secondary"
          >Anterior</button>
          
          <button 
            (click)="guideService.nextStep()" 
            class="guide-btn primary"
          >
            {{guideService.currentStepIndex() === guideService.steps().length - 1 ? 'Finalizar' : 'Siguiente'}}
          </button>
        </div>
        
        <div class="guide-arrow"></div>
      </div>
    </div>
  `,
  styles: [`
    .guide-launcher {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 2000;
      background: var(--color-accent);
      color: var(--color-base);
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(100, 255, 218, 0.3);
      transition: var(--transition-smooth);
    }
    .guide-launcher:hover {
      transform: translateY(-5px) scale(1.05);
      background: #fff;
    }
    .guide-launcher svg { width: 24px; height: 24px; }

    .guide-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(2, 12, 27, 0.7);
      backdrop-filter: blur(4px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .guide-modal {
      background: var(--color-panel-bg);
      border: 1px solid var(--color-accent);
      width: 100%;
      max-width: 400px;
      border-radius: 16px;
      padding: 2rem;
      position: relative;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    .guide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .step-indicator {
      font-size: 0.75rem;
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    .close-btn:hover { color: #ff4d4d; }

    .guide-body h3 {
      color: var(--color-text);
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .guide-body p {
      color: var(--color-text-muted);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .guide-footer {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .guide-btn {
      flex: 1;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition-smooth);
      font-family: var(--font-heading);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .guide-btn.primary {
      background: var(--color-accent);
      color: var(--color-base);
      border: none;
    }
    .guide-btn.primary:hover { transform: translateY(-2px); filter: brightness(1.1); }

    .guide-btn.secondary {
      background: transparent;
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
    }
    .guide-btn.secondary:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
    .guide-btn.secondary:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Estilos para móviles */
    @media (max-width: 480px) {
      .guide-launcher span { display: none; }
      .guide-launcher { padding: 0.75rem; border-radius: 50%; }
      .guide-modal { margin: 1rem; }
    }
  `]
})
export class GuideComponent {
  public guideService = inject(GuideService);

  currentStep = computed(() => this.guideService.steps()[this.guideService.currentStepIndex()]);
}
