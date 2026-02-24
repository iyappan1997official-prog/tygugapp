// repair.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RepairService {
  API_URL = `${environment.apiUrl}/Repair`;
  REPORTS_API_URL = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) { }

  // Existing: Fetch repair reports
  getRepairReports(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/GetRepairReports`, payload);
  }

  // New: Fetch all customers dynamically
  getAllCustomers(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Customers/GetAllCustomers`);
  }

  getCustomersByCustGroupId(custGroupId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Customers/GetCustomersByCustGroupId?custGroupId=${custGroupId}`);
  }

  // New: Get repair summary report
  getRepairSummaryReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.REPORTS_API_URL}/RepairSummaryReport`, payload);
  }

  //New : Get repair summary report Quilts
  repairSummaryWithQuilts(payload: any): Observable<any> {
    return this.http.post<any>(`${this.REPORTS_API_URL}/customerCenterIcrCycleHierarchy`, payload);
    }

  getServiceCenterLocations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Locations/GetServiceCenterLocations`);
  }

  // New: Service Center ICR report
  getServiceCenterIcrReport(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Reports/serviceCenterIcrCycleHierarchy`, payload);
  }

  syncServiceCenterIcrCycleReport(): Observable<any> {
    return this.http.post<any>(`${this.REPORTS_API_URL}/refreshServiceCenterICRCycleReport`, {});
  }

  syncCustomerCenterIcrCycleReport(): Observable<any> {
    return this.http.post<any>(`${this.REPORTS_API_URL}/refreshCustomerCenterICRCycleReport`, {});
  }

}
