import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ReportsService } from '../reports.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-customer-history',
  templateUrl: './customer-history.component.html',
  styleUrls: ['./customer-history.component.scss']
})
export class CustomerHistoryComponent implements OnInit {
  public roleEnum = Roles;
  // customerId: any;
  collapsed: any = false;
  collapsedNot: number;
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: number | string = this.activatedRoute?.snapshot?.queryParams?.endDate;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  customerHistoryForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  pageEvent: PageEvent;
  userDetails: any;
  loggedInUserRole: Roles;
  loggedInCustomerId: any[] = [];

  get items$() {
    return this._items$.asObservable();
  }
  companyTableData: any = [

    {
      "customerName": "Test Food Coorporation",
      "orderNumber": "624273",
      "quiltsOrdered": "2000",
      "orderStartDate": "12/09/2021",
      "orderEndDate": "12/27/21",
    },
    {
      "customerName": "Test Food Coorporation",
      "orderNumber": "624273",
      "quiltsOrdered": "2000",
      "orderStartDate": "12/09/2021",
      "orderEndDate": "12/27/21",
    },
    {
      "customerName": "Test Food Coorporation",
      "orderNumber": "624273",
      "quiltsOrdered": "2000",
      "orderStartDate": "12/09/2021",
      "orderEndDate": "12/27/21",
    },
    {
      "customerName": "Test Food Coorporation",
      "orderNumber": "624273",
      "quiltsOrdered": "2000",
      "orderStartDate": "12/09/2021",
      "orderEndDate": "12/27/21",
    },
    {
      "customerName": "Test Food Coorporation",
      "orderNumber": "624273",
      "quiltsOrdered": "2000",
      "orderStartDate": "12/09/2021",
      "orderEndDate": "12/27/21",
    }
  ]
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    public datePipe: DatePipe,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.loggedInCustomerId = this.userDetails?.custGroupId || "";
    this.initForm();
    //     const str: string = this.customerId;

    // const arr: Array<string> = str.toString().split(",");
    // this.customerId = arr;
    // console.log(this.customerId);
    if (this.loggedInUserRole.includes(this.roleEnum.customerAdmin)) {
      this.customerId = [this.loggedInCustomerId]
    }

    else {
      const str: string = this.customerId;

      const arr: Array<string> = str.toString().split(",");
      this.customerId = arr;
    }
    this.getCustomerHistoryList();
  }

  initForm() {
    this.customerHistoryForm = this.fb.group({
      // customerId: this.customerId,
      // startDate: this.startDate,
      // endDate: this.endDate,
      pageNumber: 1,
      pageSize: 10
    })
  }

  getCustomerHistoryList() {
    this.spinner.show();

    const listSub = this.reportService.customerHistoryReport(this.customerHistoryForm.getRawValue(), this.customerId, this.datePipe.transform(this.startDate, 'yyyy-MM-dd'), this.datePipe.transform(this.endDate, 'yyyy-MM-dd')).subscribe((res) => {
      this.spinner.hide();
      console.log(res)
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.customerDetails);
        this.length = res.data.totalCount;
        // this.pageSizeOptions = [5, 10, 50, 100, this.length];
        this.pageSizeOptions = [5, 10, 50, 100];
        if (!this.pageSizeOptions.includes(this.length)) {
          this.pageSizeOptions.push(this.length)
        }
        if (this.length < 5) {
          this.pageSizeOptions = [5, 10];
        }
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(listSub);
  }

  paginator(event: any) {
    this.customerHistoryForm.controls['pageSize'].patchValue(event.pageSize);
    this.customerHistoryForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getCustomerHistoryList();
  }

  openData(toggleTo: boolean, index: number) {
    this.collapsed = toggleTo;
    if (toggleTo === true) {
      this.collapsedNot = index;
    } else {
      this.collapsedNot = undefined;
    }
  }

  getQuiltDetails(cId: any, orderNo: any) {
    this.router.navigate(['/reports/quilt-details'], { queryParams: { customerGroupId: cId, orderNumber: orderNo, startDate: this.startDate, endDate: this.endDate, customerHistoryIds: this.customerId } });
  }

  printHtml() {
    let printContents = document.getElementById('comp').innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }

}
