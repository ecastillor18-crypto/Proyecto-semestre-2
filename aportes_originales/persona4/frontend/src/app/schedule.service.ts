import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  role: string;
}

export interface Doctor {
  id: number;
  nombreCompleto: string;
  email: string;
}

export type ScheduleState = 'DISPONIBLE' | 'RESERVADO' | 'CANCELADO';

export interface ScheduleSlot {
  id: number;
  medico: { id: number };
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: ScheduleState;
}

export interface SchedulePayload {
  medico: { id: number };
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: ScheduleState;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/v1/auth/login`, { email, password });
  }

  listDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/api/v1/doctors`);
  }

  listSchedules(token: string): Observable<ScheduleSlot[]> {
    return this.http.get<ScheduleSlot[]>(`${this.apiUrl}/api/horarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  createSchedule(token: string, schedule: SchedulePayload): Observable<ScheduleSlot> {
    return this.http.post<ScheduleSlot>(`${this.apiUrl}/api/horarios`, schedule, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateSchedule(token: string, id: number, schedule: SchedulePayload): Observable<ScheduleSlot> {
    return this.http.put<ScheduleSlot>(`${this.apiUrl}/api/horarios/${id}`, schedule, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}