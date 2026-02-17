import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  API_USERS_URL = `${environment.apiUrl}`
  allUsers: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) { }

  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/user/roles`);
  }
  getUserDetailsById(userId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/user/${userId}`);
  }

  addUser(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/user`, payload);
  }

  userListing(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/User?RoleId=${filterObj.roleId}&LocationId= ${filterObj.locationId}&SearchBy=${filterObj.searchBy}&SortByColumn=${filterObj.sortByColumn}&SortDescendingOrder=${filterObj.SortDescendingOrder}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`);
  }

  removeUser(userId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/user/${userId}`, {});
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/User/all`);
  }
  
  getGlobalAdminCustomers():Observable<any>{
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/CustGroupsForGlobalAdmin`);
  }
  getLocationsByCustomerId(customerGroupId: number, locationTypeId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustomerGroupId/${customerGroupId}?locationTypeId=${locationTypeId}`);
  }
  
  getCompaniesRegion(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/companies`)
  }

  getCustomerByCompanyId(id: string | number, isConsign?: boolean): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Customers/CustomersByCompanyId/${id}?isConsignedOnly=${isConsign}`);
  }

  GetLocationsByLocationTypeId(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByLocationType?locationIds=${id}`);
  }

  getLocationByRegion(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByRegion?regionId=${id}`);
  }

  GetServiceCenterLocations(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetServiceCenterLocations`);
  }

  getLocationByCustGroup(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustGroup?custGroupId=${id}`);
  }
  getAllLocations(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetAllLocations`);
  }
  getLoggedInAsUser(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/loginAsUser?userId=${userId}`);
  }

  getAllCustGroups(customGroupRequired:boolean|null): Observable<any> {
    
      return this.http.get<any>(`${this.API_USERS_URL}/Generic/CustGroups?customGroupRequired=${customGroupRequired}`);
    
  }
  changeUserPassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/admin-change-password`, { 'userId': userId , 'currentPassword': currentPassword, 'newPassword': newPassword });
  };

  resetUserPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/user/admin/reset-password`,{userId: userId,newPassword: newPassword});
  }


}
