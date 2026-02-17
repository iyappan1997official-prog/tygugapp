import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-quilt-details',
  templateUrl: './quilt-details.component.html',
  styleUrls: ['./quilt-details.component.scss']
})
export class QuiltDetailsComponent implements OnInit {
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  customerGroupId: any = this.activatedRoute?.snapshot?.queryParams?.customerGroupId;
  orderNumber: any = this.activatedRoute?.snapshot?.queryParams?.orderNumber;
  // customerName: number | string = this.activatedRoute?.snapshot?.queryParams?.customerName;
  // quiltsOrdered: number | string = this.activatedRoute?.snapshot?.queryParams?.quiltsOrdered;
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: number | string = this.activatedRoute?.snapshot?.queryParams?.endDate;
  customerHistoryIds: any = this.activatedRoute?.snapshot?.queryParams?.customerHistoryIds;
  quiltDetailsForm: FormGroup;
  customerName: any;
  orderNumbers: any;
  quiltsOrdered: any;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  pageEvent: PageEvent;
  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.customerGroupId)
    this.initForm();
    this.getQuiltDetails();
  }

  initForm() {
    this.quiltDetailsForm = this.fb.group({
      customerGroupId: this.customerGroupId,
      orderNumber: this.orderNumber,
      pageNumber: 1,
      pageSize: 10
    })
  }

  getQuiltDetails(){
    this.spinner.show();

    const listSub = this.reportService.getQuiltDetailsByCustomer(this.quiltDetailsForm.getRawValue()).subscribe((res) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.quilts);
        this.customerName = res.data.customerName;
        this.orderNumbers = res.data.orderNumber;
        this.quiltsOrdered = res.data.quiltOrdered;
        this.length = res.data.totalCount;
        // this.pageSizeOptions = [5, 10, 50, 100, this.length]
        this.pageSizeOptions = [5, 10, 50, 100];
        if(!this.pageSizeOptions.includes(this.length)){
          this.pageSizeOptions.push(this.length)
        }
        if(this.length < 5){
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
    this.quiltDetailsForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltDetailsForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltDetails();
  }

  backToCustomer(){
    this.router.navigate(['/reports/customer-history'], { queryParams: {customerId: this.customerHistoryIds, startDate:this.startDate, endDate: this.endDate } });
  }

}
