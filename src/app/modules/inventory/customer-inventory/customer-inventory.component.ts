import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InventoryService } from '../inventory.service';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, forkJoin, of } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../dashboard/dashboard/dashboard.service';
import { OrderTypes } from 'src/app/shared/enum/OrderTypes';

@Component({
  selector: 'app-customer-inventory',
  templateUrl: './customer-inventory.component.html',
  styleUrls: ['./customer-inventory.component.scss']
})
export class CustomerInventoryComponent implements OnInit {
  allLocations: any;
  filterForm: FormGroup;
  allPartNumbers: any;
  public roleEnum = Roles;
  loggedInUserRole: Roles;
  inventories: any;
  @Input() tab: string;
  isAllPartNumbers: boolean = false;
  orderTypeId: number;
  onlyCustomer: boolean = false;
  onlyConsign: boolean = false;
  searchFilter: boolean = false;
  allOrderNames: any[] = [];
  nickNameId: FormControl = new FormControl(0);

  private _items$ = new BehaviorSubject<any[]>([]);
  constructor(private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
  private cd:ChangeDetectorRef) { }
  get items$() {
    return this._items$.asObservable();
  }
  ngOnInit(): void {
    debugger
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || "";
    if (this.tab === "purchased") {
      this.orderTypeId = OrderTypes.purchased;
      this.onlyCustomer = true;
      this.onlyConsign = false;
    } else if (this.tab === "leased") {
      this.orderTypeId = OrderTypes.leased;
      this.onlyCustomer = true;
      this.onlyConsign = false;
    } else if (this.tab === "consignment") {
      this.orderTypeId = OrderTypes.consigned;
      this.onlyCustomer = false;
      this.onlyConsign = true;
    }
    this.initForm();
    this._items$.next([]);
    this.cd.detectChanges();
    this.fetchMasterData();
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.getAllOrderNames()
    }
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
  navigateToDetailView(locationId: any) {
    // this.router.navigate([`/inventory/quilts-inventory/${this.orderTypeId === 2 ? "purchased" : "leased"}`], {
    //   state: { locationId: +locationId,orderTypeId:this.orderTypeId}
    // })
    this.router.navigate([`/inventory/quilts-inventory/details`], {
      queryParams: { tab: this.tab, orderNameId: this.nickNameId.value },

      state: { locationId: +locationId }
    })
  }
  filterInventory() {
    this.searchFilter = true;
    this.getUserInventoryOverview();
  }
  resetFilters() {
    this.filterForm.controls.orderNickName.patchValue('')
    this.searchFilter = false;
    this.initForm();
    this.nickNameId.patchValue(0)
    this.getUserInventoryOverview();
  }
  fetchMasterData() {
    
    let fetchData = [this.inventoryService.getCustomerLocations(this.onlyConsign, this.onlyCustomer).pipe(catchError(error => of(error)))];
    this.spinner.show();
    forkJoin(fetchData).subscribe({
      next: ([res1]) => {
        if (res1.statusCode === 200) {
          this.allLocations = res1?.data;
        } else if (res1.message) {
          this.toastrService.error(res1.message)
        }
      },
      error: (e) => this.toastrService.error(e.message),
      complete: () => {  this.getUserInventoryOverview(); }
    });
  }
  initForm() {
    this.filterForm = this.fb.group({
      orderTypeId: this.orderTypeId,
      orderNumber: [''],
      partNumberId: [''],
      locationId: [0],
      orderNickName: ['']
    });
  }
  orderNameFilter(nameId: any) {
    const name = this.allOrderNames.find(x => x.id == nameId)?.name;
    if(name)
    this.filterForm.controls.orderNickName.patchValue(name);
    // this.getUserInventoryOverview();
  }
  getUserInventoryOverview() {
    let body = this.filterForm.value;
    this.spinner.show();
    this.inventoryService.getCustomerInventoryOverview(+body.orderTypeId, body.orderNumber, body.partNumberId, +body.locationId, body.orderNickName).subscribe(res => {
      if (res) {
        if (res.statusCode == 200) {
          this._items$.next(res.data);
          if (!this.isAllPartNumbers) {
            this.isAllPartNumbers = true;
            this.allPartNumbers = res.data;
          }
          this.cd.detectChanges();
        } else {
          this.toastrService.error(res.message);
        }
      }
      this.spinner.hide();
    });
  }
}
