import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthModel } from '../models/auth.model';

const API_USERS_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {
  constructor(
    private http: HttpClient
  ) { }

  // public methods
  login(payload: any): Observable<any> {
    return this.http.post<AuthModel>(`${API_USERS_URL}/login`, payload);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${API_USERS_URL}/forgot-password?email=${email}`, {})
  }

  resetPassword(payload: any): Observable<any> {
    return this.http.post<any>(`${API_USERS_URL}/reset-password`, payload);
  }
  logoutData(): Observable<any> {
    return this.http.post<any>(`${API_USERS_URL}/logout`, {})
  }
}
