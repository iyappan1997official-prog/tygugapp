import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, debounceTime, forkJoin, of, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { AuthService } from '../../auth/auth.service';
import { OrderModalComponent } from '../order-modal/order-modal.component';
import { ShipmentsService } from '../shipments.service';
import * as moment from "moment";
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { debug } from 'console';
import { InventoryService } from '../../inventory/inventory.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
@Component({
  selector: 'view-shipment',
  templateUrl: './view-shipment.component.html',
  styleUrls: ['./view-shipment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewShipmentComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  allLocations: any[] = [];

  get items$() {
    return this._items$.asObservable();
  }

  viewShipmentForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10];
  pageSizeMoreOptions: number[] = [5, 10, 50, 100]
  isLoading: boolean = false;
  pageEvent: PageEvent;
  customerIdArr: any[] = [];
  cusName: string;
  customerId: number;
  companyName: string;
  particularTableID: number;
  totalShipment: number;
  totalShipmentByCustomerId: number;
  companyRoles: string[] = [this.roleEnum.customerAdmin, this.roleEnum.customerManager]
  contentView: string = "cards";
  loggedInUserRole: Roles;
  userId: number;
  locationId: number;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  loggedInCustomerId: any[] = [];
  isSelected: boolean = false;
  searchText: string = undefined;
  searchFilter: boolean = false;
  constructor(private modalService: NgbModal,
    private shipmentsService: ShipmentsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private getAllLocations: FetchAllLocationsService,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.userId = this.authService?.getUserFromLocalStorage()?.data?.userId || '';
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.locationId = this.authService?.getUserFromLocalStorage()?.data?.locationId || '';
    this.customerId = this.authService?.getUserFromLocalStorage()?.data?.custGroupId;
    this.companyName = this.authService?.getUserFromLocalStorage()?.data?.userFullName;
    console.log(this.customerId);

    this.initForm();
    // this.onSearchByValueChange();
    if (this.tab === "view-shipment" || !this.tab) {
      // this.shipmentTableCall();
      // this.deleteDisplay()
      this.fetchData();
    }
    // if (this.companyRoles.includes(this.loggedInUserRole)) {
    //   this.getLocationByCustomerId(this.customerId)
    // } else {
    //   this.fetchAllLocation();
    // }
  }

  fetchData() {
    let fetchData = [];
    if (this.companyRoles.includes(this.loggedInUserRole)) {
      this.particularTableID = this.customerId;
      fetchData.push(this.shipmentsService.getLocationsForCompanyUserByCustomerGroupId(this.customerId,true).pipe(catchError(error => of(error))));
      fetchData.push(this.shipmentsService.getShipmentByCustomerId(this.formValues, this.customerId).pipe(catchError(error => of(error))))
    } else {
      fetchData.push(this.inventoryService.getAllLocation().pipe(catchError(error => of(error))));
      fetchData.push(this.shipmentsService.getAllShipment(this.formValues).pipe(catchError(error => of(error))));
    }


    this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: ([res1, res2]) => {
        this.spinner.hide();
        if (res1.statusCode === 200) {
          this.allLocations = res1?.data;
        } else if (res1.message) {
          this.toastr.error(res1.message)
        }
        if (res2.statusCode === 200) {
          debugger
          if (this.companyRoles.includes(this.loggedInUserRole)) {
            this._items$.next(res2?.data?.shipments)
            this.totalShipmentByCustomerId = res2?.data?.totalCount;
            // this.unsubscribe.push(shipmentFullListSub);
            this.pageSizeMoreOptions = [5, 10, 50, 100];
            if (!this.pageSizeMoreOptions.includes(this.totalShipmentByCustomerId)) {
              this.pageSizeMoreOptions.push(this.totalShipmentByCustomerId)
            }
            if (this.totalShipmentByCustomerId < 5) {
              this.pageSizeMoreOptions = [5, 10];
            }
            this.contentView = "fullTable";
            if (this.companyRoles.includes(this.loggedInUserRole)) {
              this.isSelected = true;
            }
          } else {
            this._items$.next(res2?.data?.shipments);
            this.totalShipment = res2?.data?.totalCount;
            this.pageSizeOptions = [5, 10, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalShipment)) {
              this.pageSizeOptions.push(this.totalShipment)
            }
            if (this.totalShipment < 5) {
              this.pageSizeOptions = [5, 10];
            }
          }

          //this.cd.detectChanges();
        } else if (res2.message) {
          this.toastr.error(res2.message)
        }
      },
      error: (e) => this.toastr.error(e.message),
      complete: () => { this.spinner.hide() }
    });
  }

  get formValues() {
    return this.viewShipmentForm.getRawValue();
  }

  shipmentTableCall() {
    if (this.customerId && [this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.particularTable(this.customerId, this.companyName);
    } else {
      this.backToTables()
      // this.getAllShipment();
    }
  }

  initForm() {
    this.viewShipmentForm = this.fb.group({
      orderNumber: '',
      quiltSerialNumber: "",
      shipmentNumber: '',
      billOfLadingNumber: "",
      destinationId: 0,
      sourceId: 0,
      startDate: "",
      endDate: "",
      searchBy: "",
      sortByColumn: '',
      isInternalTransfer: false,
      sortAscendingOrder: true,
      pageNumber: 1,
      pageSize: 10
    })
  }
  get formValues1() {
    return this.viewShipmentForm.getRawValue();
  }

  getAllShipment() {
    debugger;
    this.spinner.show();
    this.isLoading = true;
    const body = {
      ...this.formValues1,
      startDate: this.formValues1.startDate ? moment(this.formValues1.startDate).format("MM/DD/YYYY") : "",
      endDate: this.formValues1.endDate ? moment(this.formValues1.endDate).format("MM/DD/YYYY") : ""
    }
    const shipmentListSub = this.shipmentsService.getAllShipment(body).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.shipments);
        this.totalShipment = res?.data?.totalCount;
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    });
    this.unsubscribe.push(shipmentListSub);
  }

  particularTable(id: any, cusName: string) {
    this.cusName = cusName;
    this.particularTableID = id;
    this.spinner.show();
    this.isLoading = true;
    const body = {
      ...this.formValues1,
      startDate: this.formValues1.startDate ? moment(this.formValues1.startDate).format("MM/DD/YYYY") : "",
      endDate: this.formValues1.endDate ? moment(this.formValues1.endDate).format("MM/DD/YYYY") : "",
      isInternalTransfer: this.particularTableID === 0 ? true : false
    }
    const shipmentFullListSub = this.shipmentsService.getShipmentByCustomerId(body, +id).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.shipments)
        this.totalShipmentByCustomerId = res?.data?.totalCount;
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    });
    this.unsubscribe.push(shipmentFullListSub);
    this.contentView = "fullTable";
    this.isSelected = true;
  };
  fetchAllLocation() {
    this.spinner.show();

    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allLocations.subscribe((allLocations) => {

      if (allLocations.length || apiCalled) {
        this.allLocations = allLocations;
        this.spinner.hide();
      } else if (!apiCalled) {
        apiCalled = true;
        this.getAllLocations.getAllLocationTypes();


      }
    })
    this.unsubscribe.push(getAllLoc);
  }

  getLocationByCustomerId(customerId: any) {
    this.spinner.show()
    const locationDrop = this.shipmentsService.getLocationsByCustomerId(customerId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allLocations = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  backToTables() {
    this.contentView = "cards";
    this.isSelected = false;
    this.viewShipmentForm.controls.pageNumber.patchValue(1);
    this.getAllShipment();
  };

  getSearchByControl() {
    return this.viewShipmentForm.controls.searchBy as FormControl;
  }

  deleteDisplay() {
    if ([this.roleEnum.masterAdmin, this.roleEnum.warehouseUser].includes(this.loggedInUserRole)) {
      this.locationId = 1;
    }
    console.log(this.locationId);
  }

  onSearchByValueChange() {
    debugger;
    this.searchFilter = true;
    const { pageNumber, searchBy } = this.viewShipmentForm.controls;
    // const searchByValueSub = searchBy.valueChanges.pipe(debounceTime(2000)).subscribe(() => {
    //pageNumber.patchValue(1);
    //this.fetchData()
    if (this.isSelected) {
      this.particularTable(this.particularTableID, this.cusName);
    } else {
      this.getAllShipment();
    }
    // })
    // this.unsubscribe.push(searchByValueSub);
  }
  searchReset() {
    this.searchFilter = false;
    this.initForm();
    this.viewShipmentForm.controls.searchBy.patchValue("");
    this.shipmentTableCall();
  }

  openOrderModal(id: any) {
    const modalRef = this.modalService.open(OrderModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: true
    })
    modalRef.componentInstance.shipId = id;
  }

  openConfirmDeleteModal(id: number) {
    const modalRef = this.modalService.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removeShipment(id);
    }).catch((res) => { })
  }

  removeShipment(id: number) {
    this.spinner.show();
    const deleteList = this.shipmentsService.removeShipment(id)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.shipmentTableCall();
          if (res.message) {
            this.toastr.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deleteList);
  }

  paginator(event: any) {
    if (!this.searchFilter) {
      this.initForm();
    }
    const { pageSize, pageNumber } = this.viewShipmentForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);
    if (this.isSelected) {
      this.particularTable(this.particularTableID, this.cusName)
    } else {
      this.getAllShipment();
    }
    //this.fetchData()
  }
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
