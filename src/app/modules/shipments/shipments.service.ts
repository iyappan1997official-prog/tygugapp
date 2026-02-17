import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShipmentsService {
  API_USERS_URL = `${environment.apiUrl}`
  constructor(private http: HttpClient) { }

  carrierByOrderNumber(orderNo: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Carrier/preferred?orderNumber=${orderNo}`, {});
  }

  GetLocationsByOrderId(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByOrderId?orderId=${orderId}`, {});
  }
  carrierByCustomerId(customerId: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Carrier/GetPreferredCarriersByCustomerId/${customerId}`);
  }
  carrierByCustomerGroupId(custGroupId: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Carrier/GetPreferredCarriers/${custGroupId}`);
  }
  getLocationsByCustomerGroupId(custGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustomerGroupId/${custGroupId}`);
  }
  getLocationsByCustomerId(customerId: number, allFFLocationsRequired: boolean = false): Observable<any> {
    const url = allFFLocationsRequired
      ? `${this.API_USERS_URL}/Locations/GetLocationsByCustomerId/${customerId}?allFFLocationsRequired=${allFFLocationsRequired}`
      : `${this.API_USERS_URL}/Locations/GetLocationsByCustomerId/${customerId}`;
    return this.http.get<any>(url);
  }

  getLocationsForCompanyUser(customerGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustomerGroupIdForCompanyUser/${customerGroupId}`);
  }
  getLocationsForCompanyUserByCustomerGroupId(customerGroupId: number, selfLocationRequired: boolean = false): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustomerGroupIdForCompanyUser/${customerGroupId}?selfLocationRequired=${selfLocationRequired}`);
  }

  getAllShipment({ orderNumber, quiltSerialNumber, shipmentNumber, sortByColumn, sortAscendingOrder, billOfLadingNumber, destinationId, startDate, endDate, sourceId, searchBy, pageNumber, pageSize }: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Shipments?OrderNumber=${orderNumber}&QuiltSerialNumber=${quiltSerialNumber}&ShipmentNumber=${shipmentNumber}&BillOfLadingNumber=${billOfLadingNumber}&SourceId=${sourceId}&DestinationId=${destinationId}&StartDate=${startDate}&EndDate=${endDate}&SortByColumn=${sortByColumn}&SortAscendingOrder=${sortAscendingOrder}&SearchBy=${searchBy}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  getShipmentByCustomerId({ orderNumber, quiltSerialNumber, shipmentNumber, billOfLadingNumber, destinationId, startDate, endDate, sourceId, sortByColumn, sortAscendingOrder, searchBy, pageNumber, pageSize, isInternalTransfer }: any, customerGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Shipments/GetShipmentDetailsByCustomerGroupId/${customerGroupId}?IsInternalTransfer=${isInternalTransfer}&OrderNumber=${orderNumber}&QuiltSerialNumber=${quiltSerialNumber}&ShipmentNumber=${shipmentNumber}&BillOfLadingNumber=${billOfLadingNumber}&SourceId=${sourceId}&DestinationId=${destinationId}&StartDate=${startDate}&EndDate=${endDate}&SortByColumn=${sortByColumn}&SortAscendingOrder=${sortAscendingOrder}&SearchBy=${searchBy}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  getShipmentDetails(shipmentId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Shipments/ShipmentDetailsByShipmentId?shipmentId=${shipmentId}`);
  }

  addShipment(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Shipments`, payload);
  }

  addQuiltBySerialNumber(serialNumber: any[]): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Quilts/GetQuiltPalletDetailsBySerialNumber`, { serialNumber });
  }
  getLocationDetailsById(locationId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/${locationId}`);
  }

  removeShipment(shipmentId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/Shipments/DeleteShipment?shipmentId=${shipmentId}`, {});
  }

  getShipmentDropdownDetails(companyId: number, customerId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Shipments/GetOrdersByCompanyCustomer?CompanyId=${companyId}&CustomerId=${customerId}`)
  }

  getCompaniesForShip(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/companies`)
  }

  getCustomerByCompanyId(id: string | number, isConsign?: boolean): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Customers/CustomersByCompanyId/${id}?isConsignedOnly=${isConsign}`);
  }

  getOrderByCustomerId(customerGroupId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders/open`);
  }
  getOrderByCustomerGroupId(customerGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders/open`);
  }
  getConsignedCustomers(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Shipments/GetConsignedCustomer`)
  }
  // ADD THIS NEW METHOD
  GetLocationsByCustomerGroupCustomer(customerId: number | string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationsByCustomerGroupId/${customerId}`);
  }
}
