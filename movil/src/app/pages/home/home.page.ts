import { Component, inject } from '@angular/core';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarSesion()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Bienvenido</h2>
      <p>Sesión iniciada como {{ auth.sesion()?.email }}</p>
    </ion-content>
  `,
})
export class HomePage {
  auth = inject(AuthService);

  constructor() {
    addIcons({ logOutOutline });
  }

  async cerrarSesion(): Promise<void> {
    // borra la sesion guardada y vuelve al login
    await this.auth.logout();
  }
}
