import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <aside>
        <h2>Citas Médicas</h2>
        <nav>
          @if (auth.rol() === 'ROLE_ADMIN') {
            <span class="zona">Administrador</span>
            <a routerLink="/admin/dashboard" routerLinkActive="activo">Dashboard</a>
            <a routerLink="/admin/usuarios" routerLinkActive="activo">Usuarios</a>
          }
          @if (auth.rol() === 'ROLE_DOCTOR') {
            <span class="zona">Doctor</span>
            <a routerLink="/doctor/agenda" routerLinkActive="activo">Mi agenda</a>
            <a routerLink="/doctor/citas" routerLinkActive="activo">Mis citas</a>
          }
          @if (auth.rol() === 'ROLE_PATIENT') {
            <span class="zona">Paciente</span>
            <a routerLink="/paciente/citas" routerLinkActive="activo">Mis citas</a>
          }
        </nav>
      </aside>

      <div class="derecha">
        <header>
          <span>{{ auth.sesion()?.nombre }} <small>({{ etiquetaRol() }})</small></span>
          <button (click)="auth.logout()">Cerrar sesión</button>
        </header>
        <main><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    .app { display: flex; min-height: 100vh; }
    aside { width: 220px; background: #1d3557; color: #fff; padding: 1rem; }
    aside h2 { font-size: 1.1rem; margin-top: 0; }
    nav { display: flex; flex-direction: column; gap: .3rem; }
    .zona { font-size: .75rem; text-transform: uppercase; opacity: .7; margin-top: .8rem; }
    nav a { color: #fff; text-decoration: none; padding: .5rem .6rem; border-radius: 6px; }
    nav a.activo, nav a:hover { background: rgba(255,255,255,.18); }
    .derecha { flex: 1; display: flex; flex-direction: column; }
    header { display: flex; justify-content: space-between; align-items: center;
             padding: .8rem 1.2rem; background: #fff; border-bottom: 1px solid #dde; }
    header button { padding: .4rem .8rem; cursor: pointer; }
    main { padding: 1.5rem; background: #f6f8fb; flex: 1; }
  `],
})
export class MainLayoutComponent {
  auth = inject(AuthService);

  etiquetaRol(): string {
    switch (this.auth.rol()) {
      case 'ROLE_ADMIN': return 'Administrador';
      case 'ROLE_DOCTOR': return 'Doctor';
      case 'ROLE_PATIENT': return 'Paciente';
      default: return '';
    }
  }
}
