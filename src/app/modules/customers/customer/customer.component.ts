import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { CustomersService } from '../customers.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

@Component({
  selector: 'customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  // customers: any[] = [{
  //   id: 1,
  //   customerNumber: 43,
  //   name: "test food corp.",
  //   phoneNumber: "987655456",
  //   address: "Alaxender City, Albama, US"
  // }]

  get items$() {
    return this._items$.asObservable();
  }
  public roleEnum = Roles;
  loggedInUserRole: Roles;
  customerListForm: FormGroup;
  totalCustomers: number;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10];
  isLoading: boolean = false;
  pageEvent: PageEvent;
  SortDescendingOrder: boolean = false;
  sortByColumn: string;
  constructor(
    private customersService: CustomersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.initform();
    this.getAllCustomers();
    this.onSearchByValueChange();
    if (this.dataSharingService.data) {
      this.dataSharingService.data['customerName'] = null;
      this.dataSharingService.data['customerNumber'] = null;

    }
  }

  getSearchByControl() {
    return this.customerListForm.controls.searchBy as FormControl;
    console.log('GetsearchByControl');
  }

  initform() {
    this.customerListForm = this.fb.group({
      searchBy: "",
      sortByColumn: "",
      SortDescendingOrder: false,
      pageNumber: 1,
      pageSize: 10
    })
  }

  storeData(cusName: any, cusNum: any) {
    Object.assign(this.dataSharingService.data, {
      customerName: cusName,
      customerNumber: cusNum
    });
  }
  getAllCustomers() {
    this.spinner.show();
    this.isLoading = true;

    const customerListSub = this.customersService.getAllCustomers(this.customerListForm.getRawValue()).subscribe((res) => {
      console.log(res);
      this.spinner.hide();
      this.isLoading = false;

      if (res.statusCode === 200) {
        this._items$.next(res?.data);
        this.totalCustomers = res?.totalCount;
        // console.log( this.totalCustomers)
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

    this.customerListForm.patchValue({
      sortByColumn: this.sortByColumn,
      SortDescendingOrder: this.SortDescendingOrder
    });

    this.getAllCustomers();
  }
  onSearchByValueChange() {
    const { pageNumber, searchBy } = this.customerListForm.controls;
    const searchByValueSub = searchBy.valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      pageNumber.patchValue(1);
      this.getAllCustomers();
    })
    this.unsubscribe.push(searchByValueSub);
  }

  searchReset() {
    this.customerListForm.controls.searchBy.patchValue("");
    this.customerListForm.controls['pageNumber'].patchValue(1);
    this.getAllCustomers();
  }

  paginator(event: any) {
    const { pageSize, pageNumber } = this.customerListForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.getAllCustomers();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
