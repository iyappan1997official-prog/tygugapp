import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { CustomersService } from '../../customers/customers.service';


@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LocationsComponent implements OnInit, OnDestroy {

  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];

  get items$() {
    return this._items$.asObservable();
  }

  locationListForm: FormGroup;
  totalLocations: number;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  locationId: number = 4;
  SortDescendingOrder: boolean = false;
  sortByColumn: string;
  constructor(
    private customersService: CustomersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngbModal: NgbModal,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initform();
    this.getAllLocationsForService();
    this.onSearchByValueChange()
  }

  getSearchByControl() {
    return this.locationListForm.controls.searchBy as FormControl;
  }

  initform() {
    this.locationListForm = this.fb.group({
      // locationId: this.locationId ,
      locationTypeId: this.locationId,
      searchBy: "",
      sortByColumn: "",
      SortDescendingOrder: false,
      pageNumber: 1,
      pageSize: 10
    })
  }

  getAllLocationsForService() {
    this.spinner.show();
    this.isLoading = true;

    const customerListSub = this.customersService.getAllLocations(this.locationListForm.getRawValue(), 0).subscribe((res) => {
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

  sort(column: string) {

    if (this.sortByColumn === column) {
      this.SortDescendingOrder = !this.SortDescendingOrder;
    }
    else {
      this.sortByColumn = column;
      this.SortDescendingOrder = false;
    }

    this.locationListForm.patchValue({
      sortByColumn: this.sortByColumn,
      SortDescendingOrder: this.SortDescendingOrder
    });

    this.getAllLocationsForService();
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
          this.getAllLocationsForService();
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
      this.getAllLocationsForService();
    })
    this.unsubscribe.push(searchByValueSub);
  }

  searchReset() {
    this.locationListForm.controls.searchBy.patchValue("");
    this.locationListForm.controls['pageNumber'].patchValue(1);
    this.getAllLocationsForService();
  }

  paginator(event: any) {
    const { pageSize, pageNumber } = this.locationListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllLocationsForService();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
