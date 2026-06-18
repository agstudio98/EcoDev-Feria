import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ConnectivityService } from '../services/connectivity.service';

/**
 * Componente de la barra de navegación superior.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar animate-fade-in">
      <div class="navbar-container">
        <div class="brand" routerLink="/">
          <img src="assets/icon.jpg" alt="Eco-Dev Logo" class="logo-img">
          <div class="brand-text">
            <span class="brand-name">Eco-Dev</span>
            <span class="brand-tagline">Microestaciones Inteligentes</span>
          </div>
        </div>
        
        <button class="mobile-menu-toggle" (click)="toggleMenu()" aria-label="Toggle menu">
          <span class="hamburger" [class.open]="isMenuOpen"></span>
        </button>

        <ul class="nav-links" [class.mobile-open]="isMenuOpen">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Inicio</a></li>
          <li><a routerLink="/equipo" routerLinkActive="active" (click)="closeMenu()">Quiénes Somos</a></li>
          <li><a routerLink="/historia" routerLinkActive="active" (click)="closeMenu()">Historia</a></li>
          <li class="mobile-only">
            <div class="nav-cta">
              <div class="connectivity-wrapper">
                <span class="status-badge" [class.offline]="!connectivityService.isOnline()">
                  <span class="dot" [class.pulse]="connectivityService.isOnline()"></span> 
                  {{ connectivityService.isOnline() ? 'Red Online' : 'Modo Offline' }}
                </span>
                <label class="switch nav-switch" title="Simular desconexión">
                  <input type="checkbox" [checked]="connectivityService.isOnline()" (change)="connectivityService.toggleConnection()">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="nav-icons">
                <button (click)="themeService.toggleTheme()" class="icon-link theme-toggle" [title]="themeService.isDarkMode() ? 'Modo Día' : 'Modo Noche'">
                  <svg *ngIf="themeService.isDarkMode()" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  <svg *ngIf="!themeService.isDarkMode()" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
                <a [routerLink]="authService.isLoggedIn() ? '/dashboard' : '/auth/login'" (click)="closeMenu()" class="icon-link">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </a>
                <a [routerLink]="authService.isLoggedIn() ? '/ajustes' : '/auth/login'" (click)="closeMenu()" class="icon-link user-profile-link" title="Mi Perfil">
                  <span *ngIf="authService.isLoggedIn() && authService.userData()" class="user-name-nav">{{authService.userData().nombre}}</span>
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </a>
              </div>
            </div>
          </li>
        </ul>

        <div class="nav-cta desktop-only">
          <div class="connectivity-wrapper">
            <span class="status-badge" [class.offline]="!connectivityService.isOnline()">
              <span class="dot" [class.pulse]="connectivityService.isOnline()"></span> 
              {{ connectivityService.isOnline() ? 'Red Online' : 'Modo Offline' }}
            </span>
            <label class="switch nav-switch" title="Simular desconexión">
              <input type="checkbox" [checked]="connectivityService.isOnline()" (change)="connectivityService.toggleConnection()">
              <span class="slider"></span>
            </label>
          </div>
          <div class="nav-icons">
            <button (click)="themeService.toggleTheme()" class="icon-link theme-toggle" [title]="themeService.isDarkMode() ? 'Modo Día' : 'Modo Noche'">
              <svg *ngIf="themeService.isDarkMode()" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              <svg *ngIf="!themeService.isDarkMode()" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
            <a [routerLink]="authService.isLoggedIn() ? '/dashboard' : '/auth/login'" class="icon-link" [title]="authService.isLoggedIn() ? 'Dashboard' : 'Iniciar Sesión'">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </a>
            <a [routerLink]="authService.isLoggedIn() ? '/ajustes' : '/auth/login'" class="icon-link user-profile-link" [title]="authService.isLoggedIn() ? 'Mi Perfil' : 'Iniciar Sesión'">
              <span *ngIf="authService.isLoggedIn() && authService.userData()" class="user-name-nav desktop-only">{{authService.userData().nombre}}</span>
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  /** Servicio de autenticación para gestionar el estado de la sesión. */
  public authService = inject(AuthService);
  /** Servicio de tema para gestionar el modo claro/oscuro. */
  public themeService = inject(ThemeService);
  /** Servicio de conectividad para detectar estado offline. */
  public connectivityService = inject(ConnectivityService);
  
  /** Indica si el menú móvil está abierto. */
  isMenuOpen = false;

  /**
   * Alterna la visibilidad del menú móvil y gestiona el desplazamiento del cuerpo.
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScroll();
  }

  /**
   * Cierra el menú móvil y habilita el desplazamiento del cuerpo.
   */
  closeMenu() {
    this.isMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll() {
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
  }
}
