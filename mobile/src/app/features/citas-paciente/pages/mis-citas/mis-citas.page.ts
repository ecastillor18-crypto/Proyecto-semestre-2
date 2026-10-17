import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CitaPaciente } from '../../models/cita.model';
import { CitaPacienteService } from '../../services/cita-paciente.service';
import { mensajeApi } from '../../utils/api-error.util';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './mis-citas.page.html',
  styleUrls: ['./mis-citas.page.scss'],
})
export class MisCitasPage implements OnInit {
  private readonly citaService = inject(CitaPacienteService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

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

    this.citaService.misCitas().subscribe({
      next: citas => {
        // “Mis citas” prioriza las citas pendientes. Si el backend devuelve todas,
        // se evita duplicar el historial en esta pantalla.
        this.citas = citas
          .filter(cita => cita.estado === 'PENDIENTE')
          .sort((a, b) => `${a.fecha}T${a.horaInicio}`.localeCompare(`${b.fecha}T${b.horaInicio}`));
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

  puedeCancelar(cita: CitaPaciente): boolean {
    return cita.estado === 'PENDIENTE';
  }

  async confirmarCancelacion(cita: CitaPaciente): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancelar cita',
      message: `¿Deseas cancelar tu cita con ${cita.medicoNombre} del ${this.formatearFecha(cita.fecha)}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: () => this.cancelar(cita),
        },
      ],
    });
    await alert.present();
  }

  private cancelar(cita: CitaPaciente): void {
    this.citaService.cancelar(cita.id).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Cita cancelada correctamente.',
          duration: 2200,
          position: 'bottom',
        });
        await toast.present();
        // Requisito : refrescar lista después de cancelar.
        this.cargar();
      },
      error: async err => {
        const toast = await this.toastController.create({
          message: mensajeApi(err),
          duration: 3200,
          position: 'bottom',
        });
        await toast.present();
      },
    });
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
