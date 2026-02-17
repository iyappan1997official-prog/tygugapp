import { ChangeDetectionStrategy } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, forkJoin, of, Subscription } from 'rxjs';
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { FetchQuiltStatusesService } from 'src/app/shared/services/fetch-quilt-statuses.service';
import { FetchPalletStatusService } from 'src/app/shared/services/fetch-pallet-status.service';
import { FetchQuiltTypesService } from 'src/app/shared/services/fetch-quilt-types.service';
import { AuthService } from '../../auth/auth.service';
import { InventoryService } from '../inventory.service';
import { IndividualInStockComponent } from './child-components/individual-in-stock/individual-in-stock.component';
import { PalletInStockComponent } from './child-components/pallet-in-stock/pallet-in-stock.component';
import { InactiveStockComponent } from './child-components/inactive-stock/inactive-stock.component';
import { Roles } from 'src/app/shared/roles/rolesVar';

enum Tabs {
  "individual" = 0,
  "pallet" = 1,
  "inActive" = 2
}

@Component({
  selector: 'in-stock',
  templateUrl: './in-stock.component.html',
  styleUrls: ['./in-stock.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InStockComponent implements OnInit, OnDestroy {
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  @ViewChild(IndividualInStockComponent) individualInStockComponent: IndividualInStockComponent;
  @ViewChild(PalletInStockComponent) palletInStockComponent: PalletInStockComponent;
  @ViewChild(InactiveStockComponent) inactiveStockComponent: InactiveStockComponent;
  private unsubscribe: Subscription[] = [];
  private _items$ = new BehaviorSubject<[]>([]);
  public roleEnum = Roles;
  pallets: any[] = [];
  totalStock: number;
  allLocations: any[] = [];
  pageSizeOptions: number[] = [5, 10];
  allConsignLocations: any[] = [];
  palletLength: number;
  individualStocks: any[] = [];
  consignStocks: any[] = [];
  inActiveStocks: any[] = [];
  alltypes: any[] = [];
  allStatus: any[] = [];
  tabChangeSub: Subscription;
  tabIndex: number | string = 0;
  stocksDataForm: FormGroup;
  consignStockDataForm: FormGroup;
  loggedInUserRole: Roles;
  userDetails: any;
  searchText: string = undefined;
  searchFilter: boolean = false;
  tabClicked: string;
  selectedStatus: number;
  masterAdminRoles: string[] = [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser];
  companyAdminROles: string[] = [this.roleEnum.customerAdmin, this.roleEnum.customerManager];
  consignmantRoles: string[] = [this.roleEnum.consignAdmin, this.roleEnum.consignManager]
  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private quiltTypesService: FetchQuiltTypesService,
    private router: Router,
    private quiltStatusesService: FetchQuiltStatusesService,
    private palletStatusesService: FetchPalletStatusService,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private authService: AuthService,
    private getAllLocations: FetchAllLocationsService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";

    this.handleTabChangeSub();

    if (this.tab === "in-stock") {
      if ([...this.masterAdminRoles, this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
        //this.fetchQuiltTypes();
        this.fetchData();
      }
      else if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        this.fetchConsignLocation()
        // this.getStockForConsign();
      }
    }
  }
  fetchData() {
    let fetchData = [this.inventoryService.getQuiltTypes().pipe(catchError(error => of(error))),
    (this.tabClicked == 'pallet') ? this.inventoryService.getPalletStatuses().pipe(catchError(error => of(error))) : (this.tabClicked == 'inActive') ? this.inventoryService.getInactiveStatuses().pipe(catchError(error => of(error))) : this.inventoryService.getQuiltStatuses().pipe(catchError(error => of(error))),
    ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) ? this.inventoryService.getLocationForConsign().pipe(catchError(error => of(error))) : this.inventoryService.getAllLocation().pipe(catchError(error => of(error)))];

    if (this.tabIndex === 1) {
      if ([this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
        fetchData.push(this.inventoryService.getPalletsForCompany(this.formValues).pipe(catchError(error => of(error))));
      } else {
        fetchData.push(this.inventoryService.getPallets(this.formValues).pipe(catchError(error => of(error))));
      }
    } else if (this.tabIndex === 2) {
      fetchData.push(this.inventoryService.getInActive(this.formValues).pipe(catchError(error => of(error))));
    } else {
      if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        fetchData.push(this.inventoryService.getInStockConsigned(this.formValues).pipe(catchError(error => of(error))));
      } else {
        fetchData.push(this.inventoryService.getIndividualStocks(this.formValues).pipe(catchError(error => of(error))));
      }
    }

    this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: ([res1, res2, res3, res4]) => {
        if (res1.statusCode === 200) {
          this.alltypes = res1?.data;
        } else if (res1.message) {
          this.toastrService.error(res1.message)
        }

        if (res2.statusCode === 200) {
          this.allStatus = res2?.data;
        } else if (res2.message) {
          this.toastrService.error(res2.message)
        }

        if (res3.statusCode === 200) {
          ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) ? this.allConsignLocations = res3?.data : this.allLocations = res3?.data;
        } else if (res3.message) {
          this.toastrService.error(res3.message)
        }
        if (res4.statusCode === 200) {
          if (this.tabIndex === 1) {
            this.individualStocks = [];
            this.inActiveStocks = [];
            this.pallets = res4?.data?.pallets;
            this.palletLength = res4?.data?.totalCount;

          } else if (this.tabIndex === 2) {
            this.inActiveStocks = res4?.data;
            this.pallets = []
            this.individualStocks = [];
          }

          else {
            if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
              this.consignStocks = res4?.data?.inventories;
              this.pallets = [];
              this.inActiveStocks = [];
            } else {
              this.individualStocks = res4?.data;
              this.pallets = [];
              this.inActiveStocks = [];
            }
          }
          //this.cd.detectChanges();
        } else if (res4.message) {
          this.toastrService.error(res4.message)
        }
      },
      error: (e) => this.toastrService.error(e.message),
      complete: () => { this.spinner.hide() }
    });
  }
  initForm() {
    // if (![this.roleEnum.consignAdmin].includes(this.loggedInUserRole)) {
    this.stocksDataForm = this.fb.group({
      quiltTypeId: 0,
      inventoryStatusId: 0,
      retiredStatusId: 0,
      quiltSerialNumber: "",
      searchBy: "",
      palletNumber: "",
      locationId: 0,
      description: "",
      sortByColumn: "",
      sortDescendingOrder: false,
      pageNumber: 1,
      pageSize: 10
    })
    // }
    //  else {
    //   this.consignStockDataForm = this.fb.group({
    //     quiltTypeId: 0,
    //     inventoryStatusId: 0,
    //     sortByColumn: "",
    //     searchBy: "",
    //     sortDescendingOrder: false,
    //     pageNumber: 1,
    //     pageSize: 10
    //   })
    // }

    // if (this.companyAdminROles.includes(this.loggedInUserRole)) {
    //   this.stocksDataForm.controls.companyId.patchValue(+this.userDetails?.companyId);
    // }
  }
  inactiveSelect(event: any) {
    this.selectedStatus = event.value
    if (this.tabIndex == 2 && [8, 10, 13].includes(event.value)) {
      this.stocksDataForm.controls.retiredStatusId.patchValue(event.value)
      this.stocksDataForm.controls.inventoryStatusId.patchValue(7)
    }
  }
  sortbtn(name: any) {
    this.stocksDataForm.controls.sortByColumn.patchValue(name);
    if (!this.stocksDataForm.controls.sortDescendingOrder.value) {
      this.stocksDataForm.controls.sortDescendingOrder.patchValue(true);
      this.stocksDataForm.controls['pageNumber'].patchValue(1);
      this.fetchTableData()
    } else {
      this.stocksDataForm.controls.sortDescendingOrder.patchValue(false);
      this.stocksDataForm.controls['pageNumber'].patchValue(1);
      this.fetchTableData()
    }
    this.searchFilter = true
  }
  handleTabChangeSub(): void {
    debugger
    this.tabChangeSub = this.activatedRoute?.queryParams?.subscribe((queryParams) => {
      const tab: any = queryParams as { tab: string };

      if (!!tab.tab) {
        this.tabClicked = tab.stock;
        this.tabIndex = Tabs[tab.stock];
      }
    });
  }

  get formValues(): any {
    return this.stocksDataForm.getRawValue();
  }

  get formValues1(): any {
    return this.consignStockDataForm.getRawValue();
  }

  fetchQuiltTypes() {
    this.spinner.show();

    let apiCalled = false;
    const quiltTypesSub = this.quiltTypesService.quiltTypes.subscribe((types) => {
      if (types.length || apiCalled) {
        this.alltypes = types;
        this.fetchQuiltStatuses();
      } else if (!apiCalled) {
        apiCalled = true;
        this.quiltTypesService.getQuiltTypes();
      }
    })
    this.unsubscribe.push(quiltTypesSub);
  }

  fetchQuiltStatuses() {
    this.spinner.show();

    let apiCalled = false;
    const quiltStatusSub = this.quiltStatusesService.allQuiltStatuses.subscribe((allstatus) => {
      if (allstatus.length || apiCalled) {
        this.allStatus = allstatus;
        this.fetchAllLocation();
      } else if (!apiCalled) {
        apiCalled = true;
        this.quiltStatusesService.getQuiltStatuses();
      }
    })
    this.unsubscribe.push(quiltStatusSub);
  }
  getInactiveStatuses() {
    this.spinner.show();
    const inactiveInStockSub = this.inventoryService.getInactiveStatuses().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allStatus = res?.data;
      } else {
        this.allStatus = [];
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(inactiveInStockSub);
  }

  fetchPalletStatuses() {
    this.spinner.show();

    let apiCalled = false;
    const quiltStatusSub = this.palletStatusesService.allPalletStatuses.subscribe((allstatus) => {
      if (allstatus.length || apiCalled) {
        this.allStatus = allstatus;
        this.fetchAllLocation();
      } else if (!apiCalled) {
        apiCalled = true;
        this.palletStatusesService.getPalletStatuses();
      }
    })
    this.unsubscribe.push(quiltStatusSub);
  }
  fetchAllLocation(fetchTableData: boolean = true) {
    this.spinner.show();

    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allLocations.subscribe((allLocations) => {

      if (allLocations.length || apiCalled) {
        this.allLocations = allLocations;

        if (!!fetchTableData) {
          this.fetchTableData();
        }
      } else if (!apiCalled) {
        apiCalled = true;
        this.getAllLocations.getAllLocationTypes();


      }
    })
    this.unsubscribe.push(getAllLoc);
  }

  fetchConsignLocation() {
    this.spinner.show();
    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allConsignLocations.subscribe((allConsignLocations) => {

      if (allConsignLocations.length || apiCalled) {
        this.allConsignLocations = allConsignLocations;
        this.fetchTableData();
      } else if (!apiCalled) {
        apiCalled = true;
        this.getAllLocations.getConsignLocation();
      }
    })
    this.unsubscribe.push(getAllLoc);
  }


  fetchTableData() {

    if (this.tabIndex === 1) {
      [this.roleEnum.serviceManager].includes(this.loggedInUserRole) ? this.getPalletForService() : this.getPalletStockData();
    } else if (this.tabIndex === 2) {
      this.getInactiveStock();
    } else {
      if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        this.getStockForConsign();
      } else {
        this.getIndividulaStock();
      }
    }
  }

  getIndividulaStock() {
    this.spinner.show();

    const individualInStockSub = this.inventoryService.getIndividualStocks(this.formValues).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.individualStocks = res?.data;
      } else {
        this.individualStocks = [];

        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(individualInStockSub);
  }

  getStockForConsign() {
    this.spinner.show();
    // console.log(this.formValues1);

    const consignInStockSub = this.inventoryService.getInStockConsigned(this.formValues).subscribe((res) => {
      if (res.statusCode === 200) {
        this.consignStocks = res?.data?.inventories;
        this.totalStock = res?.data?.totalCount;
        console.log(res.data);
        this.spinner.hide();

      } else {
        this.consignStocks = [];

        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(consignInStockSub);
  }

  getInactiveStock() {
    this.spinner.show();
    const inActiveSub = this.inventoryService.getInActive(this.formValues).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.inActiveStocks = res?.data;
      } else {
        this.inActiveStocks = [];
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(inActiveSub);
  }

  getPalletStockData() {
    this.spinner.show();

    const palletInStockSub = this.inventoryService.getPallets(this.formValues).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.pallets = res?.data?.pallets;
        this.palletLength = res?.data?.totalCount;
      } else {
        this.pallets = [];

        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.spinner.hide();
    this.fetchAllLocation(false);
    this.unsubscribe.push(palletInStockSub);
  }

  getPalletForService() {
    this.spinner.show();
    const palletInStockSub = this.inventoryService.getPalletsForCompany(this.formValues).subscribe((res) => {
      if (res.statusCode === 200) {
        this.pallets = res?.data?.palletList?.pallets;
        this.palletLength = res?.data?.totalCount;
        this.spinner.hide();
      } else {
        this.pallets = [];
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    // this.spinner.hide();
    this.fetchAllLocation(false);
    this.unsubscribe.push(palletInStockSub);
  }

  createPallet() {
    this.individualInStockComponent.createPalletModal();
  }

  callMockPalletApi(quiltsQuantity: number) {
    const mockPalletSub = this.inventoryService.createMockPallet(quiltsQuantity).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200 || res.statusCode === 201) {
        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(mockPalletSub);
  }

  updateStatus() {

    if (!this.tabIndex) {
      this.individualInStockComponent.updateQuiltStatus();
      return;
    }

    if (this.tabIndex === 2) {
      this.inactiveStockComponent.updateQuiltStatus();
      return;
    }

    // Block Pallet update
    if (this.tabIndex === 1) {
      this.toastrService.error("Pallet status update is disabled.");
      return;
    }
  }

  updateQuiltStatusApi(event: any) {
    console.log(event);
    const updateQuiltStatusSub = this.inventoryService.updateQuiltStatus(event).subscribe((res: any) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        if (!this.tabIndex) {
          this.individualInStockComponent.clearSelection(true);
          this.getIndividulaStock();
        } else if (this.tabIndex === 2) {
          this.inactiveStockComponent.clearSelection(true);
          this.getInactiveStock();
        }
        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(updateQuiltStatusSub);
  }

  assignQuilt() {
    if (!this.tabIndex) {
      this.individualInStockComponent.assignQuiltsToCustomer();
    }
    else {
      this.palletInStockComponent.assignPalletsToCustomer();
    }
  }

  callAssignQuiltsApi({ orderNumber, palletIds = [], quiltIds = [] }: any) {
    const assignQuiltsSub = this.inventoryService.assignQuiltsToCustomer({ orderNumber, palletIds, quiltIds }).subscribe((res: any) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        this.individualInStockComponent.clearSelection(true);
        this.fetchTableData();
        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(assignQuiltsSub);
  }

  assignPallet() {
    if (!this.tabIndex) {
      this.palletInStockComponent.assignPalletsToCustomer();
    }
  }

  callAssignPalletsApi({ orderNumber, palletIds = [], quiltIds = [] }: any) {
    const assignPalletsSub = this.inventoryService.assignQuiltsToCustomer({ orderNumber, palletIds, quiltIds }).subscribe((res: any) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        this.fetchTableData();
        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(assignPalletsSub);
  }

  updatePalletStatusApi(event: any) {
    this.toastrService.error("Pallet status update is disabled.");
    return;
    const updatePalletStatusSub = this.inventoryService.updatePalletStatus(event).subscribe((res: any) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        this.getPalletStockData();

        if (res.message) {
          this.toastrService.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(updatePalletStatusSub);
  }

  selectedTabChanged(event: any): void {
    debugger
    this.tabIndex = event.index;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: "in-stock", stock: Tabs[+this.tabIndex] }
    });

    this.resetFilters();
  }

  paginator(event: any) {
    if (!this.searchFilter) {
      this.initForm();
    }

    this.stocksDataForm.controls['pageSize'].patchValue(event.pageSize);
    this.stocksDataForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.fetchTableData();
  }

  searchAppliedFlters() {
    if (!this.tabIndex && this.individualInStockComponent) {
      this.individualInStockComponent.clearSelection(true);
    }
    if (this.tabIndex === 2 && this.inactiveStockComponent) {
      this.inactiveStockComponent.clearSelection(true);
    }

    this.searchFilter = true;
    this.applyFilters(); 
  }

  applyFilters() {
    this.stocksDataForm.controls['pageNumber'].patchValue(1);
    this.fetchTableData();
  }

  resetFilters() {
    this.searchFilter = false;
    this.initForm();

    if (this.masterAdminRoles.includes(this.loggedInUserRole)) {
      this.individualInStockComponent.clearSelection(true);
    }
    this.applyFilters();
  }

  navToConsign(id: any, pNo: any) {
    this.router.navigate(["/inventory/quilts-inventory"], {
      queryParams: { tab: "consignment", locationId: id, partNumber: pNo }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
    this.tabChangeSub?.unsubscribe();
  }
}
