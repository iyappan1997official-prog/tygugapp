import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { CustomersService } from '../../customers/customers.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

@Component({
  selector: 'location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LocationComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  @Input() customerName: string;
  @Input() customerNumber: string;
  private unsubscribe: Subscription[] = [];
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  customerId: number | string = this.activatedRoute?.snapshot?.params?.id;

  get items$() {
    return this._items$.asObservable();
  }

  locationListForm: FormGroup;
  totalLocations: number;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  public roleEnum = Roles;
  loggedInUserRole: Roles;

  constructor(
    private customersService: CustomersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    private ngbModal: NgbModal,
    private activatedRoute: ActivatedRoute,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.initform();
    this.customerName = this.dataSharingService.data['customerName'];
    this.customerNumber = this.dataSharingService.data['customerNumber'];

    if (this.tab === "locations") {
      this.getAllLocations();
    }

    this.onSearchByValueChange();
  }

  getSearchByControl() {
    return this.locationListForm.controls.searchBy as FormControl;
  }

  initform() {
    this.locationListForm = this.fb.group({
      // customerId: this.customerId ,
      locationTypeId: 0,
      searchBy: "",
      sortByColumn: 'name',
      sortAscendingOrder: "asc",
      pageNumber: 1,
      pageSize: 10
    })
  }

  getAllLocations() {
    this.spinner.show();
    this.isLoading = true;

    const customerListSub = this.customersService.getAllLocations(this.locationListForm.getRawValue(), this.customerId).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.locations);
        this.totalLocations = res?.data?.totalCount;
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(customerListSub);
  }

  openConfirmDeleteModal(id: number) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removeUser(id);
    }).catch((res) => { })
  }

  removeUser(id: number) {
    this.spinner.show();
    const deleteUser = this.customersService.removeLocation(id)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.getAllLocations();
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
    this.unsubscribe.push(deleteUser);
  }

  onSearchByValueChange() {
    const { pageNumber, searchBy } = this.locationListForm.controls;
    const searchByValueSub = searchBy.valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      pageNumber.patchValue(1);
      this.getAllLocations();
    })
    this.unsubscribe.push(searchByValueSub);
  }

  searchReset() {
    this.locationListForm.controls.searchBy.patchValue("");
  }

  paginator(event: any) {
    const { pageSize, pageNumber } = this.locationListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllLocations();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}