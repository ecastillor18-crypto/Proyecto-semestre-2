import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendar, home, search, time } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home">
          <ion-icon name="home"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="buscar-medico">
          <ion-icon name="search"></ion-icon>
          <ion-label>Buscar médico</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="mis-citas">
          <ion-icon name="calendar"></ion-icon>
          <ion-label>Mis citas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="historial">
          <ion-icon name="time"></ion-icon>
          <ion-label>Historial</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    // registro los iconos que uso en la barra
    addIcons({ home, search, calendar, time });
  }
}
