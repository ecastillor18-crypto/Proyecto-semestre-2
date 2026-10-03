import { Component } from '@angular/core';
import { ScheduleBoard } from './schedule-board';

@Component({
  selector: 'app-root',
  imports: [ScheduleBoard],
  template: '<app-schedule-board />'
})
export class App {}
