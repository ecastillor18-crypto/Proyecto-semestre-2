import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header><ion-toolbar><ion-title>Mis citas</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <!-- esta pantalla la completa otra persona del equipo -->
      <p>Aquí van las citas del paciente.</p>
    </ion-content>
  `,
})
export class MisCitasPage {}
