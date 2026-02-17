import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GlobalCustomerService } from './global-customer.service';

@Component({
  selector: 'app-global-customer',
  templateUrl: './global-customer.component.html',
  styleUrls: ['./global-customer.component.scss']
})
export class GlobalCustomerComponent implements OnInit {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  get items$() {
    return this._items$.asObservable();
  }
  globalCustomerListForm: FormGroup;
  totalLists: number;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  SortDescendingOrder: boolean = false;
  sortByColumn: string;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private globalCustomerService: GlobalCustomerService,
    private ngbModal: NgbModal,
  ) { }

  ngOnInit(): void {
    this.initform();
    this.getCustGroupList();
    // this.onSearchByValueChange();
  }


  initform() {
    this.globalCustomerListForm = this.fb.group({
      searchBy: "",
      sortByColumn: "",
      SortDescendingOrder: false,
      pageNumber: 1,
      pageSize: 10
    })
  }
  getCustGroupList() {
    this.spinner.show();
    this.isLoading = true;

    const listSub = this.globalCustomerService.getGlobalCustGroup(this.globalCustomerListForm.getRawValue()).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.customerGroups);
        this.totalLists = res?.data?.totalCount;
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(listSub);
  }

  sort(column: string) {

    if (this.sortByColumn === column) {
      this.SortDescendingOrder = !this.SortDescendingOrder;
    }
    else {
      this.sortByColumn = column;
      this.SortDescendingOrder = false;
    }

    this.globalCustomerListForm.patchValue({
      sortByColumn: this.sortByColumn,
      SortDescendingOrder: this.SortDescendingOrder
    });

    this.getCustGroupList();
  }
    paginator(event: any) {
      const { pageSize, pageNumber } = this.globalCustomerListForm.controls;
      pageSize.patchValue(event.pageSize);
      pageNumber.patchValue(event.pageIndex + 1);

      this.getCustGroupList();
    }
}
