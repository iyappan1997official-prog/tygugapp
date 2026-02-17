import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  API_USERS_URL = `${environment.apiUrl}`

  constructor(private http: HttpClient) { }

  //customer listing
  // getCustomerDetailsById(customerId: string | number): Observable<any> {
  //   return this.http.get<any>(`${this.API_USERS_URL}/Customers/${customerId}`);
  // }

  getCustomerDetailsById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/CustGroup/GetCustGroup?id=${id}`);
  }

  // addCustomer(payload: any): Observable<any> {
  //   return this.http.post<any>(`${this.API_USERS_URL}/CustGroup/EditCustGroup`, payload);
  // }
  addCustomer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Customers`, payload);
  }
  getAllCustomers(formValues: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/CustGroup?SearchBy=${formValues.searchBy}&SortByColumn=${formValues.sortByColumn}&SortDescendingOrder=${formValues.SortDescendingOrder}&PageNumber=${formValues.pageNumber}&PageSize=${formValues.pageSize}`);
  }

  //customer tab api(s) for orders
  getAllOrders(formValues: any, customerGroupId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders?PageSize=${formValues.pageSize}&PageNumber=${formValues.pageNumber}`);
  }

  getOrderDetails(customerGroupId: number, orderId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders/${orderId}`);
  }

  addOrderDetails(customerGroupId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders`, payload);
  }

  archiveCustomer(customerGroupId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/CustGroup/${customerGroupId}/archive`, payload);
  }

  //location tab api(s)
  getAllLocations(formValues: any, customerGroupId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationDetailsByCustomerGroupId/${customerGroupId}?LocationTypeId=${formValues.locationTypeId}&SearchBy=${formValues.searchBy}&SortByColumn=${formValues.sortByColumn}&SortDescendingOrder=${formValues.SortDescendingOrder}&PageNumber=${formValues.pageNumber}&PageSize=${formValues.pageSize}`);
  }

  removeLocation(locationId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/Locations/${locationId}`, {});
  }

  getLocationDetailsById(locationId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/${locationId}`);
  }

  addLocation(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Locations`, payload);
  }

  //carrier tab api(s)
  getAllCarriers(formValues: any, customerGroupId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Carrier/GetCarrierDetailsByCustomerGroupId/${customerGroupId}?SearchBy=${formValues.searchBy}&SortByColumn=${formValues.sortByColumn}&SortAscendingOrder=${formValues.sortAscendingOrder}&PageNumber=${formValues.pageNumber}&PageSize=${formValues.pageSize}`);
  }

  removeCarrier(carrierId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/Carrier/${carrierId}`, {});
  }

  removeOrder(customerGroupId: string | number, orderId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders/CloseOrder/${orderId}`);
  }

  getCarrierDetailsById(carrierId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Carrier/${carrierId}`);
  }

  addCarrier(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Carrier`, payload);
  }

  getQuiltsForReconcile(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Quilts/GetQuiltsForReconcile?orderId=${orderId}`);
  }

  addReconcile(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Quilts/ReconcileQuilts`, payload);
  }
  getLocation(term: string): Observable<any> {
    const url = `https://maps.google.com/maps/api/geocode/json?address=${term}&sensor=false&key=${environment.googleApiKey}`;
    return this.http.get<any>(url);
  }
  getCustomerType(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Customers/GetCustomerTypes`);
  }
  getCustomerFacing(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/CustomerFacing`);
  }
  addThreshold(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/inventory/AddLocationThreshold`, payload);
  }
  getLocationThreshold(formValues: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetLocationThresholds?SearchBy=${formValues.searchBy}&SortByColumn=${formValues.sortByColumn}&SortDescendingOrder=${formValues.sortDescendingOrder}&PageNumber=${formValues.pageNumber}&PageSize=${formValues.pageSize}`);
  }
  getThresholdDetails(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetLocationThreshold?ThresholdId=${id}`);
  }
  addOrderName(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Generic/AddOrderNickName`, payload);
  }
  getOrderNames(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/OrderNickName`);
  }
}
