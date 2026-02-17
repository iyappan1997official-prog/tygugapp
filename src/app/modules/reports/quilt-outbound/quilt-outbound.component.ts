import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ReportsService } from '../reports.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quilt-outbound',
  templateUrl: './quilt-outbound.component.html',
  styleUrls: ['./quilt-outbound.component.scss']
})
export class QuiltOutboundComponent implements OnInit {

  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  locationIds: any[] = this.activatedRoute?.snapshot?.queryParams?.locationIds;
  reportId: number | string = this.activatedRoute?.snapshot?.queryParams?.typeOfReport;
  subReportType: number | string = this.activatedRoute?.snapshot?.queryParams?.outputReportType;
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  orderTypeId: number | string = this.activatedRoute?.snapshot?.queryParams?.orderType;
  customerName: any = this.activatedRoute?.snapshot?.queryParams?.customerName;
  dashboardView: any = this.activatedRoute?.snapshot?.queryParams?.dashboardView
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  quiltOutboundForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  pageEvent: PageEvent;
  userDetails: any;
  loggedInUserRole: string;
  loggedInCustomerId: any[] = [];
  locIds: any[] = []

  allOrderType: any[] = [{ id: 1, name: 'Leased' }, { id: 2, name: 'Purchased' }];

  get items$() {
    return this._items$.asObservable();
  }


  constructor(private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    public datePipe: DatePipe,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    if (!this.customerName)
      this.customerName = this.userDetails?.companyName;
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.loggedInCustomerId = this.activatedRoute?.snapshot?.queryParams.customerId || this.userDetails?.companyId || "";
    this.customerId = this.loggedInCustomerId
    console.log(this.activatedRoute?.snapshot?.queryParams);
    if (!Array.isArray(this.locationIds)) {
      this.locIds.push(this.locationIds)
    }
    this.initForm();
    this.quiltOutboundList();
  }
  initForm() {
    this.quiltOutboundForm = this.fb.group({
      sortByColumn: "serialNumber",
      sortAscendingOrder: true,
      searchBy: "",
      pageNumber: 1,
      pageSize: 10,
      companyId: 0,
      locationIds: [],
      orderType: 0,
      reportType: 0,
      startDate: "",
      inputReportType: 0,
      outputReportType: 0,
    })
  }

  navigatePages() {
    if (this.dashboardView == 'true') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/reports']);
    }
  }

  quiltOutboundList() {
    this.spinner.show();
    const body = {
      ...this.quiltOutboundForm.getRawValue(),
      customerGroupId: +this.customerId,
      locationIds: (!this.locIds.length) ? this.locationIds.map((x: string | number) => { return +x }) : this.locIds.map((x: string | number) => { return +x }),
      reportType: +this.reportId,
      startDate: this.datePipe.transform(this.startDate, 'yyyy-MM-dd'),
      orderType: +this.orderTypeId,
      outputReportType: +this.subReportType || 0
    }
    const listSub = this.reportService.addReport(body).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.reports);
        this.length = res.data.totalCount;
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

  searchAppliedFlters() {
    this.quiltOutboundForm.controls['pageNumber'].patchValue(1);
    this.quiltOutboundList();
  }

  paginator(event: any) {
    this.quiltOutboundForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltOutboundForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.quiltOutboundList();
  }

  printHtml(comp: any) {
    let printContents = document.getElementById(comp).innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload();
  }

}
