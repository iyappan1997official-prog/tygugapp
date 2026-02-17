import { Injectable } from '@angular/core';
// import { environment } from '../../../../environments/environment.prod';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { filter, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  API_USERS_URL = `${environment.apiUrl}`

  constructor(private http: HttpClient) { }



  // getTotalQuiltsChartData() : Observable<any>{
  //   return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetQuiltsCountForDashboard`);
  // }

  getTotalQuiltsChartData(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/inventory/GetQuiltsCountForDashboard`, payload);
  }

  getInventoryOverview(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/dashboard/GetInventoryOverviewChartData`, payload);
  }
  getUsedChart(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/dashboard/GetNewUsedChartData`, payload);
  }
  getUsagesBySize(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/dashboard/GetUsagesBySizeChartData`, payload);
  }
  getTotalUsage(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/dashboard/GetTotalUsageChartData`, payload);
  }
  getRetiredQuilts(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/dashboard/GetRetiredQuiltsChartData`);
  }

  getMapData(orderTypeId: any,customerGroupId:number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/dashboard/GetLocationMapData?orderTypeId=${orderTypeId}&customerId${customerGroupId}`);
  }

  // getAllQuiltsMovement(filterObj: any, companyId: any): Observable<any>{
  //   return this.http.post<any>(`${this.API_USERS_URL}/inventory/GetAllQuiltsMovement?searchBy=${filterObj.searchBy}&pageNumber=${filterObj.pageNumber}&pageSize=${filterObj.pageSize}&orderTypeId=${filterObj.orderTypeId}&startDate=${filterObj.startDate}&endDate=${filterObj.endDate}`, companyId);
  // }
  getAllQuiltsMovement(filterObj: any, orderTypeId: any, regionId: any, locationTypeId: any, companyType: any, CustomerGroupIds: any, locationIds: any, startDate: any, endDate: any, allDetailsRequired: boolean = false, orderNickName: string): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/dashboard/GetAllQuiltsMovement?SortByColumn=${filterObj.sortByColumn}&SortDescendingOrder=${filterObj.sortDescendingOrder}&SearchBy=${filterObj.searchBy}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`, { orderTypeId, regionId, locationTypeId, companyType, CustomerGroupIds, locationIds, startDate, endDate, allDetailsRequired, orderNickName });
  }
  getPalletDetails(serial: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Pallets/GetPalletsForCompany?palletNumber=${serial}`);
  }

  getPalletQuiltCount(body: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/Quilts/GetQuiltPalletDetailsBySerialNumber`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ✅ Optional future feature → Get pallet list from /api/Pallets
  getAllPallets(): Observable<any> {
    return this.http.get<any>(
      `${this.API_USERS_URL}/Pallets`
    );
  }

  getCompaniesRegion(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/companies`)
  }
  getAllOrderNames(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/FilterOrderNickName`)
  }
  getAllQuiltsDistributionByCompanyId(filterObj: any, companyId: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/dashboard/GetQuiltsDistributionByCompanyId?searchBy=${filterObj.searchBy}&pageNumber=${filterObj.pageNumber}&pageSize=${filterObj.pageSize}&orderTypeId=${filterObj.orderTypeId}&companyId=${companyId}&startDate=${filterObj.startDate}&endDate=${filterObj.endDate}`);
  }

  getQuiltMovementByLocationId(filterObj: any, orderTypeId: any, customerGroupId: any, locationId: any, startDate: any, endDate: any, orderNickName: string): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/dashboard/GetAllQuiltsMovementByLocationId?pageNumber=${filterObj.pageNumber}&pageSize=${filterObj.pageSize}`, { orderTypeId, customerGroupId, locationId, startDate, endDate, orderNickName })
  }

  getQuiltsLookup(serialNumber: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Quilts/GetQuiltLookUp?serialNumber=${serialNumber}`)
  }

  getQuiltActivityChartData(orderTypeId: any, resultType: any, companyIds: any, locationIds: any, startDate: any, endDate: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/inventory/GetQuiltsLineChartData`, { orderTypeId, resultType, companyIds, locationIds, startDate, endDate })
  }

  getLocationDetailsById(locationId: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/${locationId}`);
  }

  getLocationDetailsByCustomerId(customerGroupId: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetLocationDetailsByCustomerGroupId/${customerGroupId}`);
  }

  getCustomerRegionLocations(customerGroupId:number): Observable<any> {
    // return this.http.get<any>(`${this.API_USERS_URL}/dashboard/GetCustomerRegionLocation?customerId=${customerId}`);
    return this.http.get<any>(`${this.API_USERS_URL}/dashboard/GetCustomerContinentLocation?customerGroupId=${customerGroupId}`);
  }
  getThresholdByCustomerId(customerGroupId: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetCustomerLocationThreshold?customerGroupId=${customerGroupId}`);
  }
  requestedOrder(thresholdId: any, isAccepted: boolean): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Distribution/MailReplenishedOrder`, { thresholdId, isAccepted })
  }
}
