/*import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, forkJoin, of, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { FetchQuiltStatusesService } from 'src/app/shared/services/fetch-quilt-statuses.service';
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { InventoryService } from '../../inventory.service';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePalletModalComponent } from '../../create-pallet-modal/create-pallet-modal.component';
import { ShipmentsService } from 'src/app/modules/shipments/shipments.service';
import { UpdateStatusModalComponent } from '../../update-status-modal/update-status-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { PageEvent } from '@angular/material/paginator';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard/dashboard.service';

@Component({
  selector: 'app-full-table-view',
  templateUrl: './full-table-view.component.html',
  styleUrls: ['./full-table-view.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullTableViewComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  private subscriptions: Subscription[] = [];
  public roleEnum = Roles;
  allStatus: any[] = [];
  allLocations: any[] = [];
  public isCollapsed = true;
  length: number;
  pageEvent: PageEvent;
  pageSize = 10;
  pageSizeOptions: number[] = [10];
  pageSizeMoreOptions: number[] = [10, 50, 100];
  fullTableData: any;
  path: string = this.activatedRoute?.routeConfig?.path;
  state = this.activatedRoute?.snapshot?.queryParams;
  @Input() tab: string;
  orderNumber: number = this.activatedRoute?.snapshot?.params?.id;
  orderNumberName: any =
    this.activatedRoute?.snapshot?.queryParams?.orderNumberName;
  quiltsAssigned: any =
    this.activatedRoute?.snapshot?.queryParams?.quiltsAssigned;
  companyName: string = this.activatedRoute?.snapshot?.queryParams?.companyName;
  companyNumber: string =
    this.activatedRoute?.snapshot?.queryParams?.companyNumber;
  inventoryScanned: string =
    this.activatedRoute?.snapshot?.queryParams?.inventoryScanned;
  quiltSerialNumber: string;
  quiltStatusId: string;
  locationId: string;
  palletSerialNumber: string;
  shipDate: string;
  receiveDate: string;
  onHand: string = this.activatedRoute?.snapshot?.queryParams?.onHand;
  activeQuilts: number =
    this.activatedRoute?.snapshot?.queryParams?.activeQuilts;
  searchFilter: boolean = false;
  selectedRows: any[] = [];
  inventoryForm: FormGroup;
  totalCount: number;
  loggedInUserRole: Roles;
  masterAdminRoles: string[] = [
    this.roleEnum.masterAdmin,
    this.roleEnum.warehouseUser,
  ];
  companyAdminRoles: string[] = [
    this.roleEnum.customerAdmin,
    this.roleEnum.customerManager,
    this.roleEnum.globalAdmin,
  ];
  loggedInUserDetails: any;
  loggedInCustomerId: any;
  loggedInLocationId: any;
  allQuiltsStatus: any[] = [];
  @Output() getPalletsList = new EventEmitter();
  orderTypeId: any;
  nickNameId: FormControl = new FormControl(0);
  allPartNumbers: any[] = [];
  totalQuantity: number;
  private _partnumberItems$ = new BehaviorSubject<any[]>([]);
  // contentScroll: boolean = false;
  currentTab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  orderNameId: string = this.activatedRoute?.snapshot?.queryParams?.orderNameId;
  get items$() {
    return this._items$.asObservable();
  }
  onlyCustomer: boolean = false;
  onlyConsign: boolean = false;
  allOrderNames: any[] = [];
  orderName: string = '';
  SortDescendingOrder: boolean = false;
  sortByColumn: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private quiltStatusesService: FetchQuiltStatusesService,
    private getAllLocations: FetchAllLocationsService,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private shipmentsService: ShipmentsService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private dataSharingService: DataSharingService
  ) {
    this.quiltSerialNumber =
      this.router.getCurrentNavigation()?.extras?.state?.quiltSerialNumber;
    this.quiltStatusId =
      this.router.getCurrentNavigation()?.extras?.state?.quiltStatusId;
    this.locationId =
      this.router.getCurrentNavigation()?.extras?.state?.locationId;
    this.palletSerialNumber =
      this.router.getCurrentNavigation()?.extras?.state?.palletSerialNumber;
    this.shipDate = this.router.getCurrentNavigation()?.extras?.state?.shipDate;
    this.receiveDate =
      this.router.getCurrentNavigation()?.extras?.state?.receiveDate;
  }

  ngOnInit(): void {
    debugger
    console.log(
      'Starting -------------------------------->',
      this.dataSharingService.data
    );
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || '';
    this.loggedInCustomerId = userData?.companyId || '';
    this.loggedInLocationId = userData?.locationId || '';
    this.loggedInUserDetails = userData;
    if (this.currentTab === 'purchased') {
      this.orderTypeId = 2;
      this.onlyCustomer = true;
      this.onlyConsign = false;
    } else if (this.currentTab === 'leased') {
      this.orderTypeId = 1;
      this.onlyCustomer = true;
      this.onlyConsign = false;
    } else if (this.currentTab === 'Consignment') {
      this.orderTypeId = 3;
      this.onlyCustomer = false;
      this.onlyConsign = true;
    }
    this.initForm();
    // if (
    //   this.quiltSerialNumber ||
    //   this.quiltStatusId ||
    //   this.locationId ||
    //   this.palletSerialNumber ||
    //   this.shipDate ||
    //   this.receiveDate
    // ) {
    //   this.searchAppliedFlters();
    // }
    // else{
    let fetchData = [
      this.inventoryService
        .getQuiltStatuses()
        .pipe(catchError((error) => of(error))),
    ];
    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      fetchData.push(
        this.inventoryService
          .getCustomerLocations(this.onlyConsign, this.onlyCustomer)
          .pipe(catchError((error) => of(error)))
      );
    } else {
      fetchData.push(
        this.inventoryService
          .getAllLocation()
          .pipe(catchError((error) => of(error)))
      );
    }
    if (this.orderNumber) {
      fetchData.push(
        this.inventoryService
          .inventoryDetailsByOrderNumber(+this.orderNumber, this.getFilters())
          .pipe(catchError((error) => of(error)))
      );
    } else {
      fetchData.push(
        this.inventoryService
          .getInventoryDetails(this.getFilters())
          .pipe(catchError((error) => of(error)))
      );
      fetchData.push(
        this.inventoryService
          .getCustomerInventoryOverview(
            this.orderTypeId,
            '',
            '',
            +this.locationId || 0, this.orderName
          )
          .pipe(catchError((error) => of(error)))
      );
    }
    // }
      // if (!this.orderNumber) {
      //fetchData.push(this.inventoryService.getCustomerDetails(this.loggedInUserDetails?.companyId).pipe(catchError(error => of(error))));
      // }else{
      //   fetchData.push(this.inventoryService.inventoryDetailsByOrderNumber(this.orderNumber, this.getFilters()).pipe(catchError(error => of(error))));
      // }
    
    this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: ([res1, res2, res3, res4]) => {
        this.spinner.hide();
        debugger
        if (res1.statusCode === 200) {
          this.allStatus = res1?.data;
        } else if (res1.message) {
          this.toastrService.error(res1.message);
        }

        if (res2.statusCode === 200) {
          this.allLocations = res2?.data;
        } else if (res2.message) {
          this.toastrService.error(res2.message);
        }
        if (res3.statusCode === 200) {
          
          if (this.orderNumber) {
            this._items$.next(res3?.data?.inventoryDetails);
            this.totalCount = res3?.data?.totalCount;
            this.fullTableData = res3?.data;
            this.pageSizeOptions = [5, 10, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            if (this.totalCount < 5) {
              this.pageSizeOptions = [5, 10];
            }
            this.cd.detectChanges();
          } else {
            this._items$.next(res3?.data?.inventoryDetails?.inventories);
            this.totalCount = res3?.data?.totalCount;
            this.fullTableData = res3?.data;
            this.pageSizeOptions = [5, 10, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            if (this.totalCount < 5) {
              this.pageSizeOptions = [5, 10];
            }
            this.cd.detectChanges();
          }
        } else if (res3.message) {
          this.toastrService.error(res3.message);
        }
        if (res4 && res4.statusCode === 200) {
          this.totalQuantity = res4.data.reduce(
            (a: number, b: any) => +a + +b.totalQuilts,
            0
          );
          this._partnumberItems$.next(res4.data);

          this.cd.detectChanges();
        }
      },
      error: (e) => this.toastrService.error(e.message),
      complete: () => { },
    });
    // }
    // this.fetchQuiltStatuses();
  
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.getAllOrderNames();
    }
    if (this.orderNameId) {
      this.nickNameId.patchValue(+this.orderNameId)
      this.orderNameFilter(+this.orderNameId)
    }
  }
  getFilters() {
    if (this.searchFilter) {
      this.formValues.quiltSerialNumber = this.quiltSerialNumber
        ? this.inventoryForm.controls['quiltSerialNumber']?.patchValue(
          this.quiltSerialNumber
        )
        : '';
      this.formValues.palletSerialNumber = this.palletSerialNumber
        ? this.inventoryForm.controls['palletSerialNumber']?.patchValue(
          this.palletSerialNumber
        )
        : '';
      this.formValues.receiveDate = this.receiveDate
        ? this.inventoryForm.controls['receiveDate']?.patchValue(
          this.receiveDate
        )
        : '';
      this.formValues.shipDate = this.shipDate
        ? this.inventoryForm.controls['shipDate']?.patchValue(this.shipDate)
        : '';
      this.formValues.orderNickName = this.orderName
        ? this.inventoryForm.controls['orderNickName']?.patchValue(this.orderName)
        : '';
      this.formValues.quiltStatusId = this.quiltStatusId
        ? this.inventoryForm.controls['quiltStatusId']?.patchValue(
          +this.quiltStatusId
        )
        : 0;
      this.formValues.locationId = this.locationId
        ? this.inventoryForm.controls['locationId']?.patchValue(
          +this.locationId
        )
        : 0;
      this.formValues.orderTypeId = this.orderTypeId
        ? this.inventoryForm.controls['orderTypeId']?.patchValue(
          +this.orderTypeId
        )
        : 0;
      this.formValues.orderNickName = this.orderName
        ? this.inventoryForm.controls['orderNickName']?.patchValue(
          this.orderName
        )
        : '';
    }
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
      orderNickName: this.orderName || ''
    };
    //console.log(body);
    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      body['companyId'] = this.loggedInUserDetails?.companyId;
    }
    return body;
  }
  get formValues() {
    if (this.isFullyEmpty(this.inventoryForm.getRawValue())) {
      this.searchFilter = false;
    } else {
      this.searchFilter = true;
    }
    return this.inventoryForm.getRawValue();
  }
  sortbtn(name: any) {
    this.inventoryForm.controls.sortByColumn.patchValue(name);
    if (!this.inventoryForm.controls.sortDescendingOrder.value) {
      this.inventoryForm.controls.sortDescendingOrder.patchValue(true);
      this.inventoryForm.controls['pageNumber'].patchValue(1);
      this.getInventoryDetailsByOrderNumber();
    } else {
      this.inventoryForm.controls.sortDescendingOrder.patchValue(false);
      this.inventoryForm.controls['pageNumber'].patchValue(1);
      this.getInventoryDetailsByOrderNumber();
    }
    this.searchFilter = true;
  }
  get tableData(): any[] {
    return this._items$.getValue();
  }
  get partnumberItems$() {
    return this._partnumberItems$.asObservable();
  }
  get isAllSelected(): boolean {
    if (this.tableData && this.tableData.length > 0)
      return this.tableData.every((element) =>
        this.selectedRows.some(
          (row) => row.quiltSerialNumber === element.quiltSerialNumber
        )
      );
    else return false;
  }

  isFullyEmpty(obj: any) {
    return Object.keys(obj).every((key) =>
      key === 'quiltStatusId' ||
        key === 'locationId' ||
        key === 'orderTypeId' ||
        key === 'partNumberId'
        ? obj[key] === 0
        : key === 'pageNumber'
          ? obj[key] === 1
          : key === 'sortDescendingOrder'
            ? obj[key] === false
            : key === 'pageSize'
              ? obj[key] === 10
              : obj[key] === ''
    );
  }

  initForm() {
    console.log('init', this.dataSharingService.data);
    if (
      'inventoryForm' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryForm'] != null &&
      this.dataSharingService.data['inventoryForm'] != undefined
    ) {
      const inventoryFormValues : any = this.dataSharingService.data['inventoryForm'];
      this.inventoryForm = this.fb.group({
        customerNumber: inventoryFormValues?.customerNumber,
        customerName: inventoryFormValues?.customerName,
        orderNumber: inventoryFormValues?.orderNumber,
        quiltSerialNumber: inventoryFormValues?.quiltSerialNumber,
        palletSerialNumber: inventoryFormValues?.palletSerialNumber,
        quiltStatusId: inventoryFormValues?.quiltStatusId,
        locationId: inventoryFormValues?.locationId || this.locationId || 0,
        shipDate: inventoryFormValues?.shipDate,
        receiveDate: inventoryFormValues?.receiveDate,
        partNumberId: 0,
        pageNumber: inventoryFormValues?.pageNumber,
        pageSize: 10,
        orderTypeId: this.orderTypeId || 0,
        orderNickName: inventoryFormValues?.orderNickName || '',
        sortByColumn: '',
        sortDescendingOrder: false,
      });
    } else {
      this.inventoryForm = this.fb.group({
        customerNumber: '',
        customerName: '',
        orderNumber: '',
        quiltSerialNumber: '',
        palletSerialNumber: '',
        quiltStatusId: 0,
        locationId: this.locationId || 0,
        shipDate: '',
        receiveDate: '',
        partNumberId: 0,
        pageNumber: 1,
        pageSize: 10,
        orderTypeId: this.orderTypeId || 0,
        sortByColumn: '',
        sortDescendingOrder: false,
      });
    }
  }

  resetFilters() {
    this.orderName = ''
    this.nickNameId.patchValue(0)
    if (
      'consignListForm' in this.dataSharingService.data &&
      this.dataSharingService.data['consignListForm'] != null &&
      this.dataSharingService.data['consignListForm'] != undefined
    ) {
      this.dataSharingService.data['consignListForm'] = null;
    }

    if (
      'inventoryFormUserRole' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryFormUserRole'] != null &&
      this.dataSharingService.data['inventoryFormUserRole'] != undefined
    ) {
      this.dataSharingService.data['inventoryFormUserRole'] = null;
    }

    if (
      'inventoryForm' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryForm'] != null &&
      this.dataSharingService.data['inventoryForm'] != undefined
    ) {
      this.dataSharingService.data['inventoryForm'] = null;
    }
    this.searchFilter = false;
    this.initForm();
    this.clearSelection(true);
    this.applyFilters();
  }
  getAllOrderNames() {
    const orderNames = this.dashboardService.getAllOrderNames().subscribe((res) => {
      if (res.statusCode === 200) {
        this.allOrderNames = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
  }

  fetchQuiltStatuses() {
    if (!this.tab || ['leased', 'purchased'].includes(this.tab)) {
      this.spinner.show();
      if (
        this.quiltSerialNumber ||
        this.quiltStatusId ||
        this.locationId ||
        this.palletSerialNumber ||
        this.shipDate ||
        this.receiveDate
      ) {
        this.searchAppliedFlters();
      }

      let apiCalled = false;
      const quiltStatusSub =
        this.quiltStatusesService.allQuiltStatuses.subscribe((allstatus) => {
          if (allstatus.length || apiCalled) {
            this.allStatus = allstatus;
            if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
              this.getLocationByCustomerId(this.loggedInCustomerId);
            } else {
              this.fetchAllLocation();
            }
          } else if (!apiCalled) {
            apiCalled = true;
            this.quiltStatusesService.getQuiltStatuses();
          }
        });
      this.subscriptions.push(quiltStatusSub);
    }
  }
  getLocationByCustomerId(customerId: any) {
    this.spinner.show();
    const locationDrop = this.shipmentsService
      .getLocationsByCustomerId(customerId)
      .subscribe((res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.allLocations = res?.data;
        } else if (res.message) {
          this.toastrService.error(res.message);
        }
      });
    this.subscriptions.push(locationDrop);
  }

  fetchAllLocation() {
    this.spinner.show();

    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allLocations.subscribe(
      (allLocations) => {
        if (allLocations.length && apiCalled) {
          this.allLocations = allLocations;
          //this.orderNumberLocation();
        } else if (!apiCalled) {
          apiCalled = true;
          this.getAllLocations.getAllLocationTypes();
        }
      }
    );
    this.subscriptions.push(getAllLoc);
  }
  orderNameFilter(nameId: any) {
    this.orderName = this.allOrderNames.find(x => x.id == nameId)?.name;
  }
  orderNumberLocation() {
    if (!!this.orderNumber) {
      this.getInventoryDetailsByOrderNumber();
    } else if (this.tab === 'purchased') {
      this.getPalletsList.emit();
      // this.contentScroll = true;
    } else {
      this.getCustomerDetails();
    }
  }

  updateStatus() {
    if (!this.tab || ['leased'].includes(this.tab)) {
      let optionalStatus: boolean = false;
      let nochangeStatus: boolean = false;
      if (!this.selectedRows.length) {
        this.toastrService.error(
          'Please select one or more quilts to update their status.'
        );
      } else {
        let quiltIds: number[] = [];
        this.selectedRows.forEach((quilt) => {
          // if (quilt.quiltStatus === "Inactive") {
          quiltIds.push(quilt.quiltId);
          // }
          if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
            quilt.quiltStatus === 'Damaged'
              ? (optionalStatus = true)
              : optionalStatus;
            quilt.quiltStatus === 'Cleaning' || quilt.quiltStatus === 'Shipped'
              ? (nochangeStatus = true)
              : nochangeStatus;
          }
        });
        if (nochangeStatus) {
          this.clearSelection(true);
          this.toastrService.error("Quilt status can't be changed.");
        } else {
          const modalRef = this.modalService.open(UpdateStatusModalComponent, {
            size: 'md',
            centered: true,
            windowClass: 'modal-dialog-centered',
            backdrop: 'static',
          });
          optionalStatus
            ? (modalRef.componentInstance.allStatus = this.allStatus.filter(
              (m) => m.id == 7
            ))
            : (modalRef.componentInstance.allStatus = this.allStatus.filter(
              (m) => m.id == 7 || m.id == 6 || m.id == 8
            ));
          // modalRef.componentInstance.allStatus = this.allStatus.filter(m => m.id == 7 || m.id == 6 || m.id == 8);;
          modalRef.result
            .then((resObject) => {
              this.spinner.show();
              const { quiltStatusId, retiredStatusId } = resObject;
              this.updateQuiltStatusApi({
                quiltStatusId,
                retiredStatusId,
                quiltIds,
              });
            })
            .catch((res) => { });
        }
      }
    }
  }
  updateQuiltStatusApi(event: any) {
    const updateQuiltStatusSub = this.inventoryService
      .updateQuiltStatus(event)
      .subscribe((res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.spinner.hide();
          // if (!!this.tab) {
          this.clearSelection(true);
          this.getInventoryDetailsByOrderNumber();
          // }
          if (res.message) {
            this.toastrService.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastrService.error(res.message);
          }
        }
      });
    this.subscriptions.push(updateQuiltStatusSub);
  }

  getCustomerDetails() {
    if (!this.orderNumber) {
      this.spinner.show();

      const inventorySub = this.inventoryService
        .getCustomerDetails(this.loggedInUserDetails?.companyId)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            const details: any = res?.data?.result;

            for (let key in details) {
              [key] = details[key];
            }
            this.getInventoryDetailsByOrderNumber(false);
          } else {
            this.spinner.hide();
            if (res.message) {
              this.toastrService.error(res.message);
            }
          }
        });
      this.subscriptions.push(inventorySub);
    } else {
      this.spinner.show();
      this.getInventoryDetailsByOrderNumber();
    }
  }

  getInventoryDetailsByOrderNumber(showSpinner: boolean = true) {
    if (showSpinner) this.spinner.show();
    // if (this.searchFilter) {
    //   this.formValues.quiltSerialNumber = this.quiltSerialNumber ? this.inventoryForm.controls['quiltSerialNumber']?.patchValue(this.quiltSerialNumber) : '';
    //   this.formValues.palletSerialNumber = this.palletSerialNumber ? this.inventoryForm.controls['palletSerialNumber']?.patchValue(this.palletSerialNumber) : '';
    //   this.formValues.receiveDate = this.receiveDate ? this.inventoryForm.controls['receiveDate']?.patchValue(this.receiveDate) : '';
    //   this.formValues.shipDate = this.shipDate ? this.inventoryForm.controls['shipDate']?.patchValue(this.shipDate) : '';
    //   this.formValues.quiltStatusId = this.quiltStatusId ? this.inventoryForm.controls['quiltStatusId']?.patchValue(+this.quiltStatusId) : 0;
    //   this.formValues.locationId = this.locationId ? this.inventoryForm.controls['locationId']?.patchValue(+this.locationId) : 0;

    // }
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
      orderNickName: this.orderName || ''
    };
    debugger
    //console.log(body);
    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      const inventorySub = this.inventoryService
        .getInventoryDetails(body)
        .subscribe((res) => {
          if (res.statusCode === 200) {
            this._items$.next(res?.data?.inventoryDetails?.inventories);
            // this.inventoryUserRole = res.data.inventoryDetails;
            this.totalCount = res?.data?.totalCount;
            this.pageSizeOptions = [5, 10, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            if (this.totalCount < 5) {
              this.pageSizeOptions = [5, 10];
            }
            this.spinner.hide();
          } else {
            this.spinner.hide();
            this._items$.next([]);
            // this.handleRouting();
            if (res.message) {
              this.toastrService.error(res.message);
            }
          }
          // if (!this.showLoader) {
          //   this.showLoader = true;
          // }
        });
      this.subscriptions.push(inventorySub);

      // body["companyId"] = this.loggedInUserDetails?.companyId;
    } else {
      const inventorySub = this.inventoryService
        .inventoryDetailsByOrderNumber(+this.orderNumber, body)
        .subscribe((res) => {
          // this.spinner.hide();
          if (res.statusCode === 200) {
            this._items$.next(res?.data?.inventoryDetails);
            this.totalCount = res?.data?.totalCount;
            this.fullTableData = res?.data;
            this.pageSizeOptions = [5, 10, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            if (this.totalCount < 5) {
              this.pageSizeOptions = [5, 10];
            }
            this.spinner.hide();
          } else {
            this.spinner.hide();
            this._items$.next([]);
            // this.handleRouting();
            if (res.message) {
              this.toastrService.error(res.message);
            }
          }
        });
      this.subscriptions.push(inventorySub);
    }
  }

  searchAppliedFlters() {
    this.searchFilter = true;
    this.applyFilters();
  }

  applyFilters() {
    this.inventoryForm.controls['pageNumber'].patchValue(1);
    if (
      [
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
        this.roleEnum.globalAdmin,
      ].includes(this.loggedInUserRole)
    ) {
      this.getUserInventoryOverview();
    }
    this.getInventoryDetailsByOrderNumber();
  }

  handleRouting() {
    if (
      [
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
        this.roleEnum.globalAdmin, this.roleEnum.consignAdmin, this.roleEnum.consignManager
      ].includes(this.loggedInUserRole)
    ) {
      let tab = this.path.includes('purchased')
        ? 'purchased'
        : this.path.includes('consigned')
          ? 'consigned' || 'consignment'
          : 'leased';
      this.router.navigate(['inventory', 'quilts-inventory'], {
        queryParams: { tab: tab },
      });
    } else {
      // Changed for tab handling
      if (
        this.path.includes('purchased') &&
        ![this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
          this.loggedInUserRole
        )
      ) {
        this.router.navigate(['inventory', 'quilts-inventory'], {
          queryParams: { tab: 'purchased' },
        });
      } else {
        this.router.navigate(['inventory', 'quilts-inventory'], {
          queryParams: { tab: 'leased' },
        });
      }
    }
  }
  getUserInventoryOverview() {
    this.spinner.show();
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
      orderNickName: this.orderName || ''
    };
    this.inventoryService
      .getCustomerInventoryOverview(this.orderTypeId, '', '', +body.locationId, this.orderName)
      .subscribe((res) => {
        if (res) {
          if (res.statusCode == 200) {
            this.totalQuantity = res.data.reduce(
              (a: number, b: any) => +a + +b.totalQuilts,
              0
            );
            this._partnumberItems$.next(res.data);
            // if(!this.isAllPartNumbers){
            //   this.isAllPartNumbers=true;
            this.allPartNumbers = res.data;
            // }
          } else {
            this.toastrService.error(res.message);
          }
        }
        this.spinner.hide();
      });
  }
  paginator(event: any) {
    if (!this.searchFilter) {
      this.initForm();
    }

    const { pageSize, pageNumber } = this.inventoryForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);
    this.getInventoryDetailsByOrderNumber();
  }

  masterToggle(checked: boolean) {
    if (!!checked) {
      this.clearSelection();
      this.selectedRows.push(...this.tableData);
    } else {
      this.clearSelection();
    }
  }

  checkStockInSelectedRows(stock: any) {
    return this.selectedRows.some(
      (element) => element.quiltSerialNumber === stock.quiltSerialNumber
    );
  }

  selectRows(stock: any, checked: boolean) {
    if (!!checked) {
      this.selectedRows.push(stock);
    } else {
      let selectedIndex = this.selectedRows.findIndex(
        (element) => element.quiltSerialNumber === stock.quiltSerialNumber
      );
      this.selectedRows.splice(selectedIndex, 1);
    }
  }

  clearSelection(clearAll: boolean = false) {
    if (clearAll === false) {
      this.tableData.forEach((row) => {
        const index: number = this.selectedRows.findIndex(
          (element: any) => element.quiltSerialNumber === row.quiltSerialNumber
        );
        if (index !== -1) {
          this.selectedRows.splice(index, 1);
        }
      });
    } else {
      this.selectedRows = [];
    }
  }

  createPallet() {
    const selectedRows = this.selectedRows;
    if (!selectedRows?.length) {
      this.openMockPalletModal();
    } else {
      const isAllQuiltsStatuesSame: boolean = this.checkQuiltsForSameStatus();
      const isCheckQuiltsForUserRole: boolean = this.checkQuiltsForUserRole();
      const isAllQuiltsLocationSame: boolean =
        this.checkQuiltsForSameLocation();

      if (
        !!isCheckQuiltsForUserRole &&
        (this.loggedInUserRole === this.roleEnum.customerAdmin ||
          this.loggedInUserRole === this.roleEnum.customerManager) &&
        !!isAllQuiltsLocationSame
      ) {
        this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
        this.router.navigate(['/inventory/quilts-inventory/create-pallet'], {
          queryParams: {
            companyName: this.companyName,
            companyNumber: this.companyNumber,
            orderNumber: this.orderNumber,
            tab: this.path.includes('leased') || {} ? 'leased' : 'purchased',
          },
        });
      } else if (
        !!isAllQuiltsStatuesSame &&
        (this.loggedInUserRole === this.roleEnum.masterAdmin ||
          this.loggedInUserRole === this.roleEnum.warehouseUser ||
          this.loggedInUserRole === this.roleEnum.globalAdmin)
      ) {
        this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
        this.router.navigate(['/inventory/quilts-inventory/create-pallet'], {
          queryParams: {
            companyName: this.companyName,
            companyNumber: this.companyNumber,
            orderNumber: this.orderNumber,
            tab: this.path.includes('leased') || {} ? 'leased' : 'purchased',
          },
        });
      } else {
        // this.toastrService.error("To create a pallet, choose quilts with the same status and types.");
        this.showErrMsgForSameQuiltsStatus();
        this.selectedRows = [];
      }
    }
  }

  checkQuiltsForSameStatus(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    return selectedQuilts.every(
      (quilt) =>
        quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
        quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
    );
  }

  checkQuiltsForUserRole(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    return selectedQuilts.every(
      (quilt) =>
        quilt.quiltStatus === 'Received' &&
        quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
        quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
    );
  }

  checkQuiltsForSameLocation(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    if([this.roleEnum.globalAdmin, this.roleEnum.consignAdmin,this.roleEnum.customerAdmin].includes(
      this.loggedInUserRole
    )){
      return selectedQuilts.every(
        (quilt) =>
          // quilt.locationId === this.loggedInLocationId &&
          quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
          quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
      );
    }else{
      return selectedQuilts.every(
        (quilt) =>
          quilt.locationId === this.loggedInLocationId &&
          quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
          quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
      );
    }
    // return selectedQuilts.every(
    //   (quilt) =>
    //     // quilt.locationId === this.loggedInLocationId &&
    //     quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
    //     quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
    // );
  }

  showErrMsgForSameQuiltsStatus() {
    debugger
    const selection = this.selectedRows;
    const isAllQuiltsLocationSame: boolean = this.checkQuiltsForSameLocation();
    if (
      !selection?.length &&
      [
        this.roleEnum.masterAdmin,
        this.roleEnum.warehouseUser,
        this.roleEnum.globalAdmin,
      ].includes(this.loggedInUserRole)
    ) {
      this.toastrService.error(
        'To create a pallet, please choose at least one quilt.'
      );
    } else if (
      selection?.length &&
      [this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(
        this.loggedInUserRole
      ) &&
      isAllQuiltsLocationSame
    ) {
      this.toastrService.error(
        "To create a pallet, please choose quilt with status 'Received' and of same type."
      );
    } else if (
      !isAllQuiltsLocationSame &&
      selection?.length &&
      [this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(
        this.loggedInUserRole
      )
    ) {
      this.toastrService.error(
        'It appears that the selected quilts do not belong to you. Please verify your selection.'
      );
    } else {
      this.toastrService.error(
        'To create a pallet, choose quilts with the same status and types.'
      );
    }
  }

  openMockPalletModal() {
    const modalRef = this.modalService.open(CreatePalletModalComponent, {
      size: 'md',
      centered: true,
      windowClass: 'modal-dialog-centered',
      backdrop: 'static',
    });

    modalRef.result
      .then((data) => {
        this.spinner.show();
        const typeOfData = typeof data;
        if (typeOfData == 'number') {
          this.createMockPallet(data);
        } else {
          this.spinner.hide();
          this.selectedRows = data;
          this.createPallet();
        }
      })
      .catch((res) => { });
  }

  createMockPallet(quiltsQuantity: number) {
    const mockPalletSub = this.inventoryService
      .createMockPallet(quiltsQuantity)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (res.message) {
            this.toastrService.success(res.message);
          }
        } else if (res.message) {
          this.toastrService.error(res.message);
        }
      });
    this.subscriptions.push(mockPalletSub);
  }
  partNumberCardFilter(part: any) {
    this.inventoryForm.controls.partNumberId.patchValue(part);
    this.searchAppliedFlters();
  }
  partNumberCardFilterReset() {
    this.inventoryForm.controls.partNumberId.patchValue(0);
    this.searchAppliedFlters();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}*/

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, forkJoin, of, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { FetchQuiltStatusesService } from 'src/app/shared/services/fetch-quilt-statuses.service';
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { InventoryService } from '../../inventory.service';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePalletModalComponent } from '../../create-pallet-modal/create-pallet-modal.component';
import { ShipmentsService } from 'src/app/modules/shipments/shipments.service';
import { UpdateStatusModalComponent } from '../../update-status-modal/update-status-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { PageEvent } from '@angular/material/paginator';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';
import { DashboardService } from 'src/app/modules/dashboard/dashboard/dashboard.service';

@Component({
  selector: 'app-full-table-view',
  templateUrl: './full-table-view.component.html',
  styleUrls: ['./full-table-view.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FullTableViewComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  private subscriptions: Subscription[] = [];
  public roleEnum = Roles;
  allStatus: any[] = [];
  allLocations: any[] = [];
  public isCollapsed = true;
  length: number;
  pageEvent: PageEvent;
  pageSize = 10;
  pageSizeOptions: number[] = [10];
  pageSizeMoreOptions: number[] = [10, 50, 100];
  fullTableData: any;
  path: string = this.activatedRoute?.routeConfig?.path;
  state = this.activatedRoute?.snapshot?.queryParams;
  @Input() tab: string;
  orderNumber: number = this.activatedRoute?.snapshot?.params?.id;
  orderNumberName: any =
    this.activatedRoute?.snapshot?.queryParams?.orderNumberName;
  quiltsAssigned: any =
    this.activatedRoute?.snapshot?.queryParams?.quiltsAssigned;
  companyName: string = this.activatedRoute?.snapshot?.queryParams?.companyName;
  companyNumber: string =
    this.activatedRoute?.snapshot?.queryParams?.companyNumber;
  inventoryScanned: string =
    this.activatedRoute?.snapshot?.queryParams?.inventoryScanned;
  quiltSerialNumber: string;
  quiltStatusId: string;
  locationId: string;
  palletSerialNumber: string;
  shipDate: string;
  receiveDate: string;
  onHand: string = this.activatedRoute?.snapshot?.queryParams?.onHand;
  activeQuilts: number =
    this.activatedRoute?.snapshot?.queryParams?.activeQuilts;
  searchFilter: boolean = false;
  selectedRows: any[] = [];
  inventoryForm: FormGroup;
  totalCount: number;
  loggedInUserRole: Roles;
  masterAdminRoles: string[] = [
    this.roleEnum.masterAdmin,
    this.roleEnum.warehouseUser,
  ];
  companyAdminRoles: string[] = [
    this.roleEnum.customerAdmin,
    this.roleEnum.customerManager,
    this.roleEnum.globalAdmin,
  ];
  loggedInUserDetails: any;
  loggedInCustomerId: any;
  loggedInLocationId: any;
  allQuiltsStatus: any[] = [];
  @Output() getPalletsList = new EventEmitter();
  orderTypeId: any;
  nickNameId: FormControl = new FormControl(0);
  allPartNumbers: any[] = [];
  totalQuantity: number;
  private _partnumberItems$ = new BehaviorSubject<any[]>([]);
  // contentScroll: boolean = false;
  currentTab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  orderNameId: string = this.activatedRoute?.snapshot?.queryParams?.orderNameId;
  get items$() {
    return this._items$.asObservable();
  }
  onlyCustomer: boolean = false;
  onlyConsign: boolean = false;
  allOrderNames: any[] = [];
  orderName: string = '';
  isLoading: boolean = false;
  SortDescendingOrder: boolean = false;
  sortByColumn: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private quiltStatusesService: FetchQuiltStatusesService,
    private getAllLocations: FetchAllLocationsService,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private shipmentsService: ShipmentsService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private dataSharingService: DataSharingService
  ) {
    this.quiltSerialNumber =
      this.router.getCurrentNavigation()?.extras?.state?.quiltSerialNumber;
    this.quiltStatusId =
      this.router.getCurrentNavigation()?.extras?.state?.quiltStatusId;
    this.locationId =
      this.router.getCurrentNavigation()?.extras?.state?.locationId;
    this.palletSerialNumber =
      this.router.getCurrentNavigation()?.extras?.state?.palletSerialNumber;
    this.shipDate = this.router.getCurrentNavigation()?.extras?.state?.shipDate;
    this.receiveDate =
      this.router.getCurrentNavigation()?.extras?.state?.receiveDate;
  }

  ngOnInit(): void {
    debugger
    console.log(
      'Starting -------------------------------->',
      this.dataSharingService.data
    );
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || '';
    this.loggedInCustomerId = userData?.companyId || '';
    this.loggedInLocationId = userData?.locationId || '';
    this.loggedInUserDetails = userData;
    if (this.currentTab === 'purchased') {
      this.orderTypeId = 2;
      this.onlyCustomer = true;
      this.onlyConsign = false;
    } else if (this.currentTab === 'leased') {
      this.orderTypeId = 1;
      this.onlyCustomer = true;
      this.onlyConsign = false;
    } else if (this.currentTab === 'Consignment') {
      this.orderTypeId = 3;
      this.onlyCustomer = false;
      this.onlyConsign = true;
    }
    this.initForm();
    // if (
    //   this.quiltSerialNumber ||
    //   this.quiltStatusId ||
    //   this.locationId ||
    //   this.palletSerialNumber ||
    //   this.shipDate ||
    //   this.receiveDate
    // ) {
    //   this.searchAppliedFlters();
    // }
    // else{
    let fetchData = [
      this.inventoryService
        .getQuiltStatuses()
        .pipe(catchError((error) => of(error))),
    ];
    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      fetchData.push(
        this.inventoryService
          .getCustomerLocations(this.onlyConsign, this.onlyCustomer)
          .pipe(catchError((error) => of(error)))
      );
    } else {
      fetchData.push(
        this.inventoryService
          .getAllLocation()
          .pipe(catchError((error) => of(error)))
      );
    }
    if (this.orderNumber) {
      fetchData.push(
        this.inventoryService
          .inventoryDetailsByOrderNumber(+this.orderNumber, this.getFilters())
          .pipe(catchError((error) => of(error)))
      );
    } else {
      fetchData.push(
        this.inventoryService
          .getInventoryDetails(this.getFilters())
          .pipe(catchError((error) => of(error)))
      );
      fetchData.push(
        this.inventoryService
          .getCustomerInventoryOverview(
            this.orderTypeId,
            '',
            '',
            +this.locationId || 0, this.orderName
          )
          .pipe(catchError((error) => of(error)))
      );
    }
    // }
    // if (!this.orderNumber) {
    //fetchData.push(this.inventoryService.getCustomerDetails(this.loggedInUserDetails?.companyId).pipe(catchError(error => of(error))));
    // }else{
    //   fetchData.push(this.inventoryService.inventoryDetailsByOrderNumber(this.orderNumber, this.getFilters()).pipe(catchError(error => of(error))));
    // }
    this.isLoading = true;
    // this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: ([res1, res2, res3, res4]) => {
        // this.spinner.hide();
        this.isLoading = false;
        debugger
        if (res1.statusCode === 200) {
          this.allStatus = res1?.data;
        } else if (res1.message) {
          this.toastrService.error(res1.message);
        }

        if (res2.statusCode === 200) {
          this.allLocations = res2?.data;
        } else if (res2.message) {
          this.toastrService.error(res2.message);
        }
        if (res3.statusCode === 200) {

          if (this.orderNumber) {
            this._items$.next(res3?.data?.inventoryDetails);
            this.totalCount = res3?.data?.totalCount;
            this.fullTableData = res3?.data;
            this.pageSizeOptions = [10, 20, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            // if (this.totalCount < 5) {
            //   this.pageSizeOptions = [5, 10];
            // }
            this.cd.detectChanges();
          } else {
            this._items$.next(res3?.data?.inventoryDetails?.inventories);
            this.totalCount = res3?.data?.totalCount;
            this.fullTableData = res3?.data;
            this.pageSizeOptions = [10, 20, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            // if (this.totalCount < 5) {
            //   this.pageSizeOptions = [5, 10];
            // }
            this.cd.detectChanges();
          }
        } else if (res3.message) {
          this.toastrService.error(res3.message);
        }
        if (res4 && res4.statusCode === 200) {
          this.totalQuantity = res4.data.reduce(
            (a: number, b: any) => +a + +b.totalQuilts,
            0
          );
          this._partnumberItems$.next(res4.data);

          this.cd.detectChanges();
        }
      },
      error: (e) => this.toastrService.error(e.message),
      complete: () => { this.isLoading = false; },
    });
    // }
    // this.fetchQuiltStatuses();

    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.getAllOrderNames();
    }
    if (this.orderNameId) {
      this.nickNameId.patchValue(+this.orderNameId)
      this.orderNameFilter(+this.orderNameId)
    }
  }
  getFilters() {
    if (this.searchFilter) {
      this.formValues.quiltSerialNumber = this.quiltSerialNumber
        ? this.inventoryForm.controls['quiltSerialNumber']?.patchValue(
          this.quiltSerialNumber
        )
        : '';
      this.formValues.palletSerialNumber = this.palletSerialNumber
        ? this.inventoryForm.controls['palletSerialNumber']?.patchValue(
          this.palletSerialNumber
        )
        : '';
      this.formValues.receiveDate = this.receiveDate
        ? this.inventoryForm.controls['receiveDate']?.patchValue(
          this.receiveDate
        )
        : '';
      this.formValues.shipDate = this.shipDate
        ? this.inventoryForm.controls['shipDate']?.patchValue(this.shipDate)
        : '';
      this.formValues.orderNickName = this.orderName
        ? this.inventoryForm.controls['orderNickName']?.patchValue(this.orderName)
        : '';
      this.formValues.quiltStatusId = this.quiltStatusId
        ? this.inventoryForm.controls['quiltStatusId']?.patchValue(
          +this.quiltStatusId
        )
        : 0;
      this.formValues.locationId = this.locationId
        ? this.inventoryForm.controls['locationId']?.patchValue(
          +this.locationId
        )
        : 0;
      this.formValues.orderTypeId = this.orderTypeId
        ? this.inventoryForm.controls['orderTypeId']?.patchValue(
          +this.orderTypeId
        )
        : 0;
      this.formValues.orderNickName = this.orderName
        ? this.inventoryForm.controls['orderNickName']?.patchValue(
          this.orderName
        )
        : '';
    }
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
      orderNickName: this.orderName || ''
    };
    //console.log(body);
    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      body['companyId'] = this.loggedInUserDetails?.companyId;
    }
    return body;
  }
  get formValues() {
    if (this.isFullyEmpty(this.inventoryForm.getRawValue())) {
      this.searchFilter = false;
    } else {
      this.searchFilter = true;
    }
    return this.inventoryForm.getRawValue();
  }
  sort(name: any) {
    this.inventoryForm.controls.sortByColumn.patchValue(name);
    if (!this.inventoryForm.controls.SortDescendingOrder.value) {
      this.inventoryForm.controls.SortDescendingOrder.patchValue(true);
      this.inventoryForm.controls['pageNumber'].patchValue(1);
      this.getInventoryDetailsByOrderNumber();
    } else {
      this.inventoryForm.controls.SortDescendingOrder.patchValue(false);
      this.inventoryForm.controls['pageNumber'].patchValue(1);
      this.getInventoryDetailsByOrderNumber();
    }
    this.searchFilter = true;
  }
  get tableData(): any[] {
    return this._items$.getValue();
  }
  get partnumberItems$() {
    return this._partnumberItems$.asObservable();
  }
  get isAllSelected(): boolean {
    if (this.tableData && this.tableData.length > 0)
      return this.tableData.every((element) =>
        this.selectedRows.some(
          (row) => row.quiltSerialNumber === element.quiltSerialNumber
        )
      );
    else return false;
  }

  isFullyEmpty(obj: any) {
    return Object.keys(obj).every((key) =>
      key === 'quiltStatusId' ||
        key === 'locationId' ||
        key === 'orderTypeId' ||
        key === 'partNumberId'
        ? obj[key] === 0
        : key === 'pageNumber'
          ? obj[key] === 1
          : key === 'SortDescendingOrder'
            ? obj[key] === false
            : key === 'pageSize'
              ? obj[key] === 10
              : obj[key] === ''
    );
  }

  initForm() {
    console.log('init', this.dataSharingService.data);
    if (
      'inventoryForm' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryForm'] != null &&
      this.dataSharingService.data['inventoryForm'] != undefined
    ) {
      const inventoryFormValues: any = this.dataSharingService.data['inventoryForm'];
      this.inventoryForm = this.fb.group({
        customerNumber: inventoryFormValues?.customerNumber,
        customerName: inventoryFormValues?.customerName,
        orderNumber: inventoryFormValues?.orderNumber,
        quiltSerialNumber: inventoryFormValues?.quiltSerialNumber,
        palletSerialNumber: inventoryFormValues?.palletSerialNumber,
        quiltStatusId: inventoryFormValues?.quiltStatusId,
        locationId: inventoryFormValues?.locationId || this.locationId || 0,
        shipDate: inventoryFormValues?.shipDate,
        receiveDate: inventoryFormValues?.receiveDate,
        partNumberId: 0,
        pageNumber: inventoryFormValues?.pageNumber,
        pageSize: 10,
        orderTypeId: this.orderTypeId || 0,
        orderNickName: inventoryFormValues?.orderNickName || '',
        sortByColumn: "",
        SortDescendingOrder: false,
      });
    } else {
      this.inventoryForm = this.fb.group({
        customerNumber: '',
        customerName: '',
        orderNumber: '',
        quiltSerialNumber: '',
        palletSerialNumber: '',
        quiltStatusId: 0,
        locationId: this.locationId || 0,
        shipDate: '',
        receiveDate: '',
        partNumberId: 0,
        pageNumber: 1,
        pageSize: 10,
        orderTypeId: this.orderTypeId || 0,
        sortByColumn: "",
        SortDescendingOrder: false,
      });
    }
  }

  resetFilters() {
    this.orderName = ''
    this.nickNameId.patchValue(0)
    if (
      'consignListForm' in this.dataSharingService.data &&
      this.dataSharingService.data['consignListForm'] != null &&
      this.dataSharingService.data['consignListForm'] != undefined
    ) {
      this.dataSharingService.data['consignListForm'] = null;
    }

    if (
      'inventoryFormUserRole' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryFormUserRole'] != null &&
      this.dataSharingService.data['inventoryFormUserRole'] != undefined
    ) {
      this.dataSharingService.data['inventoryFormUserRole'] = null;
    }

    if (
      'inventoryForm' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryForm'] != null &&
      this.dataSharingService.data['inventoryForm'] != undefined
    ) {
      this.dataSharingService.data['inventoryForm'] = null;
    }
    this.searchFilter = false;
    this.initForm();
    this.clearSelection(true);
    this.applyFilters();
  }
  getAllOrderNames() {
    const orderNames = this.dashboardService.getAllOrderNames().subscribe((res) => {
      if (res.statusCode === 200) {
        this.allOrderNames = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
  }

  fetchQuiltStatuses() {
    if (!this.tab || ['leased', 'purchased'].includes(this.tab)) {
      this.spinner.show();
      if (
        this.quiltSerialNumber ||
        this.quiltStatusId ||
        this.locationId ||
        this.palletSerialNumber ||
        this.shipDate ||
        this.receiveDate
      ) {
        this.searchAppliedFlters();
      }

      let apiCalled = false;
      const quiltStatusSub =
        this.quiltStatusesService.allQuiltStatuses.subscribe((allstatus) => {
          if (allstatus.length || apiCalled) {
            this.allStatus = allstatus;
            if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
              this.getLocationByCustomerId(this.loggedInCustomerId);
            } else {
              this.fetchAllLocation();
            }
          } else if (!apiCalled) {
            apiCalled = true;
            this.quiltStatusesService.getQuiltStatuses();
          }
        });
      this.subscriptions.push(quiltStatusSub);
    }
  }
  getLocationByCustomerId(customerId: any) {
    this.spinner.show();
    const locationDrop = this.shipmentsService
      .getLocationsByCustomerId(customerId)
      .subscribe((res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.allLocations = res?.data;
        } else if (res.message) {
          this.toastrService.error(res.message);
        }
      });
    this.subscriptions.push(locationDrop);
  }

  fetchAllLocation() {
    this.spinner.show();

    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allLocations.subscribe(
      (allLocations) => {
        if (allLocations.length && apiCalled) {
          this.allLocations = allLocations;
          //this.orderNumberLocation();
        } else if (!apiCalled) {
          apiCalled = true;
          this.getAllLocations.getAllLocationTypes();
        }
      }
    );
    this.subscriptions.push(getAllLoc);
  }
  orderNameFilter(nameId: any) {
    this.orderName = this.allOrderNames.find(x => x.id == nameId)?.name;
  }
  orderNumberLocation() {
    if (!!this.orderNumber) {
      this.getInventoryDetailsByOrderNumber();
    } else if (this.tab === 'purchased') {
      this.getPalletsList.emit();
      // this.contentScroll = true;
    } else {
      this.getCustomerDetails();
    }
  }

  updateStatus() {
    if (!this.tab || ['leased'].includes(this.tab)) {
      let optionalStatus: boolean = false;
      let nochangeStatus: boolean = false;
      if (!this.selectedRows.length) {
        this.toastrService.error(
          'Please select one or more quilts to update their status.'
        );
      } else {
        let quiltIds: number[] = [];
        this.selectedRows.forEach((quilt) => {
          // if (quilt.quiltStatus === "Inactive") {
          quiltIds.push(quilt.quiltId);
          // }
          if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
            quilt.quiltStatus === 'Damaged'
              ? (optionalStatus = true)
              : optionalStatus;
            quilt.quiltStatus === 'Cleaning' || quilt.quiltStatus === 'Shipped'
              ? (nochangeStatus = true)
              : nochangeStatus;
          }
        });
        if (nochangeStatus) {
          this.clearSelection(true);
          this.toastrService.error("Quilt status can't be changed.");
        } else {
          const modalRef = this.modalService.open(UpdateStatusModalComponent, {
            size: 'md',
            centered: true,
            windowClass: 'modal-dialog-centered',
            backdrop: 'static',
          });
          optionalStatus
            ? (modalRef.componentInstance.allStatus = this.allStatus.filter(
              (m) => m.id == 7
            ))
            : (modalRef.componentInstance.allStatus = this.allStatus.filter(
              (m) => m.id == 7 || m.id == 6 || m.id == 8
            ));
          // modalRef.componentInstance.allStatus = this.allStatus.filter(m => m.id == 7 || m.id == 6 || m.id == 8);;
          modalRef.result
            .then((resObject) => {
              this.spinner.show();
              const { quiltStatusId, retiredStatusId } = resObject;
              this.updateQuiltStatusApi({
                quiltStatusId,
                retiredStatusId,
                quiltIds,
              });
            })
            .catch((res) => { });
        }
      }
    }
  }
  updateQuiltStatusApi(event: any) {
    const updateQuiltStatusSub = this.inventoryService
      .updateQuiltStatus(event)
      .subscribe((res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.spinner.hide();
          // if (!!this.tab) {
          this.clearSelection(true);
          this.getInventoryDetailsByOrderNumber();
          // }
          if (res.message) {
            this.toastrService.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastrService.error(res.message);
          }
        }
      });
    this.subscriptions.push(updateQuiltStatusSub);
  }

  getCustomerDetails() {
    if (!this.orderNumber) {
      this.spinner.show();

      const inventorySub = this.inventoryService
        .getCustomerDetails(this.loggedInUserDetails?.companyId)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            const details: any = res?.data?.result;

            for (let key in details) {
              [key] = details[key];
            }
            this.getInventoryDetailsByOrderNumber(false);
          } else {
            this.spinner.hide();
            if (res.message) {
              this.toastrService.error(res.message);
            }
          }
        });
      this.subscriptions.push(inventorySub);
    } else {
      this.spinner.show();
      this.getInventoryDetailsByOrderNumber();
    }
  }

  getInventoryDetailsByOrderNumber(showSpinner: boolean = true) {
    // if (showSpinner) this.spinner.show();
    this.isLoading = true;
    // if (this.searchFilter) {
    //   this.formValues.quiltSerialNumber = this.quiltSerialNumber ? this.inventoryForm.controls['quiltSerialNumber']?.patchValue(this.quiltSerialNumber) : '';
    //   this.formValues.palletSerialNumber = this.palletSerialNumber ? this.inventoryForm.controls['palletSerialNumber']?.patchValue(this.palletSerialNumber) : '';
    //   this.formValues.receiveDate = this.receiveDate ? this.inventoryForm.controls['receiveDate']?.patchValue(this.receiveDate) : '';
    //   this.formValues.shipDate = this.shipDate ? this.inventoryForm.controls['shipDate']?.patchValue(this.shipDate) : '';
    //   this.formValues.quiltStatusId = this.quiltStatusId ? this.inventoryForm.controls['quiltStatusId']?.patchValue(+this.quiltStatusId) : 0;
    //   this.formValues.locationId = this.locationId ? this.inventoryForm.controls['locationId']?.patchValue(+this.locationId) : 0;

    // }
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
      orderNickName: this.orderName || ''
    };
    debugger
    //console.log(body);
    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      const inventorySub = this.inventoryService
        .getInventoryDetails(body)
        .subscribe((res) => {
          if (res.statusCode === 200) {
            this._items$.next(res?.data?.inventoryDetails?.inventories);
            // this.inventoryUserRole = res.data.inventoryDetails;
            this.totalCount = res?.data?.totalCount;
            this.pageSizeOptions = [10, 20, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            // if (this.totalCount < 5) {
            //   this.pageSizeOptions = [5, 10];
            // }
          } else {
            this._items$.next([]);
            // this.handleRouting();
            if (res.message) {
              this.toastrService.error(res.message);
            }
          }
          this.isLoading = false;
          // if (!this.showLoader) {
          //   this.showLoader = true;
          // }
        });
      this.subscriptions.push(inventorySub);

      // body["companyId"] = this.loggedInUserDetails?.companyId;
    } else {
      const inventorySub = this.inventoryService
        .inventoryDetailsByOrderNumber(+this.orderNumber, body)
        .subscribe((res) => {
          // this.spinner.hide();
          if (res.statusCode === 200) {
            this._items$.next(res?.data?.inventoryDetails);
            this.totalCount = res?.data?.totalCount;
            this.fullTableData = res?.data;
            this.pageSizeOptions = [10, 20, 50, 100];
            if (!this.pageSizeOptions.includes(this.totalCount)) {
              this.pageSizeOptions.push(this.totalCount);
            }
            // if (this.totalCount < 5) {
            //   this.pageSizeOptions = [5, 10];
            // }
          } else {
            this._items$.next([]);
            // this.handleRouting();
            if (res.message) {
              this.toastrService.error(res.message);
            }
          }
          this.isLoading = false;
        });
      this.subscriptions.push(inventorySub);
    }
  }

  searchAppliedFlters() {
    this.searchFilter = true;
    this.applyFilters();
  }

  applyFilters() {
    this.inventoryForm.controls['pageNumber'].patchValue(1);
    if (
      [
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
        this.roleEnum.globalAdmin,
      ].includes(this.loggedInUserRole)
    ) {
      this.getUserInventoryOverview();
    }
    this.getInventoryDetailsByOrderNumber();
  }

  handleRouting() {
    if (
      [
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
        this.roleEnum.globalAdmin, this.roleEnum.consignAdmin, this.roleEnum.consignManager
      ].includes(this.loggedInUserRole)
    ) {
      let tab = this.path.includes('purchased')
        ? 'purchased'
        : this.path.includes('consigned')
          ? 'consigned' || 'consignment'
          : 'leased';
      this.router.navigate(['inventory', 'quilts-inventory'], {
        queryParams: { tab: tab },
      });
    } else {
      // Changed for tab handling
      if (
        this.path.includes('purchased') &&
        ![this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
          this.loggedInUserRole
        )
      ) {
        this.router.navigate(['inventory', 'quilts-inventory'], {
          queryParams: { tab: 'purchased' },
        });
      } else {
        this.router.navigate(['inventory', 'quilts-inventory'], {
          queryParams: { tab: 'leased' },
        });
      }
    }
  }
  getUserInventoryOverview() {
    this.isLoading = true;
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
      orderNickName: this.orderName || ''
    };
    this.inventoryService
      .getCustomerInventoryOverview(this.orderTypeId, '', '', +body.locationId, this.orderName || '')
      .subscribe((res) => {
        if (res) {
          if (res.statusCode == 200) {
            this.totalQuantity = res.data.reduce(
              (a: number, b: any) => +a + +b.totalQuilts,
              0
            );
            this._partnumberItems$.next(res.data);
            // if(!this.isAllPartNumbers){
            //   this.isAllPartNumbers=true;
            this.allPartNumbers = res.data;
            // }
          } else {
            this.toastrService.error(res.message);
          }
        }
        this.isLoading = false;
      });
  }
  paginator(event: any) {
    if (!this.searchFilter) {
      this.initForm();
    }

    const { pageSize, pageNumber } = this.inventoryForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);
    this.getInventoryDetailsByOrderNumber();
  }

  masterToggle(checked: boolean) {
    if (!!checked) {
      this.clearSelection();
      this.selectedRows.push(...this.tableData);
    } else {
      this.clearSelection();
    }
  }

  checkStockInSelectedRows(stock: any) {
    return this.selectedRows.some(
      (element) => element.quiltSerialNumber === stock.quiltSerialNumber
    );
  }

  selectRows(stock: any, checked: boolean) {
    if (!!checked) {
      this.selectedRows.push(stock);
    } else {
      let selectedIndex = this.selectedRows.findIndex(
        (element) => element.quiltSerialNumber === stock.quiltSerialNumber
      );
      this.selectedRows.splice(selectedIndex, 1);
    }
  }

  clearSelection(clearAll: boolean = false) {
    if (clearAll === false) {
      this.tableData.forEach((row) => {
        const index: number = this.selectedRows.findIndex(
          (element: any) => element.quiltSerialNumber === row.quiltSerialNumber
        );
        if (index !== -1) {
          this.selectedRows.splice(index, 1);
        }
      });
    } else {
      this.selectedRows = [];
    }
  }

  createPallet() {
    const selectedRows = this.selectedRows;
    if (!selectedRows?.length) {
      this.openMockPalletModal();
    } else {
      const isAllQuiltsStatuesSame: boolean = this.checkQuiltsForSameStatus();
      const isCheckQuiltsForUserRole: boolean = this.checkQuiltsForUserRole();
      const isAllQuiltsLocationSame: boolean =
        this.checkQuiltsForSameLocation();

      if (
        !!isCheckQuiltsForUserRole &&
        (this.loggedInUserRole === this.roleEnum.customerAdmin ||
          this.loggedInUserRole === this.roleEnum.customerManager) &&
        !!isAllQuiltsLocationSame
      ) {
        this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
        this.router.navigate(['/inventory/quilts-inventory/create-pallet'], {
          queryParams: {
            companyName: this.companyName,
            companyNumber: this.companyNumber,
            orderNumber: this.orderNumber,
            tab: this.path.includes('leased') || {} ? 'leased' : 'purchased',
          },
        });
      } else if (
        !!isAllQuiltsStatuesSame &&
        (this.loggedInUserRole === this.roleEnum.masterAdmin ||
          this.loggedInUserRole === this.roleEnum.warehouseUser ||
          this.loggedInUserRole === this.roleEnum.globalAdmin)
      ) {
        this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
        this.router.navigate(['/inventory/quilts-inventory/create-pallet'], {
          queryParams: {
            companyName: this.companyName,
            companyNumber: this.companyNumber,
            orderNumber: this.orderNumber,
            tab: this.path.includes('leased') || {} ? 'leased' : 'purchased',
          },
        });
      } else {
        // this.toastrService.error("To create a pallet, choose quilts with the same status and types.");
        this.showErrMsgForSameQuiltsStatus();
        this.selectedRows = [];
      }
    }
  }

  checkQuiltsForSameStatus(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    return selectedQuilts.every(
      (quilt) =>
        quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
        quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
    );
  }

  checkQuiltsForUserRole(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    return selectedQuilts.every(
      (quilt) =>
        quilt.quiltStatus === 'Received' &&
        quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
        quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
    );
  }

  checkQuiltsForSameLocation(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    if ([this.roleEnum.globalAdmin, this.roleEnum.consignAdmin, this.roleEnum.customerAdmin].includes(
      this.loggedInUserRole
    )) {
      return selectedQuilts.every(
        (quilt) =>
          // quilt.locationId === this.loggedInLocationId &&
          quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
          quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
      );
    } else {
      return selectedQuilts.every(
        (quilt) =>
          quilt.locationId === this.loggedInLocationId &&
          quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
          quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
      );
    }
    // return selectedQuilts.every(
    //   (quilt) =>
    //     // quilt.locationId === this.loggedInLocationId &&
    //     quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
    //     quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
    // );
  }

  showErrMsgForSameQuiltsStatus() {
    debugger
    const selection = this.selectedRows;
    const isAllQuiltsLocationSame: boolean = this.checkQuiltsForSameLocation();
    if (
      !selection?.length &&
      [
        this.roleEnum.masterAdmin,
        this.roleEnum.warehouseUser,
        this.roleEnum.globalAdmin,
      ].includes(this.loggedInUserRole)
    ) {
      this.toastrService.error(
        'To create a pallet, please choose at least one quilt.'
      );
    } else if (
      selection?.length &&
      [this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(
        this.loggedInUserRole
      ) &&
      isAllQuiltsLocationSame
    ) {
      this.toastrService.error(
        "To create a pallet, please choose quilt with status 'Received' and of same type."
      );
    } else if (
      !isAllQuiltsLocationSame &&
      selection?.length &&
      [this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(
        this.loggedInUserRole
      )
    ) {
      this.toastrService.error(
        'It appears that the selected quilts do not belong to you. Please verify your selection.'
      );
    } else {
      this.toastrService.error(
        'To create a pallet, choose quilts with the same status and types.'
      );
    }
  }

  openMockPalletModal() {
    const modalRef = this.modalService.open(CreatePalletModalComponent, {
      size: 'md',
      centered: true,
      windowClass: 'modal-dialog-centered',
      backdrop: 'static',
    });

    modalRef.result
      .then((data) => {
        this.spinner.show();
        const typeOfData = typeof data;
        if (typeOfData == 'number') {
          this.createMockPallet(data);
        } else {
          this.spinner.hide();
          this.selectedRows = data;
          this.createPallet();
        }
      })
      .catch((res) => { });
  }

  createMockPallet(quiltsQuantity: number) {
    const mockPalletSub = this.inventoryService
      .createMockPallet(quiltsQuantity)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (res.message) {
            this.toastrService.success(res.message);
          }
        } else if (res.message) {
          this.toastrService.error(res.message);
        }
      });
    this.subscriptions.push(mockPalletSub);
  }
  partNumberCardFilter(part: any) {
    this.inventoryForm.controls.partNumberId.patchValue(part);
    this.searchAppliedFlters();
  }
  partNumberCardFilterReset() {
    this.inventoryForm.controls.partNumberId.patchValue(0);
    this.searchAppliedFlters();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}

