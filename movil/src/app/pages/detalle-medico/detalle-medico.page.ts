import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonIcon, IonLabel,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, calendarOutline } from 'ionicons/icons';
import { Doctor } from '../../core/models/doctor.models';
import { DoctorService } from '../../core/services/doctor.service';
import { mensajeError } from '../../core/utils/mensaje-error';

@Component({
  selector: 'app-detalle-medico',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon,
    IonChip, IonLabel, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/buscar-medico"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalle del médico</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="estado"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (error()) {
        <div class="estado">
          <ion-icon name="alert-circle-outline" class="grande"></ion-icon>
          <p>{{ error() }}</p>
          <ion-button (click)="cargar()">Reintentar</ion-button>
        </div>
      } @else if (doctor(); as doc) {
        <h1>{{ doc.nombreCompleto || 'Médico' }}</h1>

        <div class="especialidades">
          @for (esp of doc.especialidades; track esp.id) {
            <ion-chip color="primary"><ion-label>{{ esp.nombre }}</ion-label></ion-chip>
          }
        </div>

        <dl>
          <dt>Número de colegiado</dt>
          <dd>{{ doc.numeroColegiado || 'No disponible' }}</dd>
          <dt>Experiencia</dt>
          <dd>{{ doc.aniosExperiencia ?? 0 }} años</dd>
          <dt>Biografía</dt>
          <dd>{{ doc.biografia || 'Sin biografía registrada.' }}</dd>
        </dl>

        <ion-button expand="block" (click)="verDisponibilidad(doc)">
          <ion-icon slot="start" name="calendar-outline"></ion-icon>
          Ver disponibilidad
        </ion-button>
      }
    </ion-content>
  `,
  styles: [`
    h1 { margin-bottom: 4px; }
    .especialidades { margin: 0 -4px 8px; }
    dt { font-size: 13px; color: #666; margin-top: 16px; }
    dd { margin: 4px 0 0; }
    ion-button { margin-top: 28px; }
    .estado { text-align: center; padding: 48px 24px; color: #666; }
    .grande { font-size: 48px; }
  `],
})
export class DetalleMedicoPage implements OnInit {
  // viene de la ruta medico/:id (withComponentInputBinding)
  id = input.required<string>();

  private service = inject(DoctorService);
  private router = inject(Router);

  doctor = signal<Doctor | null>(null);
  cargando = signal(false);
  error = signal('');

  constructor() {
    addIcons({ alertCircleOutline, calendarOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const medicoId = Number(this.id());
    this.error.set('');

    // si venimos de la lista ya lo tengo, si no (recarga directa) pido la lista
    const enCache = this.service.obtenerEnCache(medicoId);
    if (enCache) {
      this.doctor.set(enCache);
      return;
    }

    this.cargando.set(true);
    this.service.listar().subscribe({
      next: () => {
        const encontrado = this.service.obtenerEnCache(medicoId);
        this.doctor.set(encontrado ?? null);
        if (!encontrado) this.error.set('No se encontró el médico solicitado.');
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  // pasa el medicoId a la pantalla de disponibilidad (Persona 3)
  verDisponibilidad(doc: Doctor): void {
    this.router.navigate(['/tabs/disponibilidad', doc.id]);
  }
}
