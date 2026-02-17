import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { AuthService } from '../../auth/auth.service';
import { CustomersService } from '../../customers/customers.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

@Component({
  selector: 'carrier',
  templateUrl: './carrier.component.html',
  styleUrls: ['./carrier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CarrierComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  @Input() customerName: string;
  @Input() customerNumber: string;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  customerId: number = this.activatedRoute?.snapshot?.params?.id;
  carrierListForm: FormGroup;
  totalCarriers: number;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  loggedInUserRole: Roles;

  get items$() {
    return this._items$.asObservable();
  }

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

    if (this.tab === "carrier") {
      this.getAllCarriers();
    }
    this.onSearchByValueChange();
  }

  getSearchByControl() {
    return this.carrierListForm.controls.searchBy as FormControl;
  }

  initform() {
    this.carrierListForm = this.fb.group({
      searchBy: "",
      sortByColumn: 'name',
      sortAscendingOrder: "asc",
      pageNumber: 1,
      pageSize: 10
    })
  }

  getAllCarriers() {
    this.spinner.show();
    this.isLoading = true;

    const customerListSub = this.customersService.getAllCarriers(this.carrierListForm.getRawValue(), this.customerId).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.carriers);
        this.totalCarriers = res?.data?.totalCount;
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
    const deleteUser = this.customersService.removeCarrier(id)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.getAllCarriers();
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
    const { pageNumber, searchBy } = this.carrierListForm.controls;
    const searchByValueSub = searchBy.valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      pageNumber.patchValue(1);
      this.getAllCarriers();
    })
    this.unsubscribe.push(searchByValueSub);
  }

  searchReset() {
    this.carrierListForm.controls.searchBy.patchValue("");
  }

  paginator(event: any) {
    const { pageSize, pageNumber } = this.carrierListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllCarriers();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
