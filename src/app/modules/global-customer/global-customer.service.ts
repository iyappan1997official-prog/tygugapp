import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalCustomerService {
  API_USERS_URL = `${environment.apiUrl}`
  allLists: BehaviorSubject<any> = new BehaviorSubject([]);
  constructor(private http: HttpClient) { }

  addGlobalCustomer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Customers/CustGroup`, payload);
  }
  getGlobalCustGroup(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Customers/GetCustGroups?SearchBy=${filterObj.searchBy}&SortByColumn=${filterObj.sortByColumn}&SortDescendingOrder=${filterObj.SortDescendingOrder}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`);
  }
  getCustGroupDetailsById(custId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/CustGroup/GetCustGroup?id=${custId}`);
  }
  GetAllCustomerGroups(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/CustGroup/GetAllCustGroups`);
  }

  GetAllCustomerGroupsForGlobalAdmin(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/CustGroupsForGlobalAdmin`);
  }

}

