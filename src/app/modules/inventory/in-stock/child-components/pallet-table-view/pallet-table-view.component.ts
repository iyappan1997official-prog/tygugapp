import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { ShipmentsService } from 'src/app/modules/shipments/shipments.service';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { InventoryService } from '../../../inventory.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { FetchAllLocationsService } from 'src/app/shared/services/fetch-all-locations.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pallet-table-view',
  templateUrl: './pallet-table-view.component.html',
  styleUrls: ['./pallet-table-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PalletTableViewComponent implements OnInit {
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  public roleEnum = Roles;
  // @Input() inventoryForm: FormGroup;
  allLocations: any[] = [];
  // @Input() tableData: any = {};
  // @Input() pallets: any[] = [];
  // @Input() palletLength: number;
  // @Input() pageNumber: number;
  // @Input() pageSize: number;
  searchFilter: boolean = false; //false
  // @Output() paginate: any = new EventEmitter();
  // @Output() deletePallet = new EventEmitter();
  // @Output() refreshData = new EventEmitter<any>();
  // @Output() applyFilters = new EventEmitter();
  // @Output() resetFilters = new EventEmitter()
  pageSizeOptions: number[];
  totalPallets: number;
  isLoading: boolean = false;
  palletTable: FormGroup;
  loggedInUserDetails: any;
  loggedInUserRole: Roles;
  inventory: number;
  onhand: number;
  loggedInCustomerGroupId: any;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  loggedInLocationId: any;

  get items$() {
    return this._items$.asObservable();
  }
  constructor(
    private spinner: NgxSpinnerService,
    private inventoryService: InventoryService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private getAllLocations: FetchAllLocationsService,
    private shipmentsService: ShipmentsService,
    private ngbModal: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loggedInUserDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.loggedInUserDetails?.roles[0];
    this.loggedInLocationId = this.loggedInUserDetails?.locationId || "";
    this.loggedInCustomerGroupId = this.loggedInUserDetails?.custGroupId || "";
    if (this.tab === "pallet" || ([this.roleEnum.customerAdmin, this.roleEnum.customerManager, this.roleEnum.globalAdmin].includes(this.loggedInUserRole))) {
      this.getAllPalletDetails();
    }
  }

  initForm() {
    this.palletTable = this.fb.group({
      palletNumber: '',
      description: '',
      locationId: 0,
      quiltSerialNumber: '',
      // searchBy: "",
      sortByColumn: '',
      // sortAscendingOrder: true,
      pageNumber: 1,
      pageSize: 10
    });
  }

  get formValues(): any {
    return this.palletTable.getRawValue();
  }
  searchAppliedFlters() {
    this.searchFilter = true;
    this.applyFilters();
  }

  applyFilters() {
    this.palletTable.controls['pageNumber'].patchValue(1);
    this.getAllPalletDetails();
  }
  resetFilters() {
    this.searchFilter = false;
    this.initForm();
    this.getAllPalletDetails();
  }

  openConfirmDeleteModal(id: number) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removePallet(id);
    }).catch((res) => { })
  }

  removePallet(id: number) {
    this.spinner.show();
    const deletePallet = this.inventoryService.removePallet(+id).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.getAllPalletDetails();
        this.spinner.hide();
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
    this.unsubscribe.push(deletePallet);
  }

  fetchConsignLocation() {
    this.spinner.show();
    let apiCalled = false;
    const getAllLoc = this.getAllLocations.allConsignLocations.subscribe((allConsignLocations) => {

      if (allConsignLocations.length || apiCalled) {
        this.allLocations = allConsignLocations;
      } else if (!apiCalled) {
        apiCalled = true;
        this.getAllLocations.getConsignLocation();
      }
    })
    this.spinner.hide();
    this.unsubscribe.push(getAllLoc);
  }

  getAllPalletDetails() {
    debugger
    this.spinner.show()
    // }
    const body: any = {
      ...this.formValues,
      // companyId: this.loggedInUserDetails.companyId,
      //locationId: this.loggedInUserDetails.locationId
    }
    if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      this.fetchConsignLocation()
    } else if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
      this.getLocationByCustomerGroupId(this.loggedInCustomerGroupId);
    }
    const palletList = this.inventoryService.getPalletsForCompany(body).subscribe((res) => {
      // this.spinner.show()
      if (res) {
        // this.spinner.show()

        if (res.statusCode === 200) {
          this._items$.next(res?.data?.palletList?.pallets);
          this.totalPallets = res?.data?.totalCount;
          this.inventory = res?.data?.palletList?.inventoryScanned;
          this.onhand = res?.data?.palletList?.onhand;
          this.pageSizeOptions = [5, 10, 50, 100];
          if (!this.pageSizeOptions.includes(this.totalPallets)) {
            this.pageSizeOptions.push(this.totalPallets)
          }
          if (this.totalPallets < 5) {
            this.pageSizeOptions = [5, 10];
          }
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this._items$.next([]);
          if (res.message) {
            this.toastr.error(res.message)
          }
        }
        this.spinner.hide()
      }
    })
    this.unsubscribe.push(palletList);
  }

  getLocationByCustomerGroupId(customerGroupId: any) {
    this.spinner.show()
    const locationDrop = this.shipmentsService.getLocationsByCustomerGroupId(customerGroupId).subscribe((res) => {
      if (res.statusCode === 200) {
        this.allLocations = res?.data;
        this.spinner.hide();
      } else if (res.message) {
        this.spinner.hide();
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }


  paginator(event: any) {
    if (!this.searchFilter) {
      this.initForm();
    }
    const { pageSize, pageNumber } = this.palletTable.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllPalletDetails();
  }
}
