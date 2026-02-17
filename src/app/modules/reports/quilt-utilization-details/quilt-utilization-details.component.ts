import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-quilt-utilization-details',
  templateUrl: './quilt-utilization-details.component.html',
  styleUrls: ['./quilt-utilization-details.component.scss']
})
export class QuiltUtilizationDetailsComponent implements OnInit {
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  customerGroupId: any = this.activatedRoute?.snapshot?.queryParams?.customerGroupId;
  // customerName: any = this.activatedRoute?.snapshot?.queryParams?.customerName;
  // totalCount: any = this.activatedRoute?.snapshot?.queryParams?.totalCount;
  startDate: any = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: any = this.activatedRoute?.snapshot?.queryParams?.endDate;
  quiltUtilizationIds: any = this.activatedRoute?.snapshot?.queryParams?.quiltUtilizationIds;
  customerName: any;
  totalCount: any;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  quiltUtilisationDetailsForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.customerGroupId)
    this.initForm();
    this.getQuiltUtilisationDetailsList()
  }

  initForm() {
    this.quiltUtilisationDetailsForm = this.fb.group({
      customerGroupId: this.customerGroupId,
      startDate: this.startDate,
      endDate: this.endDate,
      pageNumber: 1,
      pageSize: 10
    })
  }

  getQuiltUtilisationDetailsList() {
    this.spinner.show();

    const listSub = this.reportService.getQuiltUtilisationByCustomer(this.quiltUtilisationDetailsForm.getRawValue()).subscribe((res) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.quiltUtilisations);
        this.customerName = res.data.customerName;
        this.totalCount = res.data.totalShipmentCount;
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
    this.quiltUtilisationDetailsForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltUtilisationDetailsForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltUtilisationDetailsList();
  }

  backToQuilts(){
    this.router.navigate(['/reports/quilt-utilization'], { queryParams: {customerId: this.quiltUtilizationIds, startDate:this.startDate, endDate: this.endDate } });
  }

  printHtml(comp: any){
    let printContents = document.getElementById(comp).innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload();
  }


}
