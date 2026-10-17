import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { CitaPaciente } from '../../models/cita.model';
import { CitaPacienteService } from '../../services/cita-paciente.service';
import { mensajeApi } from '../../utils/api-error.util';

@Component({
  selector: 'app-detalle-cita',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './detalle-cita.page.html',
  styleUrls: ['./detalle-cita.page.scss'],
})
export class DetalleCitaPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly navController = inject(NavController);
  private readonly citaService = inject(CitaPacienteService);

  cita: CitaPaciente | null = null;
  cargando = false;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'El identificador de la cita no es válido.';
      return;
    }
    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando = true;
    this.error = '';
    this.citaService.detallePropio(id).subscribe({
      next: cita => {
        this.cita = cita;
        this.cargando = false;
        if (!cita) this.error = 'No se encontró esta cita dentro de tus citas.';
      },
      error: err => {
        this.error = mensajeApi(err);
        this.cargando = false;
      },
    });
  }

  volver(): void {
    this.navController.back();
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${fecha}T00:00:00Z`));
  }

  formatearHora(hora: string): string {
    return hora?.slice(0, 5) ?? '';
  }
}
