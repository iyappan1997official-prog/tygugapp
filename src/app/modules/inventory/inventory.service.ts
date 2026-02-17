import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  API_USERS_URL = `${environment.apiUrl}`
  allPallets: BehaviorSubject<any> = new BehaviorSubject([]);
  allQuiltsToCreatePallet: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) { }

  getQuiltRowById(apiUrl: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/${apiUrl}`);
  }

  addRow(apiUrl: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/${apiUrl}`, payload);
  }

  quiltDefinitionListing(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/quilt-definition`);
  }

  quiltConstructionListing(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/quilt-construction`);
  }

  quiltSizeListing(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/quilt-size`);
  }

  removeQuiltDefinition(quiltDefinitionId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/inventory/quilt-definition/${quiltDefinitionId}`, {});
  }

  removeQuiltConstruction(quiltConstructionId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/inventory/quilt-construction/${quiltConstructionId}`, {});
  }

  removeQuiltSize(quiltSizeId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/inventory/quilt-size/${quiltSizeId}`, {});
  }

  getIndividualStocks({ quiltTypeId, inventoryStatusId, sortByColumn, sortDescendingOrder, searchBy, pageNumber, pageSize }: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Quilts?QuiltTypeId=${quiltTypeId}&InventoryStatusId=${inventoryStatusId}&SortByColumn=${sortByColumn}&SortDescendingOrder=${sortDescendingOrder}&SearchBy=${searchBy}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }
  getInActive({ quiltTypeId, inventoryStatusId, retiredStatusId, sortByColumn, sortDescendingOrder, searchBy, pageNumber, pageSize }: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Quilts/GetInActiveQuilts?QuiltTypeId=${quiltTypeId}&InventoryStatusId=${inventoryStatusId}&RetiredStatusId=${retiredStatusId}&SortByColumn=${sortByColumn}&SortDescendingOrder=${sortDescendingOrder}&SearchBy=${searchBy}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }
  getPallets(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Pallets?QuiltTypeId=${filterObj.quiltTypeId}&PalletNumber=${filterObj.palletNumber}&LocationId=${filterObj.locationId}&QuiltSerialNumber=${filterObj.quiltSerialNumber}&Description=${filterObj.description}&InventoryStatusId=${filterObj.inventoryStatusId}&SearchBy=${filterObj.searchBy}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`)
  }

  removePallet(palletId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/Pallets/${palletId}`, {});
  }

  getPalletDetailsById(palletId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Pallets/${palletId}`);
  }

  editPalletDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Pallets`, payload);
  }

  getPalletsForCompany(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Pallets/GetPalletsForCompany?PalletNumber=${filterObj.palletNumber}&SearchBy=${filterObj.searchBy}&QuiltSerialNumber=${filterObj.quiltSerialNumber}&Description=${filterObj.description}&LocationId=${filterObj.locationId}&SortByColumn=${filterObj.sortByColumn}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}&InventoryStatusId=${filterObj.inventoryStatusId}&QuiltTypeId=${filterObj.quiltTypeId}`)
  }

  mergePallet(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Pallets/MergePallet`, payload);
  }

  updateQuiltStatus(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Quilts/UpdateQuiltsStatus`, payload);
  }

  updatePalletStatus(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Pallets/UpdatePalletStatus`, payload);
  }

  createMockPallet(quiltsQuantity: number): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Pallets/MockPallet?quiltsQuantity=${quiltsQuantity}`, {});
  }

  assignQuiltsToCustomer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/inventory/AssignInventory`, payload);
  }

  getOrdersByCustomerId(customerGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders/open`);
  }

  getAllInventories(orderTypeId: number, { customerNumber, customerName, quiltSerialNumber, orderNumber, palletSerialNumber, quiltStatusId, locationId, shipDate, receiveDate, pageNumber, pageSize, customerGroupId }: any): Observable<any> {
    return this.http.get<any>(!!customerGroupId ? `${this.API_USERS_URL}/inventory/GetAllInventories/${orderTypeId}?CustomerNumber=${customerNumber}&CustomerName=${customerName}&OrderNumber=${orderNumber}&companyId=${customerGroupId}&QuiltSerialNumber=${quiltSerialNumber}&PalletSerialNumber=${palletSerialNumber}&QuiltStatusId=${quiltStatusId}&LocationId=${locationId}&ShipDate=${shipDate}&ReceiveDate=${receiveDate}&PageNumber=${pageNumber}&PageSize=${pageSize}` : `${this.API_USERS_URL}/inventory/GetAllInventories/${orderTypeId}?CustomerNumber=${customerNumber}&CustomerName=${customerName}&OrderNumber=${orderNumber}&QuiltSerialNumber=${quiltSerialNumber}&PalletSerialNumber=${palletSerialNumber}&QuiltStatusId=${quiltStatusId}&LocationId=${locationId}&ShipDate=${shipDate}&ReceiveDate=${receiveDate}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  inventoryDetailsByOrderNumber(orderId: number, { quiltSerialNumber, palletSerialNumber, quiltStatusId, locationId, shipDate, receiveDate, pageNumber, pageSize, sortByColumn, SortDescendingOrder }: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetInventoryDetailsByOrderNumber/${orderId}?QuiltSerialNumber=${quiltSerialNumber}&PalletSerialNumber=${palletSerialNumber}&QuiltStatusId=${quiltStatusId}&LocationId=${locationId}&ShipDate=${shipDate}&ReceiveDate=${receiveDate}&PageNumber=${pageNumber}&PageSize=${pageSize}&sortByColumn=${sortByColumn}&SortDescendingOrder=${SortDescendingOrder}`);
  }

  getCustomerDetails(customerGroupId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetLeasedOrderDetailsForCompanyAdmin/${customerGroupId}`);
  }

  getQuiltPalletDetailsBySerialNumber(serialNumbers: any[], customerDetailsRequired: boolean = false, individualQuiltsOnly: boolean = false): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Quilts/GetQuiltPalletDetailsBySerialNumber`, { serialNumbers, customerDetailsRequired, individualQuiltsOnly });
  }
  getCustomerBySerialNumber(serialNumbers: any[]): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Customers/GetCustomerForOrder`,serialNumbers);
  }

  //Generate Serial Numbers api(s)
  getQuiltSeries({ pageNumber, pageSize }: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/quilt-series?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  getInventoryMappingByPartNumber(partNumberId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetInventoryMappingByPartNumber?partNumberId=${partNumberId}`);
  }

  getPartNumbers(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/PartNumbers`);
  }

  generateSerialNumbers(formValues: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/inventory/GenerateQuiltSeries`, formValues);
  }

  editSerialNumber(partNumber: string, maxQuilt: number, customerFacingDescription: string): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/inventory/UpdatePartNumber`, { partNumber, maxQuilt, customerFacingDescription });
  }

  receiveShipment(formValues: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Shipments/ReceiveShipment`, formValues);
  }

  exportInExcel(quiltSeriesId: number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Codes/ExportQuiltsToExcel?quiltSeriesId=${quiltSeriesId}`);
  }


  getQuiltsOrderInfo(customerGroupId: string | number, orderId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/customers/${customerGroupId}/Orders/QuiltTypeCountsByOrderId/${orderId}`);
  }


  deleteQrCodeFile(seriesId: string | number): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Codes/DeleteSeriesQRCodesFile?seriesId=${seriesId}`, {});
  }

  // getPurchasedDetails({quiltSerialNumber, palletSerialNumber, quiltStatusId, locationId, shipDate, receiveDate, pageNumber, pageSize }: any): Observable<any> {
  //   return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetPurchasedInventoryDetails?QuiltSerialNumber=${quiltSerialNumber}&PalletSerialNumber=${palletSerialNumber}&QuiltStatusId=${quiltStatusId}&LocationId=${locationId}&ShipDate=${shipDate}&ReceiveDate=${receiveDate}&PageNumber=${pageNumber}&PageSize=${pageSize}`)
  // }

  getInventoryDetails({ quiltSerialNumber, palletSerialNumber, quiltStatusId, locationId, shipDate, receiveDate, pageNumber, pageSize, orderTypeId, sortByColumn, sortDescendingOrder, partNumberId, orderNumber, orderNickName }: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetInventoryDetails?QuiltSerialNumber=${quiltSerialNumber}&PalletSerialNumber=${palletSerialNumber}&QuiltStatusId=${quiltStatusId}&LocationId=${locationId}&OrderNickName=${orderNickName}&ShipDate=${shipDate}&ReceiveDate=${receiveDate}&PartNumberId=${partNumberId}&OrderNumber=${orderNumber}&PageNumber=${pageNumber}&PageSize=${pageSize}&OrderTypeId=${orderTypeId}&sortByColumn=${sortByColumn}&sortDescendingOrder=${sortDescendingOrder}`)
  }
  getQuiltTypes(): Observable<any> {
    return this.http.get(`${this.API_USERS_URL}/Generic/quilttypes`);
  }
  getQuiltStatuses(): Observable<any> {
    return this.http.get(`${this.API_USERS_URL}/Generic/quiltstatuses`);
  }
  getPalletStatuses(): Observable<any> {
    return this.http.get(`${this.API_USERS_URL}/Generic/palletstatuses`);
  }
  getInactiveStatuses(): Observable<any> {
    return this.http.get(`${this.API_USERS_URL}/Generic/inactivequiltstatuses`);
  }
  getAllLocation(): Observable<any> {
    return this.http.get(`${this.API_USERS_URL}/Locations/GetAllLocations`);
  }

  //AutoMate Pallet

  getPartNumbersForAutomatePallet(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/GetPartNumbersForAutomatedPallet`);
  }

  getValidQuilt(partNumber: string, quiltSerialNumber: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Quilts/ValidateQuiltbyPartnumber?partNumber=${partNumber}&quiltSerialNumber=${quiltSerialNumber}`);
  }

  createAutomatPallet(formValues: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Pallets/CreateAutomatedPallet`, formValues);
  }

  syncCustomes(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Epicore/SyncCustomerData`);
  }
  syncCustomesLocations(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Epicore/SyncShipToData`);
  }
  syncCustomesOrders(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Epicore/SyncOrderData`);
  }
  getConsignedOrder(formValues: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetConsignedOrderDetails?CustomerNumber=${formValues.customerNumber}&CustomerName=${formValues.customerName}&OrderNumber=${formValues.orderNumber}&QuiltSerialNumber=${formValues.quiltSerialNumber}&PalletSerialNumber=${formValues.palletSerialNumber}&QuiltStatusId=${formValues.quiltStatusId}&PartNumber=${formValues.partNumber}&LocationId=${formValues.locationId}&ShipDate=${formValues.shipDate}&ReceiveDate=${formValues.receiveDate}&SortDescendingOrder=${formValues.sortDescendingOrder}&PageNumber=${formValues.pageNumber}&PageSize=${formValues.pageSize}&SearchBy=${formValues.searchBy}&SortByColumn=${formValues.sortByColumn}`);
  }

  getInStockConsigned(formValues: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetOrderDetailsForInStock?LocationId=${formValues.locationId}&SortDescendingOrder=${formValues.sortDescendingOrder}&PageNumber=${formValues.pageNumber}&PageSize=${formValues.pageSize}&SearchBy=${formValues.searchBy}&SortByColumn=${formValues.sortByColumn}`);
  }

  getLocationForConsign(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetConsignedLocations`);
  }
  getCustomerInventoryOverview(orderTypeId: number, orderNumber: string, partNumber: string, locationId: number, orderNickName: string): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/inventory/GetCustomerInventoryOverview?orderTypeId=${orderTypeId}&orderNumber=${orderNumber}&partNumber=${partNumber}&locationId=${locationId}&orderNickName=${orderNickName}`);
  }
  getCustomerLocations(onlyConsign: boolean, onlyCustomer: boolean, moreinfo: boolean = false): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Locations/GetCustomerLocations?onlyConsignedRequired=${onlyConsign}&onlyCustomerRequired=${onlyCustomer}&addMoreInfo=${moreinfo}`);
  }
}
