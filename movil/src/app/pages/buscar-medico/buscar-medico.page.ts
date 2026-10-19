import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-buscar-medico',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header><ion-toolbar><ion-title>Buscar médico</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <!-- esta pantalla la completa otra persona del equipo -->
      <p>Aquí va la búsqueda de médicos.</p>
    </ion-content>
  `,
})
export class BuscarMedicoPage {}
