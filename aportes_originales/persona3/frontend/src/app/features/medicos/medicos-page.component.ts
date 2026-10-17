import { Component, OnInit } from '@angular/core';
import { MedicoAdmin } from '../../core/models/medico.model';
import { MedicoService } from '../../core/services/medico.service';

@Component({
  selector: 'app-medicos-page',
  standalone: true,
  template: `
    <section>
      <header class="page-header">
        <div>
          <h1>Médicos</h1>
          <p>Primer avance del módulo: consulta de perfiles médicos registrados.</p>
        </div>
      </header>

      @if (cargando) {
        <p>Cargando médicos...</p>
      }

      @if (errorMessage) {
        <p class="error-message">{{ errorMessage }}</p>
      }

      @if (!cargando && !errorMessage) {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Médico</th>
                <th>Colegiado</th>
                <th>Experiencia</th>
                <th>Especialidades</th>
              </tr>
            </thead>
            <tbody>
              @for (medico of medicos; track medico.id) {
                <tr>
                  <td>
                    <strong>{{ medico.nombreCompleto }}</strong><br>
                    <small>{{ medico.email }}</small>
                  </td>
                  <td>{{ medico.numeroColegiado }}</td>
                  <td>{{ medico.aniosExperiencia }} años</td>
                  <td>
                    @for (especialidad of medico.especialidades; track especialidad.id) {
                      <span>{{ especialidad.nombre }}</span>
                      @if (!$last) {, }
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4">No hay médicos registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `
})
export class MedicosPageComponent implements OnInit {
  medicos: MedicoAdmin[] = [];
  cargando = false;
  errorMessage = '';

  constructor(private medicoService: MedicoService) {}

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.errorMessage = '';

    this.medicoService.listarAdmin().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.cargando = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar los médicos.';
        this.cargando = false;
      }
    });
  }
}
