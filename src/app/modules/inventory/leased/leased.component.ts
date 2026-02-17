import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CreatePalletModalComponent } from '../create-pallet-modal/create-pallet-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateStatusModalComponent } from '../update-status-modal/update-status-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { DataSharingService } from '../../../shared/services/data-sharing.service';
@Component({
  selector: 'leased',
  templateUrl: './leased.component.html',
  styleUrls: ['./leased.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeasedComponent implements OnInit {
  @Input() tabIndex: any;
  @Input() inventoryForm: FormGroup;
  @Input() allStatus: any[] = [];
  @Input() inventory: any[] = [];
  @Input() totalCount: number;
  @Input() allLocations: any[] = [];
  @Input() searchFilter: boolean = false;
  @Input() showLoader: boolean = true;
  @Output() applyFilters: any = new EventEmitter();
  @Output() resetFilters: any = new EventEmitter();
  @Output() refreshtable: any = new EventEmitter();
  public roleEnum = Roles;
  path: string = this.activatedRoute?.routeConfig?.path;
  orderNumber: number = this.activatedRoute?.snapshot?.params?.id;
  companyName: string = this.activatedRoute?.snapshot?.queryParams?.companyName;
  companyNumber: string =
    this.activatedRoute?.snapshot?.queryParams?.companyNumber;
  locationId: number = +this.activatedRoute?.snapshot?.queryParams?.locationId;
  partNumber: string = this.activatedRoute?.snapshot?.queryParams?.partNumber;
  selectedRows: any[] = [];
  loggedInUserRole: Roles;
  loggedInLocationId: any;
  inventoryFormUserRole: FormGroup;
  searchText: string = undefined;
  consignListForm: FormGroup;

  companyAdminRoles: string[] = [
    this.roleEnum.customerAdmin,
    this.roleEnum.customerManager,
  ];
  loggedInUserDetails: any;
  searchFilterUserRole: boolean = false;
  totalCountUserRole: number;
  totalCustomers: number;
  inventoryUserRole: any[] = [];
  inventoryUserDetails: any[] = [];
  newDetail: string;
  private _items1$ = new BehaviorSubject<[]>([]);
  private subscriptions: Subscription[] = [];
  get items1$() {
    return this._items1$.asObservable();
  }

  get tableData(): any[] {
    return this._items1$.getValue();
  }

  get isAllSelected(): boolean {
    return this.tableData.every((element) =>
      this.selectedRows.some(
        (row) => row.quiltSerialNumber === element.quiltSerialNumber
      )
    );
  }
  pageSizeOptions: number[] = [5, 10, 50, 100];

  public isCollapsed = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    console.log('this.searchFilter ---->', this.searchFilter);

    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || '';
    this.loggedInUserDetails = userData;
    this.loggedInLocationId = userData?.locationId || '';
    if (
      [...this.companyAdminRoles].includes(this.loggedInUserRole) &&
      this.tabIndex !== 3
    ) {
      this.initForm();
      this.getInventoryDetailsForPurchsed();
      //this.spinner.show()
    }
    if (
      this.loggedInUserRole === this.roleEnum.consignAdmin ||
      this.loggedInUserRole === this.roleEnum.consignManager ||
      ((this.loggedInUserRole === this.roleEnum.customerAdmin ||
        this.loggedInUserRole === this.roleEnum.globalAdmin) &&
        this.tabIndex == 3)
    ) {
      this.initformForConsign();
      if (this.tabIndex == 0 || this.tabIndex == 3) {
        if (this.locationId && this.partNumber) {
          this.consignListForm.controls.locationId.patchValue(this.locationId);
          this.consignListForm.controls.partNumber.patchValue(this.partNumber);
          this.consignListForm.controls.quiltStatusId.patchValue(1);
          this.searchFilter = true;
          this.applyFilters.emit();
        }
        this.getAllConsignOrders();
      } else if (this.tabIndex == 1) {
        this.refreshtable.emit();
      }
    }
    if ([this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      this.initForm();
      if (this.tabIndex == 1) {
        this.getInventoryDetailsForPurchsed();
      } else {
        this.refreshtable.emit();
      }
    }
    // else {
    //   this.initForm();
    //   this.resetFilters.emit();
    // }
  }

  initForm() {
    if (
      'inventoryFormUserRole' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryFormUserRole'] != null &&
      this.dataSharingService.data['inventoryFormUserRole'] != undefined
    ) {
      console.log(
        'inventoryFormUserRole',
        this.dataSharingService.data['inventoryFormUserRole'],
        this.searchFilter
      );
      this.inventoryFormUserRole = this.fb.group(
        this.dataSharingService.data['inventoryFormUserRole']
      );
    } else {
      this.inventoryFormUserRole = this.fb.group({
        quiltSerialNumber: '',
        palletSerialNumber: '',
        quiltStatusId: 0,
        locationId: 0,
        shipDate: '',
        receiveDate: '',
        partNumberId: 0,
        orderNumber: '',
        pageNumber: 1,
        pageSize: 10,
        orderTypeId: 2,
        sortByColumn: '',
        sortDescendingOrder: false,
      });
    }
    // this.inventoryFormUserRole = this.fb.group({
    //   quiltSerialNumber: '',
    //   palletSerialNumber: '',
    //   quiltStatusId: 0,
    //   locationId: 0,
    //   shipDate: '',
    //   receiveDate: '',
    //   partNumberId: 0,
    //   orderNumber: '',
    //   pageNumber: 1,
    //   pageSize: 10,
    //   orderTypeId: 2,
    //   sortByColumn: '',
    //   sortDescendingOrder: false,
    // });
  }

  initformForConsign() {
    if (
      'consignListForm' in this.dataSharingService.data &&
      this.dataSharingService.data['consignListForm'] != null &&
      this.dataSharingService.data['consignListForm'] != undefined
    ) {
      console.log(
        'ConsignListForm',
        this.dataSharingService.data['consignListForm'],
        this.searchFilter
      );
      this.consignListForm = this.fb.group(
        this.dataSharingService.data['consignListForm']
      );
    } else {
      this.consignListForm = this.fb.group({
        customerNumber: '',
        customerName: '',
        quiltSerialNumber: '',
        palletSerialNumber: '',
        quiltStatusId: 0,
        locationId: 0,
        partNumber: '',
        shipDate: '',
        receiveDate: '',
        searchBy: '',
        orderNumber: '',
        sortByColumn: 'name',
        sortDescendingOrder: true,
        pageNumber: 1,
        pageSize: 10,
      });
    }
  }

  sortbtn(name: any) {
    if (
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      ) ||
      ((this.loggedInUserRole === this.roleEnum.customerAdmin ||
        this.loggedInUserRole === this.roleEnum.globalAdmin) &&
        this.tabIndex == 3)
    ) {
      this.consignListForm.controls.sortByColumn.patchValue(name);
      if (!this.consignListForm.controls.sortDescendingOrder.value) {
        this.consignListForm.controls.sortDescendingOrder.patchValue(true);
        this.consignListForm.controls['pageNumber'].patchValue(1);
        this.getAllConsignOrders();
      } else {
        this.consignListForm.controls.sortDescendingOrder.patchValue(false);
        this.consignListForm.controls['pageNumber'].patchValue(1);
        this.getAllConsignOrders();
      }
    } else {
      this.inventoryFormUserRole.controls.sortByColumn.patchValue(name);
      if (!this.inventoryFormUserRole.controls.sortDescendingOrder.value) {
        this.inventoryFormUserRole.controls.sortDescendingOrder.patchValue(
          true
        );
        this.inventoryFormUserRole.controls['pageNumber'].patchValue(1);
        this.getInventoryDetailsForPurchsed();
      } else {
        this.inventoryFormUserRole.controls.sortDescendingOrder.patchValue(
          false
        );
        this.inventoryFormUserRole.controls['pageNumber'].patchValue(1);
        this.getInventoryDetailsForPurchsed();
      }
    }
    this.searchFilter = true;
  }
  get formValues() {
    if (
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      ) ||
      ((this.loggedInUserRole === this.roleEnum.customerAdmin ||
        this.loggedInUserRole === this.roleEnum.globalAdmin) &&
        this.tabIndex == 3)
    ) {
      Object.assign(this.dataSharingService.data, {
        consignListForm: this.consignListForm.getRawValue(),
      });
      return this.consignListForm.getRawValue();
    } else {
      Object.assign(this.dataSharingService.data, {
        inventoryForm: this.inventoryForm.getRawValue(),
      });
      return this.inventoryForm.getRawValue();
    }
  }

  get formValues1() {
    // Object.assign(this.dataSharingService.data, {
    //   inventoryFormUserRole: this.formValues1,
    // });
    // Object.assign(this.dataSharingService.data,inventoryFormUserRole)
    return this.inventoryFormUserRole.getRawValue();
  }
  reset() {
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
    this.searchFilterUserRole = false;
    if (
      this.loggedInUserRole === this.roleEnum.consignAdmin ||
      this.loggedInUserRole === this.roleEnum.consignManager ||
      ((this.loggedInUserRole === this.roleEnum.customerAdmin ||
        this.loggedInUserRole === this.roleEnum.globalAdmin) &&
        this.tabIndex == 3)
    ) {
      this.initformForConsign();
      this.applyFiltersConsignRole();
    } else {
      this.initForm();
      this.applyFiltersUserRole();
    }
    this.clearSelection(true);
  }

  search() {
    this.searchFilterUserRole = true;
    if (
      this.loggedInUserRole === this.roleEnum.consignAdmin ||
      this.loggedInUserRole === this.roleEnum.consignManager ||
      ((this.loggedInUserRole === this.roleEnum.customerAdmin ||
        this.loggedInUserRole === this.roleEnum.globalAdmin) &&
        this.tabIndex == 3)
    ) {
      this.applyFiltersConsignRole();
    } else {
      this.applyFiltersUserRole();
    }
  }

  applyFiltersConsignRole() {
    debugger;
    this.consignListForm.controls['pageNumber'].patchValue(1);
    this.getAllConsignOrders();
  }

  applyFiltersUserRole() {
    this.inventoryFormUserRole.controls['pageNumber'].patchValue(1);
    this.getInventoryDetailsForPurchsed();
  }

  getInventoryDetailsForPurchsed() {
    if (this.showLoader) this.spinner.show();
    const body = {
      ...this.formValues1,
      shipDate: this.formValues1.shipDate
        ? moment(this.formValues1.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues1.receiveDate
        ? moment(this.formValues1.receiveDate).format('MM/DD/YYYY')
        : '',
    };
    debugger;
    const inventorySub = this.inventoryService
      .getInventoryDetails(body)
      .subscribe((res) => {
        if (res.statusCode === 200) {
          this._items1$.next(res?.data?.inventoryDetails?.inventories);
          this.inventoryUserRole = res.data.inventoryDetails;
          this.totalCountUserRole = res?.data?.totalCount;
          this.pageSizeOptions = [5, 10, 50, 100];
          if (!this.pageSizeOptions.includes(this.totalCountUserRole)) {
            this.pageSizeOptions.push(this.totalCountUserRole);
          }
          if (this.totalCountUserRole < 5) {
            this.pageSizeOptions = [5, 10];
          }
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this._items1$.next([]);
          // this.handleRouting();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
        if (!this.showLoader) {
          this.showLoader = true;
        }
      });
    this.subscriptions.push(inventorySub);
  }

  getAllConsignOrders() {
    this.spinner.show();
    const body = {
      ...this.formValues,
      shipDate: this.formValues.shipDate
        ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
        : '',
      receiveDate: this.formValues.receiveDate
        ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
        : '',
    };
    const consignListSub = this.inventoryService
      .getConsignedOrder(body)
      .subscribe((res) => {
        console.log(res);

        if (res.statusCode === 200) {
          this._items1$.next(res?.data?.inventories);
          this.totalCustomers = res?.data?.totalCount;
          this.pageSizeOptions = [5, 10, 50, 100];
          if (!this.pageSizeOptions.includes(this.totalCustomers)) {
            this.pageSizeOptions.push(this.totalCustomers);
          }
          if (this.totalCustomers < 5) {
            this.pageSizeOptions = [5, 10];
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 1500);
        } else {
          this._items1$.next([]);
          if (res.message) {
            this.toastr.error(res.message);
            this.spinner.hide();
          }
        }
        // setTimeout(() => {
        // this.spinner.hide();
        // }, 2500);
      });
    this.subscriptions.push(consignListSub);
  }

  updateStatus() {
    let optionalStatus: boolean = false;
    let nochangeStatus: boolean = false;
    // if (!this.tab || ["leased"].includes(this.tab)) {
    debugger;
    if (!this.selectedRows.length) {
      this.toastr.error(
        'Please select one or more quilts to update their status.'
      );
    } else {
      let quiltIds: number[] = [];
      this.selectedRows.forEach((quilt) => {
        quiltIds.push(quilt.quiltId);
        if (
          this.loggedInUserRole === this.roleEnum.customerAdmin ||
          this.loggedInUserRole === this.roleEnum.globalAdmin
        ) {
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
        this.toastr.error("Quilt status can't be changed.");
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
        modalRef.componentInstance.retiredSelected = false;

        // modalRef.componentInstance.allStatus = this.allStatus.filter(m => m.id == 7 || m.id == 6 || m.id == 8);
        modalRef.result
          .then((resObject) => {
            this.spinner.show();
            debugger;
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
    // }
  }
  updateQuiltStatusApi(event: any) {
    const updateQuiltStatusSub = this.inventoryService
      .updateQuiltStatus(event)
      .subscribe((res: any) => {
        this.clearSelection(true);
        if (res.statusCode === 200 || res.statusCode === 201) {
          // if (!this.tab) {

          this.getInventoryDetailsForPurchsed();
          // }
          if (res.message) {
            this.toastr.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(updateQuiltStatusSub);
  }
  navigateToFullTableView(
    orderNumber: number,
    orderNumberName: string,
    companyName: string,
    companyNumber: string,
    activeQuilts: number,
    quiltsAssigned: any,
    quiltSerialNumber: any,
    quiltStatusId: any,
    palletSerialNumber: any,
    locationId: any,
    shipDate: any,
    receiveDate: any
  ) {
    this.router.navigate(
      [
        `/inventory/quilts-inventory/${this.tabIndex === 1 ? 'purchased' : 'leased'
        }`,
        orderNumber,
      ],
      {
        queryParams: {
          orderNumberName,
          companyName,
          companyNumber,
          activeQuilts,
          quiltsAssigned,
        },
        // , quiltSerialNumber, quiltStatusId, palletSerialNumber, locationId, shipDate, receiveDate
        state: {
          quiltSerialNumber: quiltSerialNumber,
          quiltStatusId: quiltStatusId,
          palletSerialNumber: palletSerialNumber,
          locationId: +locationId,
          shipDate: shipDate,
          receiveDate: receiveDate,
        },
      }
    );
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
    debugger;
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
          this.loggedInUserRole === this.roleEnum.globalAdmin ||
          this.loggedInUserRole === this.roleEnum.consignAdmin ||
          this.loggedInUserRole === this.roleEnum.consignManager ||
          this.loggedInUserRole === this.roleEnum.customerManager) &&
        !!isAllQuiltsLocationSame
      ) {
        this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
        this.router.navigate(['/inventory/quilts-inventory/create-pallet'], {
          queryParams: {
            companyName: this.companyName,
            companyNumber: this.companyNumber,
            orderNumber: this.orderNumber,
            tab:
              this.loggedInUserRole === this.roleEnum.consignAdmin ||
                this.loggedInUserRole === this.roleEnum.consignManager ||
                ((this.loggedInUserRole === this.roleEnum.customerAdmin ||
                  this.loggedInUserRole === this.roleEnum.globalAdmin) &&
                  this.tabIndex == 3)
                ? 'consignment'
                : this.path.includes('leased')
                  ? 'leased'
                  : 'purchased',
          },
        });
      }

      // else if (!!isAllQuiltsStatuesSame && (this.loggedInUserRole === this.roleEnum.masterAdmin || this.loggedInUserRole === this.roleEnum.warehouseUser)) {
      //   this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
      //   this.router.navigate(["/inventory/quilts-inventory/create-pallet"], { queryParams: { companyName: this.companyName, companyNumber: this.companyNumber, orderNumber: this.orderNumber, tab: this.path.includes("leased") ? "leased" : "purchased" } });
      // }
      else {
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

    if (
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      )
    ) {
      return selectedQuilts.every(
        (quilt) =>
          quilt.quiltStatus === 'Received' &&
          quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
      );
    } else {
      return selectedQuilts.every(
        (quilt) =>
          (quilt.status === 'Received' || quilt.quiltStatus === 'Received') &&
          quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
          (quilt.statusId === selectedQuilts[0].statusId ||
            quilt.quiltStatusId === selectedQuilts[0].quiltStatusId)
      );
    }
  }

  checkQuiltsForSameLocation(): boolean {
    debugger
    const selectedQuilts: any[] = this.selectedRows;
    if (
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      )
    ) {
      return selectedQuilts.every(
        (quilt) =>
          quilt.locationId === selectedQuilts[0].locationId &&
          quilt.quiltStatus === 'Received' &&
          quilt.quiltStatusId === selectedQuilts[0].quiltStatusId
      );
    } else {
      return selectedQuilts.every(
        (quilt) =>
          quilt.locationId === this.loggedInLocationId &&
          quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId &&
          (quilt.statusId === selectedQuilts[0].statusId ||
            quilt.quiltStatusId === selectedQuilts[0].quiltStatusId)
      );
    }
  }

  showErrMsgForSameQuiltsStatus() {
    const selection = this.selectedRows;
    const isAllQuiltsLocationSame: boolean = this.checkQuiltsForSameLocation();
    if (
      !selection?.length &&
      [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser].includes(
        this.loggedInUserRole
      )
    ) {
      this.toastr.error(
        'To create a pallet, please choose at least one quilt.'
      );
    } else if (
      selection?.length &&
      [
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
        this.roleEnum.globalAdmin,
      ].includes(this.loggedInUserRole) &&
      isAllQuiltsLocationSame
    ) {
      this.toastr.error(
        "To create a pallet, please choose quilt with status 'Received' and of same type."
      );
    } else if (
      !isAllQuiltsLocationSame &&
      selection?.length &&
      [
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
        this.roleEnum.globalAdmin,
      ].includes(this.loggedInUserRole)
    ) {
      this.toastr.error(
        'It appears that the selected quilts do not belong to you. Please verify your selection.'
      );
    } else {
      this.toastr.error(
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
            this.toastr.success(res.message);
          }
        } else if (res.message) {
          this.toastr.error(res.message);
        }
      });
    this.subscriptions.push(mockPalletSub);
  }

  paginate(event: any) {
    this.inventoryForm.controls['pageSize'].patchValue(event.pageSize);
    this.inventoryForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.refreshtable.emit();
  }

  paginate1(event: any) {
    this.inventoryFormUserRole.controls['pageSize'].patchValue(event.pageSize);
    this.inventoryFormUserRole.controls['pageNumber'].patchValue(
      event.pageIndex + 1
    );
    this.getInventoryDetailsForPurchsed();
    // this.refreshtable.emit();
  }

  paginate2(event: any) {
    this.consignListForm.controls['pageSize'].patchValue(event.pageSize);
    this.consignListForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getAllConsignOrders();
  }
}
