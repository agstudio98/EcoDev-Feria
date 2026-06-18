import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { NavbarComponent } from '../../layout/navbar.component';
import { FooterComponent } from '../../layout/footer.component';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="settings-container animate-fade-in">
      <!-- Diálogo de Mensaje Custom -->
      <div *ngIf="messageService.message() as msg" class="custom-dialog" [class]="msg.type">
        <div class="dialog-content">
          <strong>{{msg.title}}</strong>
          <p>{{msg.text}}</p>
          <button (click)="messageService.clearMessage()">Cerrar</button>
        </div>
      </div>

      <div class="settings-grid">
        <aside class="settings-sidebar">
          <h3>Mi Perfil</h3>
          <nav class="settings-nav">
            <a (click)="setTab('personal')" [class.active]="activeTab() === 'personal'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon-sm"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Datos Personales
            </a>
            <a (click)="setTab('security')" [class.active]="activeTab() === 'security'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon-sm"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Seguridad
            </a>
            <a (click)="setTab('notifications')" [class.active]="activeTab() === 'notifications'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon-sm"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Notificaciones
            </a>
            <button (click)="logout()" class="logout-btn desktop-only">Cerrar Sesión</button>
            <button (click)="logout()" class="logout-btn-mobile mobile-only-flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon-sm"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Salir
            </button>
          </nav>
        </aside>

        <section class="settings-content">
          <div [ngSwitch]="activeTab()">
            <!-- Datos Personales -->
            <div *ngSwitchCase="'personal'">
              <header class="content-header">
                <h2>Datos Personales</h2>
                <p>Gestiona tu nombre de usuario en el sistema.</p>
              </header>

              <form (ngSubmit)="saveChanges()" class="settings-form">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" [(ngModel)]="localUserData.nombre" name="nombre" placeholder="Ej: Juan Pérez">
                </div>
                
                <div class="form-group">
                  <label>Email Asociado</label>
                  <input type="email" [value]="localUserData.email" disabled style="opacity: 0.6; cursor: not-allowed;">
                </div>

                <div class="form-actions">
                  <button type="submit" class="save-btn" [disabled]="saving()">
                    {{saving() ? 'Guardando...' : 'Guardar Cambios'}}
                  </button>
                </div>
              </form>
            </div>

            <!-- Seguridad -->
            <div *ngSwitchCase="'security'">
              <header class="content-header">
                <h2>Seguridad</h2>
                <p>Gestiona el acceso a tu cuenta cambiando tu contraseña.</p>
              </header>

              <div class="settings-form">
                <div class="security-card-stack">
                  <div class="form-group">
                    <label>Nueva Contraseña</label>
                    <input type="password" [(ngModel)]="newPasswordString" name="newPassword" placeholder="••••••••">
                  </div>
                  
                  <div class="form-group">
                    <label>Repetir Nueva Contraseña</label>
                    <input type="password" [(ngModel)]="repeatPasswordString" name="repeatPassword" placeholder="••••••••">
                  </div>

                  <div class="form-actions" style="margin-top: 1rem;">
                    <button (click)="handleUpdatePassword()" class="save-btn" [disabled]="saving() || !newPasswordString || newPasswordString !== repeatPasswordString">
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>

                <div class="security-divider">O también puedes</div>

                <div class="security-card">
                  <div class="security-info">
                    <h4>Recuperación por Email</h4>
                    <p>Te enviaremos un enlace para restablecerla de forma externa.</p>
                  </div>
                  <button (click)="requestPasswordReset()" class="secondary-btn" [disabled]="saving()">
                    Enviar correo
                  </button>
                </div>
              </div>
            </div>

            <!-- Notificaciones -->
            <div *ngSwitchCase="'notifications'">
              <header class="content-header">
                <h2>Preferencias del Sistema</h2>
                <p>Configura las alertas y el asistente de ayuda de la plataforma.</p>
              </header>

              <div class="settings-form">
                <div class="notification-options">
                  <div class="notif-item">
                    <div class="notif-info">
                      <h4>Detección de Datos</h4>
                      <p>Avisar cuando se reciban nuevas lecturas de los sensores.</p>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="localNotificationData.dataDetection" name="dataDetection">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="notif-item">
                    <div class="notif-info">
                      <h4>Alerta de Actuadores</h4>
                      <p>Notificar cuando un extractor o alarma se active por umbrales críticos.</p>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="localNotificationData.actuatorAlerts" name="actuatorAlerts">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="notif-item">
                    <div class="notif-info">
                      <h4>Asistente de Guía</h4>
                      <p>Mostrar el botón de ayuda y los tutoriales interactivos en cada sección.</p>
                    </div>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="localPreferences.guideEnabled" name="guideEnabled">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <button (click)="saveNotifications()" class="save-btn" [disabled]="saving()">
                    {{saving() ? 'Guardando...' : 'Guardar Preferencias'}}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .settings-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(1rem, 5vw, 3rem);
      min-height: calc(100vh - 160px);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 3rem;
      align-items: start;
    }

    .settings-sidebar {
      position: sticky;
      top: 100px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .settings-sidebar h3 {
      font-size: 1.5rem;
      color: var(--color-text);
      margin: 0;
      font-family: var(--font-heading);
    }

    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .settings-nav a {
      padding: 1rem 1.25rem;
      border-radius: 12px;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: var(--transition-smooth);
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
      font-weight: 500;
    }

    .settings-nav a:hover {
      background: rgba(100, 255, 218, 0.05);
      color: var(--color-accent);
      transform: translateX(5px);
    }

    .settings-nav a.active {
      background: rgba(100, 255, 218, 0.1);
      color: var(--color-accent);
      border-color: var(--color-accent);
      font-weight: 700;
    }

    .logout-btn {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 77, 77, 0.05);
      color: #ff4d4d;
      border: 1px solid rgba(255, 77, 77, 0.2);
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-family: var(--font-heading);
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: var(--transition-smooth);
    }

    .logout-btn:hover {
      background: rgba(255, 77, 77, 0.1);
      border-color: #ff4d4d;
    }

    .logout-btn-mobile {
      display: none;
      padding: 0.8rem 1.25rem;
      background: rgba(255, 77, 77, 0.1);
      color: #ff4d4d;
      border: 1px solid rgba(255, 77, 77, 0.3);
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      align-items: center;
      gap: 0.75rem;
      font-family: var(--font-heading);
      text-transform: uppercase;
      font-size: 0.8rem;
    }

    .mobile-only-flex { display: none; }
    .desktop-only { display: block; }

    .settings-content {
      background: var(--color-panel-bg);
      border: 1px solid var(--color-border);
      padding: clamp(1.5rem, 5vw, 3rem);
      border-radius: 20px;
      backdrop-filter: blur(20px);
    }

    .content-header {
      margin-bottom: 2.5rem;
    }

    .content-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: var(--color-accent);
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-group label {
      font-size: 0.85rem;
      color: var(--color-text);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-group input {
      background: var(--color-input-bg);
      border: 1px solid var(--color-border);
      padding: 1rem;
      border-radius: 8px;
      color: var(--color-text);
      outline: none;
      transition: var(--transition-smooth);
    }

    .form-group input:focus {
      border-color: var(--color-accent);
      background: var(--color-input-focus);
    }

    .save-btn {
      padding: 1rem 2.5rem;
      background: var(--color-accent);
      color: var(--color-base);
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-family: var(--font-heading);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      transition: var(--transition-smooth);
    }

    .save-btn:hover:not(:disabled) {
      background: #4cd3b0;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(100, 255, 218, 0.2);
    }

    .secondary-btn {
      padding: 1rem 2rem;
      background: transparent;
      color: var(--color-accent);
      border: 1px solid var(--color-accent);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .notification-options {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .notif-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      gap: 1.5rem;
    }

    .notif-info h4 { margin: 0 0 0.25rem 0; color: var(--color-text); }
    .notif-info p { margin: 0; font-size: 0.9rem; color: var(--color-text-muted); }

    .security-card-stack {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.02);
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }

    .security-divider {
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .security-divider::before, .security-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-border);
    }

    .security-card {
      background: rgba(255, 255, 255, 0.03);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    /* Media Queries */
    @media (max-width: 1024px) {
      .settings-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .settings-sidebar {
        position: relative;
        top: 0;
      }

      .settings-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        scrollbar-width: none;
      }

      .settings-nav::-webkit-scrollbar {
        display: none;
      }

      .settings-nav a {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .desktop-only {
        display: none !important;
      }

      .mobile-only-flex {
        display: flex !important;
        flex-shrink: 0;
      }
    }

    @media (max-width: 768px) {
      .notif-item {
        flex-direction: row;
        text-align: left;
      }

      .security-card {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .settings-container {
        padding: 1rem;
      }

      .settings-content {
        padding: 1.5rem;
      }

      .notif-item {
        padding: 1.25rem;
      }
      
      .notif-info h4 { font-size: 0.95rem; }
      .notif-info p { font-size: 0.8rem; }
    }
  `]
})
export class UserSettingsComponent {
  private authService = inject(AuthService);
  public messageService = inject(MessageService);
  private router = inject(Router);

  activeTab = signal<'personal' | 'security' | 'notifications'>('personal');
  
  // Datos locales para el formulario
  localUserData: any = {};
  localNotificationData: any = {
    dataDetection: true,
    actuatorAlerts: true
  };
  localPreferences: any = {
    guideEnabled: true
  };

  newPasswordString = '';
  repeatPasswordString = '';
  saving = signal(false);

  constructor() {
    // Sincronizar datos locales cuando cambian los datos del servicio
    effect(() => {
      const data = this.authService.userData();
      if (data) {
        this.localUserData = { ...data };
        if (data.notifications) {
          this.localNotificationData = {
            dataDetection: data.notifications.dataDetection !== undefined ? data.notifications.dataDetection : true,
            actuatorAlerts: data.notifications.actuatorAlerts !== undefined ? data.notifications.actuatorAlerts : true
          };
        }
        if (data.preferences) {
          this.localPreferences = {
            guideEnabled: data.preferences.guideEnabled !== undefined ? data.preferences.guideEnabled : true
          };
        }
      }
    });
  }

  setTab(tab: 'personal' | 'security' | 'notifications') {
    this.activeTab.set(tab);
    this.messageService.clearMessage();
  }

  async saveChanges() {
    this.saving.set(true);
    try {
      await this.authService.updateUserData({
        nombre: this.localUserData.nombre
      });
      this.messageService.showMessage('Éxito', 'Nombre actualizado correctamente.', 'success');
    } catch (error) {
      console.error(error);
      this.messageService.showMessage('Error', 'No se pudieron guardar los cambios.', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  async requestPasswordReset() {
    this.saving.set(true);
    try {
      await this.authService.sendPasswordReset();
      this.messageService.showMessage('Correo Enviado', 'Revisa tu bandeja de entrada para cambiar tu contraseña.', 'success');
    } catch (error) {
      this.messageService.showMessage('Error', 'No se pudo enviar el correo de recuperación.', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  async handleUpdatePassword() {
    if (this.newPasswordString !== this.repeatPasswordString) {
      this.messageService.showMessage('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    this.saving.set(true);
    try {
      await this.authService.updatePassword(this.newPasswordString);
      this.messageService.showMessage('Éxito', 'Contraseña actualizada correctamente.', 'success');
      this.newPasswordString = '';
      this.repeatPasswordString = '';
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        this.messageService.showMessage('Seguridad', 'Para cambiar tu contraseña debes haber iniciado sesión recientemente.', 'info');
      } else {
        this.messageService.showMessage('Error', 'No se pudo actualizar la contraseña.', 'error');
      }
    } finally {
      this.saving.set(false);
    }
  }

  async saveNotifications() {
    this.saving.set(true);
    try {
      await this.authService.updateUserData({
        notifications: this.localNotificationData,
        preferences: this.localPreferences
      });
      this.messageService.showMessage('Éxito', 'Preferencias guardadas correctamente.', 'success');
    } catch (error) {
      this.messageService.showMessage('Error', 'No se pudieron guardar las preferencias.', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }
}
