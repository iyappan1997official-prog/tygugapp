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
  selector: 'app-quilt-utilization',
  templateUrl: './quilt-utilization.component.html',
  styleUrls: ['./quilt-utilization.component.scss']
})
export class QuiltUtilizationComponent implements OnInit {
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: number | string = this.activatedRoute?.snapshot?.queryParams?.endDate;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  quiltUtilisationForm: FormGroup;
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
      "location": "Napperville DC",
      "protactedShipments": "2",
      "shippingDate": "12/27/2021"
    },
    {
      "location": "Napperville DC",
      "protactedShipments": "2",
      "shippingDate": "12/27/2021"
    },
    {
      "location": "Napperville DC",
      "protactedShipments": "2",
      "shippingDate": "12/27/2021"
    },
    {
      "location": "Napperville DC",
      "protactedShipments": "2",
      "shippingDate": "12/27/2021"
    },
    {
      "location": "Napperville DC",
      "protactedShipments": "2",
      "shippingDate": "12/27/2021"
    },
  ]
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    public datePipe: DatePipe,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.loggedInCustomerId = this.userDetails?.custGroupId || "";
    this.initForm();
    // const str: string = this.customerId;

    // const arr: Array<string> = str.toString().split(",");
    // this.customerId = arr;
    if (this.loggedInUserRole.includes(this.roleEnum.customerAdmin) || this.loggedInUserRole.includes(this.roleEnum.customerManager)) {
      this.customerId = [this.loggedInCustomerId]
    }

    else {
      const str: string = this.customerId;

      const arr: Array<string> = str.toString().split(",");
      this.customerId = arr;
    }
    this.getQuiltUtilisationList();
  }

  initForm() {
    this.quiltUtilisationForm = this.fb.group({
      // customerId: this.customerId,
      // startDate: this.startDate,
      // endDate: this.endDate,
      pageNumber: 1,
      pageSize: 10
    })
  }


  getQuiltUtilisationList() {
    this.spinner.show();

    const listSub = this.reportService.quiltUtilisationReport(this.quiltUtilisationForm.getRawValue(), this.customerId, this.datePipe.transform(this.startDate, 'yyyy-MM-dd'), this.datePipe.transform(this.endDate, 'yyyy-MM-dd')).subscribe((res) => {
      this.spinner.hide();
console.log(res)
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.customers);
        this.length = res.data.totalCount;
        // this.pageSizeOptions=[5, 10, 50, 100, this.length]
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
    this.quiltUtilisationForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltUtilisationForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltUtilisationList();
  }

  utilizationDetails(cId: any) {
    this.router.navigate(['/reports/quilt-utilization-details'], { queryParams: { customerGroupId: cId, startDate: this.startDate, endDate: this.endDate, quiltUtilizationIds: this.customerId } });
  }

  printHtml(comp: any) {
    // let popupWinindow
    // let innerContents = document.getElementById(comp).innerHTML;
    // popupWinindow = window.open();
    // popupWinindow.document.open();
    // popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    // popupWinindow.document.close();
    let printContents = document.getElementById(comp).innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload();
  }

}
