import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header><ion-toolbar><ion-title>Historial</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <!-- esta pantalla la completa otra persona del equipo -->
      <p>Aquí va el historial médico.</p>
    </ion-content>
  `,
})
export class HistorialPage {}
