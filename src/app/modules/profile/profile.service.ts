import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// const API_USERS_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  API_USERS_URL = `${environment.apiUrl}`;
  constructor(private http: HttpClient) { }


  // changePassword(current: string, newPassword: string) : Observable<any>{
  //   return this.http.post<any>(`${this.API_USERS_URL}/change-password`, {'currentPassword': current, 'newPassword': newPassword});
  // };
  changePassword(current: string, newPassword: string) : Observable<any>{
    return this.http.post<any>(`${this.API_USERS_URL}/change-password`, {'currentPassword': current, 'newPassword': newPassword});
  };

  // changePassword(data: any):Observable<any>{
  //   return this.http.post<any>(`${this.API_USERS_URL}/change-password`, data)
  // }


  userProfile(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/user/profile`);
  }

  editProfile(payload: any):Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/user/profile`, payload)
  }
}
