import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-quilt-history',
  templateUrl: './quilt-history.component.html',
  styleUrls: ['./quilt-history.component.scss']
})
export class QuiltHistoryComponent implements OnInit {
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  // customerId: any;
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: number | string = this.activatedRoute?.snapshot?.queryParams?.endDate;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  quiltHistoryForm: FormGroup;
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
    public datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    // console.log(this.customerId, this.startDate, this.endDate);
    // this.activatedRoute.queryParamMap.subscribe((params: any) => console.log(params)); 
    this.initForm();
    // this.reportService.customerId.subscribe(result => {
    //   console.log(result)
    //   this.customerId = result;
    // })
    //     let str1 = this.customerId;

    // const split_string = str1.split(" ");
    // console.log(split_string)
    // console.log(this.customerId);
    // let str: string = this.customerId;
    // let arr: Array<string> = str.split("");
    // console.log(arr)
    const str: string = this.customerId;

    const arr: Array<string> = str.toString().split(",");
    this.customerId = arr;
    console.log(this.customerId);


    this.getQuiltHistoryList();

  }

  initForm() {
    this.quiltHistoryForm = this.fb.group({
      // customerId: this.customerId,
      // startDate: this.datePipe.transform(this.startDate, 'yyyy-MM-dd'),
      // endDate: this.datePipe.transform(this.endDate, 'yyyy-MM-dd'),
      pageNumber: 1,
      pageSize: 10
    })
  }

  getQuiltHistoryList() {
    //     let str: string = this.customerId;

    // let arr: Array<string> = str.split(",");
    // console.log(arr);

    this.spinner.show();
    const listSub = this.reportService.quiltHistoryReport(this.quiltHistoryForm.getRawValue(), this.customerId, this.datePipe.transform(this.startDate, 'yyyy-MM-dd'), this.datePipe.transform(this.endDate, 'yyyy-MM-dd')).subscribe((res) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.quiltHistoryReports);
        this.length = res.data.totalCount;
        // this.pageSizeOptions = [5, 10, 50, 100, this.length];
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
    this.quiltHistoryForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltHistoryForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltHistoryList();
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
