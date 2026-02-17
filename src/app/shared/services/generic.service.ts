import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
API_USERS_URL = `${environment.apiUrl}`
  constructor(private http: HttpClient) { }

  getAllCountries(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/country`);
  }

  getOrderStatus(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/orderstatuses`);
  }

  getOrderTypes(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/ordertypes`);
  }

  getQuiltTypes(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/quilttypes`);
  }

  getAllLocationTypes(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/locationTypes`);
  }

  getAllGlobalCustomer(customGroupRequired: boolean): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/CustGroups?customGroupRequired=${customGroupRequired}`);
  }
  
  getReconcileQuiltStatuses(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/quiltstatusesForReconcile`);
  }

  getQuiltStatuses(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/quiltstatuses`);
  }
  
  getAllReportTypes(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/ReportType`);
  }

  getAllShipmentTypes(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/shipmentTypes`);
  }

  getAllShipmentETAs(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/shipmentETAs`);
  }
}
