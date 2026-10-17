import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div>
        <span class="eyebrow">FASE 3</span>
        <h1>Panel administrativo</h1>
        <p>Gestiona usuarios, médicos, especialidades y horarios de atención.</p>
      </div>
    </div>

    <div class="card-grid">
      <a class="action-card" routerLink="/admin/usuarios"><strong>Usuarios</strong><span>Crear, editar, roles y estado.</span></a>
      <a class="action-card" routerLink="/admin/medicos"><strong>Médicos</strong><span>Perfil profesional y especialidades.</span></a>
      <a class="action-card" routerLink="/admin/especialidades"><strong>Especialidades</strong><span>Catálogo médico.</span></a>
      <a class="action-card" routerLink="/admin/horarios"><strong>Horarios</strong><span>Bloques de atención y agenda.</span></a>
    </div>
  `
})
export class DashboardComponent {}
