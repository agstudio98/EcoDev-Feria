import { Injectable, signal, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface GuideStep {
  selector: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Estado del guía
  isEnabled = computed(() => {
    const data = this.authService.userData();
    return data?.preferences?.guideEnabled !== false;
  });

  isVisible = signal(false);
  currentStepIndex = signal(0);
  steps = signal<GuideStep[]>([]);

  constructor() {
    // Escuchar cambios de ruta para sugerir guías específicas
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.autoLoadSteps(event.urlAfterRedirects);
    });
  }

  private autoLoadSteps(url: string) {
    this.isVisible.set(false);
    this.currentStepIndex.set(0);

    if (url.includes('/dashboard/general')) {
      this.steps.set([
        { 
          selector: '.view-header', 
          title: 'Panel General', 
          content: 'Bienvenido al centro de control. Aquí puedes ver el estado actual de todas tus microestaciones.', 
          position: 'bottom' 
        },
        { 
          selector: '.metrics-grid', 
          title: 'Métricas en Tiempo Real', 
          content: 'Estos paneles muestran los últimos datos recibidos de Temperatura, Humedad y Calidad del Aire.', 
          position: 'top' 
        },
        { 
          selector: '.actuators-list', 
          title: 'Control de Actuadores', 
          content: 'Aquí puedes ver si los extractores o alarmas están activos según los umbrales críticos.', 
          position: 'left' 
        }
      ]);
    } else if (url.includes('/dashboard/history')) {
      this.steps.set([
        { 
          selector: '.filters-bar', 
          title: 'Filtrado de Datos', 
          content: 'Utiliza el buscador o el selector de fechas para encontrar lecturas específicas en el historial.', 
          position: 'bottom' 
        },
        { 
          selector: '.table-container', 
          title: 'Reporte Detallado', 
          content: 'Aquí se listan todos los registros almacenados. Puedes exportarlos usando el botón superior.', 
          position: 'top' 
        }
      ]);
    } else if (url.includes('/ajustes')) {
      this.steps.set([
        { 
          selector: '.settings-sidebar', 
          title: 'Configuración', 
          content: 'Gestiona tu perfil, seguridad y preferencias del sistema aquí.', 
          position: 'right' 
        },
        { 
          selector: '.notif-item:last-child', 
          title: 'Activar/Desactivar Guía', 
          content: 'Si ya conoces la plataforma, puedes desactivar este asistente desde aquí.', 
          position: 'top' 
        }
      ]);
    } else if (url === '/' || url === '') {
      this.steps.set([
        { 
          selector: '.hero', 
          title: 'Eco-Dev', 
          content: 'Esta es nuestra plataforma de monitoreo ambiental inteligente.', 
          position: 'center' 
        },
        { 
          selector: '.nav-links li:nth-child(2)', 
          title: 'Nuestra Historia', 
          content: 'Haz clic aquí para conocer cómo nació este proyecto y la problemática que resolvemos.', 
          position: 'bottom' 
        }
      ]);
    } else {
      this.steps.set([]);
    }
  }

  startGuide() {
    if (this.steps().length > 0) {
      this.currentStepIndex.set(0);
      this.isVisible.set(true);
    }
  }

  nextStep() {
    if (this.currentStepIndex() < this.steps().length - 1) {
      this.currentStepIndex.update(i => i + 1);
    } else {
      this.closeGuide();
    }
  }

  prevStep() {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(i => i - 1);
    }
  }

  closeGuide() {
    this.isVisible.set(false);
  }

  async toggleGuidePreference(enabled: boolean) {
    await this.authService.updateUserData({
      preferences: { guideEnabled: enabled }
    });
  }
}
