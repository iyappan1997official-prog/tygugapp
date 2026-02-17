import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  API_USERS_URL = `${environment.apiUrl}`
  customerId: BehaviorSubject<any> = new BehaviorSubject([]);
  constructor(private http: HttpClient) { }


  customerHistoryReport({ pageNumber, pageSize }: any, CustomerGroupIds: any, startDate: any, endDate: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/customerHistory`, { pageNumber, pageSize, CustomerGroupIds, startDate, endDate });
  }

  quiltHistoryReport({ pageNumber, pageSize }: any, customerGroupIds: any, startDate: any, endDate: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/QuiltHistory`, { pageNumber, pageSize, customerGroupIds, startDate, endDate });
  }

  // quiltUtilisationReport({pageNumber, pageSize}: any, customerIds: any, startDate: any, endDate: any): Observable<any> {
  //   return this.http.post<any>(`${this.API_USERS_URL}/Reports/quiltutilisation` , {pageNumber, pageSize, customerIds, startDate, endDate});
  // }
  quiltUtilisationReport({ pageNumber, pageSize }: any, customerGroupIds: any, startDate: any, endDate: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/quiltutilisation`, { pageNumber, pageSize, customerGroupIds, startDate, endDate });
  }


  lastLocationQuiltsReport({ pageNumber, pageSize }: any, customerGroupIds: any, startDate: any, endDate: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/lastloctaionquiltsdetails`, { pageNumber, pageSize, customerGroupIds, startDate, endDate });
  }

  archiveReport(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Reports?startDate=${filterObj.startDate}&endDate=${filterObj.endDate}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`);
  }

  restoreCustomer(customerGroupId: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/restoreCustomer`, { customerGroupId });
  }

  getQuiltDetailsByCustomer(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Reports/QuiltDetailsByCustomerGroup?customerGroupId=${filterObj.customerGroupId}&orderNumber=${filterObj.orderNumber}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`)
  }

  getQuiltUtilisationByCustomer(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Reports/quiltutilisationbycustomerGroup?customerGroupId=${filterObj.customerGroupId}&startDate=${filterObj.startDate}&endDate=${filterObj.endDate}&pageNumber=${filterObj.pageNumber}&pageSize=${filterObj.pageSize}`)
  }

  getLocationsForCompanyUser(customerGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustomerGroupId/${customerGroupId}`);
  }

  addReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/QuiltReport`, payload);
  }

  quiltUsageReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/QuiltUsage`, payload);
  }
  getOrderReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/OrdersReport`, payload);
  }

  getActivityReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Reports/LogInHistoryReport`, payload);
  }

  getUserProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/User/${userId}`);
  }

  getCustomersByGroup(custGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Customers/GetCustomersByCustGroupId?custGroupId=${custGroupId}`);
  }
}
