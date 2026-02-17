import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ReportsService } from '../reports.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-last-location',
  templateUrl: './last-location.component.html',
  styleUrls: ['./last-location.component.scss']
})
export class LastLocationComponent implements OnInit {
  customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: number | string = this.activatedRoute?.snapshot?.queryParams?.endDate;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  lastLocationForm: FormGroup;
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
      "quiltSerialNo": "CQ652434",
      "type": "P",
      "origin": "Q Warehouse",
      "destination": "Naperville DC",
      "shipDate": "12/09/21",
      "receiveDate": "12/27/21"
    },
    {
      "quiltSerialNo": "CQ652434",
      "type": "P",
      "origin": "Q Warehouse",
      "destination": "Naperville DC",
      "shipDate": "12/09/21",
      "receiveDate": "12/27/21"
    },
    {
      "quiltSerialNo": "CQ652434",
      "type": "P",
      "origin": "Q Warehouse",
      "destination": "Naperville DC",
      "shipDate": "12/09/21",
      "receiveDate": "12/27/21"
    },
    {
      "quiltSerialNo": "CQ652434",
      "type": "P",
      "origin": "Q Warehouse",
      "destination": "Naperville DC",
      "shipDate": "12/09/21",
      "receiveDate": "12/27/21"
    },
    {
      "quiltSerialNo": "CQ652434",
      "type": "P",
      "origin": "Q Warehouse",
      "destination": "Naperville DC",
      "shipDate": "12/09/21",
      "receiveDate": "12/27/21"
    },
    {
      "quiltSerialNo": "CQ652434",
      "type": "P",
      "origin": "Q Warehouse",
      "destination": "Naperville DC",
      "shipDate": "12/09/21",
      "receiveDate": "12/27/21"
    }


  ];
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    public datePipe: DatePipe,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.loggedInCustomerId = this.userDetails?.custGroupId || "";
    this.initForm();
    // const str: string = this.customerId;

    // const arr: Array<string> = str.toString().split(",");
    // this.customerId = arr;
    if (this.loggedInUserRole.includes(this.roleEnum.customerAdmin)) {
      this.customerId = [this.loggedInCustomerId]
    }

    else {
      const str: string = this.customerId;

      const arr: Array<string> = str.toString().split(",");
      this.customerId = arr;
    }
    this.getLastLocationList();
  }

  initForm() {
    this.lastLocationForm = this.fb.group({
      // customerId: this.customerId,
      // startDate: this.startDate,
      // endDate: this.endDate,
      pageNumber: 1,
      pageSize: 10
    })
  }

  getLastLocationList() {
    this.spinner.show();

    const listSub = this.reportService.lastLocationQuiltsReport(this.lastLocationForm.getRawValue(), this.customerId, this.datePipe.transform(this.startDate, 'yyyy-MM-dd'), this.datePipe.transform(this.endDate, 'yyyy-MM-dd')).subscribe((res) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this._items$.next(res?.data?.locations);
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
    this.lastLocationForm.controls['pageSize'].patchValue(event.pageSize);
    this.lastLocationForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getLastLocationList();
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
