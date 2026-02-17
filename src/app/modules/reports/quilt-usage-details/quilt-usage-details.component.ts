import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService } from '../reports.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-quilt-usage-details',
  templateUrl: './quilt-usage-details.component.html',
  styleUrls: ['./quilt-usage-details.component.scss']
})
export class QuiltUsageDetailsComponent implements OnInit {
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  quiltId: any = this.activatedRoute?.snapshot?.queryParams?.quiltId;
  serialNumber: any = this.activatedRoute?.snapshot?.queryParams?.serialNumber;
  customerName: any = this.activatedRoute?.snapshot?.queryParams?.customerName;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  allCustomersOrders: any[] = [];
  allStatus: any[] = [];
  searchFilter: boolean = false;
  quiltUsageDetailForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  pageEvent: PageEvent;
  cusDetail: any = {};

  get items$() {
    return this._items$.asObservable();
  }

  constructor(private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportsService,
    private toastr: ToastrService,
    public datePipe: DatePipe,) { }

  ngOnInit(): void {
    this.initForm();
    this.quiltReport();
  }

  initForm() {
    this.quiltUsageDetailForm = this.fb.group({
      sortByColumn: '',
      sortDescendingOrder: true,
      searchBy: '',
      pageNumber: 1,
      pageSize: 10,
      quiltId: 0,
      companyId: 0,
      orderNumber: '',
      shipmentNumber: ''
    })
  }

  quiltReport() {
    this.spinner.show();
    const body = {
      ...this.quiltUsageDetailForm.getRawValue(),
      companyId: this.customerId,
      quiltId: this.quiltId
    }
    const listSub = this.reportService.getOrderReport(body).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.orders);
        this.cusDetail = res?.data?.results
        console.log(res?.data.orders);

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
    this.searchFilter = true;
    this.applyFilters();
  }

  applyFilters() {
    this.quiltUsageDetailForm.controls['pageNumber'].patchValue(1);
    this.quiltReport();
  }

  resetFilters() {
    this.searchFilter = false;
    this.initForm();
    this.applyFilters();
  }

  paginator(event: any) {
    this.quiltUsageDetailForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltUsageDetailForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.quiltReport();
  }
}
