import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CitaPaciente } from '../../models/cita.model';
import { CitaPacienteService } from '../../services/cita-paciente.service';
import { mensajeApi } from '../../utils/api-error.util';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  private readonly citaService = inject(CitaPacienteService);

  citas: CitaPaciente[] = [];
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(event?: CustomEvent): void {
    this.cargando = !event;
    this.error = '';

    this.citaService.historial().subscribe({
      next: citas => {
        this.citas = citas
          .filter(cita => cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA')
          .sort((a, b) => `${b.fecha}T${b.horaInicio}`.localeCompare(`${a.fecha}T${a.horaInicio}`));
        this.cargando = false;
        (event?.target as HTMLIonRefresherElement | undefined)?.complete?.();
      },
      error: err => {
        this.error = mensajeApi(err);
        this.cargando = false;
        (event?.target as HTMLIonRefresherElement | undefined)?.complete?.();
      },
    });
  }

  colorEstado(estado: string): 'success' | 'medium' {
    return estado === 'COMPLETADA' ? 'success' : 'medium';
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${fecha}T00:00:00Z`));
  }

  formatearHora(hora: string): string {
    return hora?.slice(0, 5) ?? '';
  }
}
