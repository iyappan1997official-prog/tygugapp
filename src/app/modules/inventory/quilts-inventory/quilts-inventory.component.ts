import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { FetchQuiltStatusesService } from 'src/app/shared/services/fetch-quilt-statuses.service';
import { AuthService } from '../../auth/auth.service';
import { InStockComponent } from '../in-stock/in-stock.component';
import { InventoryService } from '../inventory.service';
import { LeasedComponent } from '../leased/leased.component';
import { QuiltDefinitionComponent } from '../quilt-definition/quilt-definition.component';
import { AutomatePalletComponent } from '../automate-pallet/automate-pallet.component';
import * as moment from 'moment';
import { FullTableViewComponent } from '../leased/full-table-view/full-table-view.component';
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { ShipmentsService } from '../../shipments/shipments.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { EpicorComponent } from '../epicor/epicor.component';
import { PalletTableViewComponent } from '../in-stock/child-components/pallet-table-view/pallet-table-view.component';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';
import { CustomerInventoryComponent } from '../customer-inventory/customer-inventory.component';
import { OrderTypes } from 'src/app/shared/enum/OrderTypes';

enum Tabs {
  'leased' = 0,
  'purchased' = 1,
  'in-stock' = 2,
  'automate-pallet' = 3,
  'quilt-definition' = 4,
  'epicor' = 5,
}
enum Tabs1 {
  'consignment' = 0,
  'purchased' = 1,
  'in-stock' = 2,
  'pallet' = 3,
}

enum Tabs2 {
  'leased' = 0,
  'purchased' = 1,
  'in-stock' = 2,
  'consignment' = 3,
}

@Component({
  selector: 'app-quilts-inventory',
  templateUrl: './quilts-inventory.component.html',
  styleUrls: ['./quilts-inventory.component.scss'],
})
export class QuiltsInventoryComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  private subscriptions: Subscription[] = [];
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  @ViewChild(LeasedComponent) leasedComponent: LeasedComponent;
  @ViewChild(InStockComponent) inStockComponent: InStockComponent;
  @ViewChild(QuiltDefinitionComponent)
  quiltDefinitionComponent: QuiltDefinitionComponent;
  @ViewChild(AutomatePalletComponent)
  automatePalletComponent: AutomatePalletComponent;
  @ViewChild(PalletTableViewComponent)
  palletTableViewComponent: PalletTableViewComponent;
  @ViewChild(FullTableViewComponent)
  fullTableViewComponent: FullTableViewComponent;
  @ViewChild(EpicorComponent) epicorComponent: EpicorComponent;
  @ViewChild(CustomerInventoryComponent) customerInventory: CustomerInventoryComponent;
  public roleEnum = Roles;
  searchFilter: boolean = false;
  customerTypeId: number;
  // orderTypeId: any;
  allStatus: any[] = [];
  allLocations: any[] = [];
  totalCount: number;
  inventoryForm: FormGroup;
  inventories: any[] = [];
  tabChangeSub: Subscription;
  showLoader: boolean = true;
  tabIndex: any = 0;
  tabs:string[]=[];
  loggedInUserRole: Roles;
  loggedInUserDetails: any;
  loggedInCustomerId: any;
  masterAdminRoles: string[] = [
    this.roleEnum.masterAdmin,
    this.roleEnum.warehouseUser,
  ];
  companyAdminRoles: string[] = [
    this.roleEnum.customerAdmin,
    this.roleEnum.customerManager,
  ];
  onlyCustomer: boolean = false;
  onlyConsign: boolean = false;
  get formValues(): any {
    Object.assign(this.dataSharingService.data, {
      inventoryForm: this.inventoryForm.getRawValue(),
    });

    if (this.isFullyEmpty(this.inventoryForm.getRawValue())) {
      this.searchFilter = false;
    } else {
      this.searchFilter = true;
    }
    return this.inventoryForm.getRawValue();
  }

  isFullyEmpty(obj: any) {
    return Object.keys(obj).every((key) =>
      key === 'quiltStatusId' || key === 'locationId'
        ? obj[key] === 0
        : key === 'pageNumber'
          ? obj[key] === 1
          : key === 'pageSize'
            ? obj[key] === 10
            : obj[key] === ''
    );
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private quiltStatusesService: FetchQuiltStatusesService,
    private getAllLocations: FetchAllLocationsService,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private authService: AuthService,
    private shipmentsService: ShipmentsService,
    private cd: ChangeDetectorRef,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    debugger
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || '';
    this.loggedInUserDetails = userData;
    this.customerTypeId = userData?.customerTypeId || 0;
    this.loggedInCustomerId = userData?.companyId || '';
    if(this.loggedInUserRole==this.roleEnum.masterAdmin || this.loggedInUserRole==this.roleEnum.serviceManager){
      this.tabs=['leased','purchased','in-stock','automate-pallet','quilt-definition','epicor'];
    }else if(this.loggedInUserRole==this.roleEnum.globalAdmin || this.loggedInUserRole==this.roleEnum.customerAdmin || this.loggedInUserRole==this.roleEnum.customerManager){
      if(this.customerTypeId==1){
        this.tabs=['leased','pallet'];
      }else if(this.customerTypeId==0 || this.customerTypeId==2){
        this.tabs=['purchased','pallet'];
      }else if(this.customerTypeId==3){
        this.tabs=['leased','purchased','pallet'];
      }
      if(this.loggedInUserRole!=this.roleEnum.customerManager){
        this.tabs.push('consignment');
      }
    }else if(this.loggedInUserRole==this.roleEnum.consignAdmin || this.loggedInUserRole==this.roleEnum.consignManager){
      this.tabs=['consignment','purchased','in-stock','pallet']
    }
    debugger;
    if(!this.tab || this.tab==''){
      this.tab=this.tabs[0];
    }
    this.initForm();
    this.handleTabChangeSub();
    if (this.tab === 'quilt-definition' && this.loggedInUserRole !== this.roleEnum.masterAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if ((!this.tab || ['leased', 'purchased'].includes(this.tab)) &&[...this.masterAdminRoles, this.roleEnum.serviceManager].includes(this.loggedInUserRole)
    ) {
      //this.fetchQuiltStatuses();
      this.fetchData();
    }
    if (
      [
        this.roleEnum.consignAdmin,
        this.roleEnum.consignManager,
        // this.roleEnum.customerAdmin,
      ].includes(this.loggedInUserRole) &&
      (!!this.tab || ['consignment', 'purchased'].includes(this.tab))
    ) {
      // this.leasedComponent.getAllConsignOrders();
      this.fetchData();
    }
  }
  fetchData() {
    let fetchData = [
      this.inventoryService
        .getQuiltStatuses()
        .pipe(catchError((error) => of(error))),
    ];

    if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      // fetchData.push(this.shipmentsService.getLocationsByCustomerId(this.loggedInCustomerId).pipe(catchError(error => of(error))));
      fetchData.push(
        this.inventoryService
          .getCustomerLocations(true, false)
          .pipe(catchError((error) => of(error)))
      );
    } else if (
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      ) &&
      ['consignment', 'purchased'].includes(this.tab)
    ) {
      fetchData.push(
        this.inventoryService
          .getLocationForConsign()
          .pipe(catchError((error) => of(error)))
      );
    } else if (
      [this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(
        this.loggedInUserRole
      ) &&
      ['leased', 'purchased'].includes(this.tab)
    ) {
      fetchData.push(
        this.inventoryService
          .getCustomerLocations(this.onlyConsign, this.onlyCustomer)
          .pipe(catchError((error) => of(error)))
      );
    } else if (
      ![
        this.roleEnum.consignAdmin,
        this.roleEnum.consignManager,
        this.roleEnum.customerAdmin,
        this.roleEnum.customerManager,
      ].includes(this.loggedInUserRole) &&
      ['leased', 'purchased'].includes(this.tab)
    ) {
      fetchData.push(
        this.inventoryService
          .getAllLocation()
          .pipe(catchError((error) => of(error)))
      );
    }

    if (
      this.tab === 'purchased' ||
      [
        ...this.masterAdminRoles,
        this.roleEnum.serviceManager,
        this.roleEnum.consignAdmin,
        this.roleEnum.consignManager,
      ].includes(this.loggedInUserRole)
    ) {
      const body = {
        ...this.formValues,
        shipDate: this.formValues.shipDate
          ? moment(this.formValues.shipDate).format('MM/DD/YYYY')
          : '',
        receiveDate: this.formValues.receiveDate
          ? moment(this.formValues.receiveDate).format('MM/DD/YYYY')
          : '',
      };
      if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
        body['companyId'] = this.loggedInUserDetails?.companyId;
      }
      // if ([...this.masterAdminRoles, this.roleEnum.consignAdmin].includes(this.loggedInUserRole)) {
      this.inventories = [];
      // }
      fetchData.push(
        this.inventoryService
          .getAllInventories(+this.tabIndex + 1, body)
          .pipe(catchError((error) => of(error)))
      );
    }
    // else if ((this.companyAdminRoles.includes(this.loggedInUserRole) && this.tab === "leased")) {
    //   this.fullTableViewComponent.getCustomerDetails();
    // }
    //  else if ([this.roleEnum.consignAdmin].includes(this.loggedInUserRole) && (!this.tab || (this.tab === "consignment"))) {
    //   this.leasedComponent.getAllConsignOrders();
    // }
    this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: (results) => {
        console.log(fetchData);
        if (results[0]) {
          if (results[0].statusCode === 200) {
            this.allStatus = results[0]?.data;
          } else if (results[0].message) {
            this.toastrService.error(results[0].message);
          }
        }
        if (results[1]) {
          if (results[1].statusCode === 200) {
            this.allLocations = results[1]?.data;
          } else if (results[1].message) {
            this.toastrService.error(results[1].message);
          }
        }
        if (results[2]) {
          if (results[2].statusCode === 200) {
            this.inventories = results[2]?.data?.inventories;
            this.totalCount = results[2]?.data?.totalCount;
          } else {
            this.inventories = [];
            this.leasedComponent.totalCount = 0;
            if (results[2] && results[2].message) {
              this.toastrService.error(results[2].message);
            }
          }
        }
        if (
          ![this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
            this.loggedInUserRole
          )
        ) {
          this.spinner.hide();
        }

        // if (this.inventories.length > 0) {
        //   setTimeout(() => {
        //     this.spinner.hide();
        //   }, 1300)
        // }
      },
      error: (e) => this.toastrService.error(e.message),
      // complete: () => {if(this.masterAdminRoles.includes(this.loggedInUserRole)){this.spinner.hide()}else{this.showLoader=false}}
    });
  }
  initForm() {
    if (
      'inventoryForm' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryForm'] != null &&
      this.dataSharingService.data['inventoryForm'] != undefined
    ) {
      console.log(
        'inventoryForm',
        this.dataSharingService.data['inventoryForm']
      );
      this.inventoryForm = this.fb.group(
        this.dataSharingService.data['inventoryForm']
      );
      this.searchFilter = true;
    } else {
      this.inventoryForm = this.fb.group({
        customerNumber: '',
        customerName: '',
        orderNumber: '',
        quiltSerialNumber: '',
        palletSerialNumber: '',
        quiltStatusId: 0,
        locationId: 0,
        shipDate: '',
        receiveDate: '',
        pageNumber: 1,
        pageSize: 10,
      });
      this.searchFilter = false;
    }
  }

  resetAllFilters(): void {
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
    this.applyFilters();
  }

  handleTabChangeSub(): void {
    debugger
    if(this.tab && this.tab!=''){
      if(this.tabs.indexOf(this.tab)>-1)
        this.tabIndex=this.tabs.indexOf(this.tab);
      else
        this.tabIndex=0;
    }else{
      this.tabIndex=0;
    }
    // this.selectedTabChanged(this.tabIndex);
    // if (
    //   'consignListForm' in this.dataSharingService.data &&
    //   this.dataSharingService.data['consignListForm'] != null &&
    //   this.dataSharingService.data['consignListForm'] != undefined
    // ) {
    //   this.dataSharingService.data['consignListForm'] = null;
    // }

    // if (
    //   'inventoryFormUserRole' in this.dataSharingService.data &&
    //   this.dataSharingService.data['inventoryFormUserRole'] != null &&
    //   this.dataSharingService.data['inventoryFormUserRole'] != undefined
    // ) {
    //   this.dataSharingService.data['inventoryFormUserRole'] == null;
    // }

    // if (
    //   'inventoryForm' in this.dataSharingService.data &&
    //   this.dataSharingService.data['inventoryForm'] != null &&
    //   this.dataSharingService.data['inventoryForm'] != undefined
    // ) {
    //   this.dataSharingService.data['inventoryForm'] == null;
    // }
    // this.inventoryForm = this.fb.group({
    //   customerNumber: '',
    //   customerName: '',
    //   orderNumber: '',
    //   quiltSerialNumber: '',
    //   palletSerialNumber: '',
    //   quiltStatusId: 0,
    //   locationId: 0,
    //   shipDate: '',
    //   receiveDate: '',
    //   pageNumber: 1,
    //   pageSize: 10,
    // });

    // this.tabChangeSub = this.activatedRoute?.queryParams?.subscribe(
    //   (queryParams) => {
    //     const tab: any = queryParams as { tab: string };
    //     if (
    //       !!tab.tab &&
    //       [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
    //         this.loggedInUserRole
    //       )
    //     ) {
    //       this.tabIndex = Tabs1[tab.tab];
    //     } else if (
    //       !!tab.tab &&
    //       [this.roleEnum.customerAdmin].includes(this.loggedInUserRole)
    //     ) {
    //       // console.log(Tabs2);

    //       this.tabIndex = Tabs2[tab.tab];
    //       // if ([1, 3].includes(this.customerTypeId)) {
    //       //   this.tab = "leased";
    //       // } else {
    //       //   this.tab = "purchased";
    //       // }
    //     } else if (!!tab.tab) {
    //       this.tabIndex = Tabs[tab.tab];
    //     }
    //   }
    // );
  }

  fetchQuiltStatuses(callFetchTableData: boolean = true) {
    this.spinner.show();

    let apiCalled = false;
    const quiltStatusSub = this.quiltStatusesService.allQuiltStatuses.subscribe(
      (allstatus) => {
        if (allstatus.length || apiCalled) {
          this.allStatus = allstatus;
          // this.fetchAllLocation(callFetchTableData);
          // }
          if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
            this.getLocationByCustomerId(this.loggedInCustomerId);
            console.log('abc');
          } else {
            this.fetchAllLocation(callFetchTableData);
          }
        } else if (!apiCalled) {
          apiCalled = true;
          this.quiltStatusesService.getQuiltStatuses();
        }
      }
    );
    this.unsubscribe.push(quiltStatusSub);
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

  fetchAllLocation(callFetchTableData: boolean = true) {
    this.spinner.show();

    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allLocations.subscribe(
      (allLocations) => {
        if (allLocations.length || apiCalled) {
          this.allLocations = allLocations;

          if (!!callFetchTableData) {
            this.fetchTableData();
          }
          this.spinner.hide();
        } else if (!apiCalled) {
          apiCalled = true;
          this.getAllLocations.getAllLocationTypes();
        }
      }
    );
    this.unsubscribe.push(getAllLoc);
  }

  fetchTableData() {
    debugger
    if (
      this.tab === 'purchased' ||
      [...this.masterAdminRoles, this.roleEnum.serviceManager].includes(
        this.loggedInUserRole
      )
    ) {
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

      // this.fetchQuiltStatuses(false);

      if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
        body['companyId'] = this.loggedInUserDetails?.companyId;
      }
      if (
        [
          ...this.masterAdminRoles,
          this.roleEnum.consignAdmin,
          this.roleEnum.consignManager,
          this.roleEnum.serviceManager,
        ].includes(this.loggedInUserRole)
      ) {
        // this.inventories = [];
        this.spinner.show();
        const palletInStockSub = this.inventoryService
          .getAllInventories(+this.tabIndex + 1, body)
          .subscribe((res) => {
            if (res.statusCode === 200) {
              this.inventories = res?.data?.inventories;
              this.totalCount = res?.data?.totalCount;
              setTimeout(() => {
                this.spinner.hide();
              }, 1500);
            } else {
              this.inventories = [];
              this.leasedComponent.totalCount = 0;
              if (res.message) {
                this.toastrService.error(res.message);
                this.spinner.hide();
              }
            }
          });
        this.unsubscribe.push(palletInStockSub);
      }
    } else if (
      this.companyAdminRoles.includes(this.loggedInUserRole) &&
      this.tab === 'leased'
    ) {
      this.fullTableViewComponent.getCustomerDetails();
    } else if (
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      ) &&
      this.tab === 'consignment'
    ) {
      this.leasedComponent.getAllConsignOrders();
    }
    // this.spinner.hide();
  }

  selectedTabChanged(index: number): void {
    debugger
    if (
      'consignListForm' in this.dataSharingService.data &&
      this.dataSharingService.data['consignListForm'] != null &&
      this.dataSharingService.data['consignListForm'] != undefined
    ) {
      this.dataSharingService.data['consignListForm'] = null;
      this.searchFilter = false;
    }

    if (
      'inventoryFormUserRole' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryFormUserRole'] != null &&
      this.dataSharingService.data['inventoryFormUserRole'] != undefined
    ) {
      this.dataSharingService.data['inventoryFormUserRole'] = null;
      this.searchFilter = false;
    }

    if (
      'inventoryForm' in this.dataSharingService.data &&
      this.dataSharingService.data['inventoryForm'] != null &&
      this.dataSharingService.data['inventoryForm'] != undefined
    ) {
      this.dataSharingService.data['inventoryForm'] = null;
      this.searchFilter = false;
    }

    this.inventoryForm = this.fb.group({
      customerNumber: '',
      customerName: '',
      orderNumber: '',
      quiltSerialNumber: '',
      palletSerialNumber: '',
      quiltStatusId: 0,
      locationId: 0,
      shipDate: '',
      receiveDate: '',
      pageNumber: 1,
      pageSize: 10,
    });

    // const index: number = event.index;
    this.tabIndex = index;
    this.tab=this.tabs[index];
    // this.tab = [
    //   this.roleEnum.consignAdmin,
    //   this.roleEnum.consignManager,
    //   this.roleEnum.customerAdmin,
    // ].includes(this.loggedInUserRole)
    //   ? [this.roleEnum.customerAdmin].includes(this.loggedInUserRole)
    //     ? Tabs2[index]
    //     : Tabs1[index]
    //   : Tabs[index];
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        // tab: [
        //   this.roleEnum.consignAdmin,
        //   this.roleEnum.consignManager,
        //   this.roleEnum.customerAdmin,
        // ].includes(this.loggedInUserRole)
        //   ? [this.roleEnum.customerAdmin].includes(this.loggedInUserRole)
        //     ? Tabs2[index]
        //     : Tabs1[index]
        //   : Tabs[index],
        tab:this.tabs[index]
      },
    });
    this.cd.detectChanges();
    // if (
    //   [0,1].includes(index) &&
    //   [this.roleEnum.customerAdmin, this.roleEnum.customerManager,this.roleEnum.globalAdmin].includes(
    //     this.loggedInUserRole
    //   )
    // ) {
    //   this.customerInventory.ngOnInit();
    // }
    if (
      [0].includes(index) &&
      [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
        this.loggedInUserRole
      )
    ) {
      this.fetchData();
    }
    else if([this.roleEnum.masterAdmin, this.roleEnum.serviceManager].includes(
      this.loggedInUserRole
    )){
      this.fetchData();
    }
     else if (index === 2) {
      if (
        [
          ...this.masterAdminRoles,
          this.roleEnum.serviceManager,
          this.roleEnum.consignAdmin,
          this.roleEnum.consignManager,
        ].includes(this.loggedInUserRole)
      ) {
        this.inStockComponent.initForm();
        this.inStockComponent.fetchData();
      } else {
        this.inStockComponent.getPalletStockData();
      }
    } 
    // else if (index === 3) {
    //   if (
    //     [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(
    //       this.loggedInUserRole
    //     )
    //   ) {
    //     this.palletTableViewComponent.getAllPalletDetails();
    //   } else {
    //     this.automatePalletComponent.getPartNumber();
    //   }
    // }
    else if (this.tab === 'pallet') {
      this.palletTableViewComponent.getAllPalletDetails();
    } else if (this.tab === 'automate-pallet') {
      this.automatePalletComponent.getPartNumber();
    }
    else if (this.tab === 'quilt-definition') {
      this.quiltDefinitionComponent.getQuiltDefinition();
    } else if (this.tab === 'epicor') {
      this.epicorComponent.ngOnInit();
    }
  }

  applyFilters() {
    this.inventoryForm.controls['pageNumber'].patchValue(1);
    this.fetchTableData();
  }

  ngOnDestroy() {
    this.tabChangeSub?.unsubscribe();
  }
}
