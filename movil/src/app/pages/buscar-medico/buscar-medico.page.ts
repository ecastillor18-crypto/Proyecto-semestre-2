import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonChip, IonContent, IonHeader, IonIcon, IonLabel, IonRefresher, IonRefresherContent,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, personOutline, searchOutline } from 'ionicons/icons';
import { Doctor, Especialidad } from '../../core/models/doctor.models';
import { DoctorService } from '../../core/services/doctor.service';
import { mensajeError } from '../../core/utils/mensaje-error';

@Component({
  selector: 'app-buscar-medico',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonChip, IonLabel, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonSpinner,
    IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Buscar médico</ion-title></ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- filtro por especialidad -->
      @if (especialidades().length > 0) {
        <div class="filtros">
          <ion-chip
            [outline]="especialidadSel() !== null"
            [color]="especialidadSel() === null ? 'primary' : 'medium'"
            (click)="filtrar(null)"
          >
            <ion-label>Todas</ion-label>
          </ion-chip>
          @for (esp of especialidades(); track esp.id) {
            <ion-chip
              [outline]="especialidadSel() !== esp.id"
              [color]="especialidadSel() === esp.id ? 'primary' : 'medium'"
              (click)="filtrar(esp.id)"
            >
              <ion-label>{{ esp.nombre }}</ion-label>
            </ion-chip>
          }
        </div>
      }

      <div class="contenido">
        @if (cargando()) {
          <div class="estado">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Cargando médicos...</p>
          </div>
        } @else if (error()) {
          <div class="estado">
            <ion-icon name="alert-circle-outline" class="grande"></ion-icon>
            <p>{{ error() }}</p>
            <ion-button (click)="cargar()">Reintentar</ion-button>
          </div>
        } @else if (doctores().length === 0) {
          <div class="estado">
            <ion-icon name="search-outline" class="grande"></ion-icon>
            <p>No hay médicos disponibles para esta especialidad.</p>
            @if (especialidadSel() !== null) {
              <ion-button fill="outline" (click)="filtrar(null)">Ver todos</ion-button>
            }
          </div>
        } @else {
          @for (doc of doctores(); track doc.id) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ doc.nombreCompleto || 'Médico' }}</ion-card-title>
                <ion-card-subtitle>
                  Colegiado {{ doc.numeroColegiado || 'N/D' }} ·
                  {{ doc.aniosExperiencia ?? 0 }} años de experiencia
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="especialidades">
                  @for (esp of doc.especialidades; track esp.id) {
                    <ion-chip color="primary"><ion-label>{{ esp.nombre }}</ion-label></ion-chip>
                  }
                </div>
                @if (doc.biografia) {
                  <p class="bio">{{ doc.biografia }}</p>
                }
                <div class="acciones">
                  <ion-button fill="outline" size="small" (click)="verDetalle(doc)">
                    <ion-icon slot="start" name="person-outline"></ion-icon>
                    Ver detalle
                  </ion-button>
                  <ion-button size="small" (click)="elegir(doc)">Elegir médico</ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .filtros { display: flex; overflow-x: auto; padding: 8px 12px 0; white-space: nowrap; }
    .filtros ion-chip { flex: 0 0 auto; cursor: pointer; }
    .contenido { padding-bottom: 16px; }
    .estado { text-align: center; padding: 48px 24px; color: #666; }
    .grande { font-size: 48px; }
    .especialidades { margin: 0 -4px 4px; }
    .bio {
      margin: 8px 0 0; color: #555;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .acciones { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
  `],
})
export class BuscarMedicoPage implements OnInit {
  private service = inject(DoctorService);
  private router = inject(Router);

  doctores = signal<Doctor[]>([]);
  especialidades = signal<Especialidad[]>([]);
  especialidadSel = signal<number | null>(null);
  cargando = signal(false);
  error = signal('');

  constructor() {
    addIcons({ alertCircleOutline, personOutline, searchOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    const filtro = this.especialidadSel();

    this.service.listar(filtro).subscribe({
      next: (lista) => {
        this.doctores.set(lista);
        // las especialidades salen de la lista completa, no de la filtrada
        if (filtro === null) {
          this.especialidades.set(this.service.extraerEspecialidades(lista));
        }
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  filtrar(especialidadId: number | null): void {
    if (this.especialidadSel() === especialidadId) return;
    this.especialidadSel.set(especialidadId);
    this.cargar();
  }

  refrescar(evento: Event): void {
    this.service.listar(this.especialidadSel()).subscribe({
      next: (lista) => {
        this.doctores.set(lista);
        this.error.set('');
        (evento as CustomEvent).detail.complete();
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        (evento as CustomEvent).detail.complete();
      },
    });
  }

  verDetalle(doc: Doctor): void {
    this.router.navigate(['/tabs/buscar-medico/medico', doc.id]);
  }

  // pasa el medicoId a la pantalla de disponibilidad (Persona 3)
  elegir(doc: Doctor): void {
    this.router.navigate(['/tabs/disponibilidad', doc.id]);
  }
}
