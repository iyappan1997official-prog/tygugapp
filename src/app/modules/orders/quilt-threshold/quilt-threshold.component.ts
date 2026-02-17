import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { CustomersService } from '../../customers/customers.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quilt-threshold',
  templateUrl: './quilt-threshold.component.html',
  styleUrls: ['./quilt-threshold.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class QuiltThresholdComponent implements OnInit {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  customerId: number | string = this.activatedRoute?.snapshot?.params?.id;

  thresholdListForm: FormGroup;
  totalCount: number;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  locationId: number;
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
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.locationId = this.authService?.getUserFromLocalStorage()?.data?.locationId || "";
    this.initform();

    if (this.tab === "threshold-limit") {
      this.getAllThreshold();
    }

    this.onSearchByValueChange();
  }
  getSearchByControl() {
    return this.thresholdListForm.controls.searchBy as FormControl;
  }
  initform() {
    this.thresholdListForm = this.fb.group({
      searchBy: "",
      sortByColumn: '',
      sortDescendingOrder: false,
      pageNumber: 1,
      pageSize: 10
    })
  }
  getAllThreshold() {
    this.spinner.show();
    this.isLoading = true;
    const thresholdListSub = this.customersService.getLocationThreshold(this.thresholdListForm.getRawValue()).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.thresholds);
        this.totalCount = res?.data?.totalCount;
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(thresholdListSub);
  }
  onSearchByValueChange() {
    const { pageNumber, searchBy } = this.thresholdListForm.controls;
    const searchByValueSub = searchBy.valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      pageNumber.patchValue(1);
      this.getAllThreshold();
    })
    this.unsubscribe.push(searchByValueSub);
  }

  searchReset() {
    this.thresholdListForm.controls.searchBy.patchValue("");
  }
  paginator(event: any) {
    const { pageSize, pageNumber } = this.thresholdListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllThreshold();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
