import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonItem, IonInput, IonButton, IonSpinner
} from '@ionic/angular/standalone';
import { HorariosService } from '../core/horarios.service';
import { HorarioDisponible } from '../core/models';
import { errorTexto, fechaBonita, horaBonita, fechaLocalHoy } from '../core/utils';
import { fechaISOValida } from '../core/fecha-valida';

// FASE 4 — PERSONA 3: disponibilidad por médico y fecha.
@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent, IonItem, IonInput,
    IonButton, IonSpinner],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/app/medicos"/></ion-buttons>
      <ion-title>Horarios disponibles</ion-title>
    </ion-toolbar></ion-header>
    <ion-content><div class="page-wrap">
      <h1 class="page-title">Elige una fecha</h1>
      <p class="page-subtitle">Selecciona un día para ver la disponibilidad del médico.</p>
      <ion-card><ion-card-content>
        <ion-item>
          <ion-input label="Fecha" labelPlacement="stacked" type="date"
            [value]="fecha()" [min]="hoy" (ionChange)="cambiarFecha($event.detail.value)"/>
        </ion-item>
        <ion-button expand="block" (click)="consultar()" [disabled]="cargando()">
          Consultar disponibilidad
        </ion-button>
      </ion-card-content></ion-card>
      @if (cargando()) { <div class="state"><ion-spinner/> Consultando horarios…</div> }
      @if (error()) { <div class="state error" role="alert">{{error()}}</div> }
      @if (consultaRealizada() && !cargando() && !error() && !horarios().length) {
        <div class="state">No hay horarios disponibles en esta fecha.</div>
      }
      @for (h of horarios(); track h.id) {
        <ion-card><ion-card-content><div class="list-row">
          <div>
            <strong>{{horaBonita(h.horaInicio)}} – {{horaBonita(h.horaFin)}}</strong>
            <p class="meta">{{fechaBonita(h.fecha)}} · {{h.nombreMedico}}</p>
          </div>
          <ion-button (click)="seleccionar(h)">Elegir</ion-button>
        </div></ion-card-content></ion-card>
      }
    </div></ion-content>
  `
})
export class DisponibilidadPage implements OnInit, OnDestroy {
  private readonly api = inject(HorariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private consultaActiva?: Subscription;
  medicoId = 0;
  readonly hoy = fechaLocalHoy();
  fecha = signal(this.hoy);
  horarios = signal<HorarioDisponible[]>([]);
  consultaRealizada = signal(false);
  cargando = signal(false);
  error = signal('');
  fechaBonita = fechaBonita;
  horaBonita = horaBonita;

  ngOnInit(): void {
    this.medicoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.medicoId) || this.medicoId <= 0) {
      this.error.set('Médico inválido.');
      return;
    }
    this.consultar();
  }

  ngOnDestroy(): void { this.consultaActiva?.unsubscribe(); }

  cambiarFecha(value: string | string[] | null | undefined): void {
    this.consultaActiva?.unsubscribe();
    this.cargando.set(false);
    this.fecha.set(typeof value === 'string' ? value : '');
    this.horarios.set([]);
    this.consultaRealizada.set(false);
    this.error.set('');
  }

  consultar(): void {
    const fecha = this.fecha();
    if (!this.medicoId || !fechaISOValida(fecha) || fecha < fechaLocalHoy()) {
      this.error.set('Selecciona una fecha válida que no esté en el pasado.');
      return;
    }
    this.consultaActiva?.unsubscribe();
    this.cargando.set(true);
    this.error.set('');
    this.horarios.set([]);
    this.consultaRealizada.set(false);
    this.consultaActiva = this.api.disponibles(this.medicoId, fecha).subscribe({
      next: lista => {
        this.horarios.set(lista.filter(h => h.estado === 'DISPONIBLE' && h.fecha === fecha && h.medicoId === this.medicoId));
        this.cargando.set(false);
        this.consultaRealizada.set(true);
      },
      error: error => {
        this.error.set(errorTexto(error));
        this.cargando.set(false);
        this.consultaRealizada.set(true);
      }
    });
  }

  seleccionar(horario: HorarioDisponible): void {
    // Contrato con Persona 4: horarioId va en la ruta; medicoId y fecha como query params.
    void this.router.navigate(['/app/reservar', horario.id], {
      queryParams: { medicoId: this.medicoId, fecha: this.fecha() }
    });
  }
}
