import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-archived-customer',
  templateUrl: './archived-customer.component.html',
  styleUrls: ['./archived-customer.component.scss']
})
export class ArchivedCustomerComponent implements OnInit {
  startDate: number | string = this.activatedRoute?.snapshot?.queryParams?.startDate;
  endDate: number | string = this.activatedRoute?.snapshot?.queryParams?.endDate;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  archiveCustomerForm: FormGroup;
  selectedRows: any[] = [];
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  private subscriptions: Subscription[] = [];
  isLoading: boolean = false;
  pageEvent: PageEvent;

  get items$() {
    return this._items$.asObservable();
  }
  companyTableData: any = [
    
    {
      "customerName": "Test Food Coorporation",
      "address": "56 Street Road, XYZ",
      "city": "Chicago",
      "state": "AZ",
      "zip": "1029",
      "phoneNo":"1234567890",
      "archivedDate":"09/22/2022",
      "noOfOrders":"2"
    },
    {
      "customerName": "Test Food Coorporation",
      "address": "56 Street Road, XYZ",
      "city": "Chicago",
      "state": "AZ",
      "zip": "1029",
      "phoneNo":"1234567890",
      "archivedDate":"09/22/2022",
      "noOfOrders":"2"
    },
    {
      "customerName": "Test Food Coorporation",
      "address": "56 Street Road, XYZ",
      "city": "Chicago",
      "state": "AZ",
      "zip": "1029",
      "phoneNo":"1234567890",
      "archivedDate":"09/22/2022",
      "noOfOrders":"2"
    },
    {
      "customerName": "Test Food Coorporation",
      "address": "56 Street Road, XYZ",
      "city": "Chicago",
      "state": "AZ",
      "zip": "1029",
      "phoneNo":"1234567890",
      "archivedDate":"09/22/2022",
      "noOfOrders":"2"
    },
    {
      "customerName": "Test Food Coorporation",
      "address": "56 Street Road, XYZ",
      "city": "Chicago",
      "state": "AZ",
      "zip": "1029",
      "phoneNo":"1234567890",
      "archivedDate":"09/22/2022",
      "noOfOrders":"2"
    }
  ]
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private reportService: ReportsService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getArchiveCustomerList();
  }

  initForm() {
    this.archiveCustomerForm = this.fb.group({
      startDate: this.startDate,
      endDate: this.endDate,
      pageNumber: 1,
      pageSize: 10
    })
  }

  get isAllSelected(): boolean {
    return this.tableData.every((element) => this.selectedRows.some((row) => row.customerId === element.customerId));
  }

  get tableData(): any[] {
    return this._items$.getValue();
  }

  masterToggle(checked: boolean) {
    if (!!checked) {
      this.clearSelection();
      this.selectedRows.push(...this.tableData);
      console.log(this.tableData);
      
    } else {
      this.clearSelection();
    }
  }

  checkStockInSelectedRows(data: any) {
    return this.selectedRows.some(element => element.customerId === data.customerId);
  }

  selectRows(data: any, checked: boolean) {
    console.log(data);
    
    if (!!checked) {
      this.selectedRows.push(data)
    } else {
      let selectedIndex = this.selectedRows.findIndex(element => element.serialNumber === data.serialNumber);
      this.selectedRows.splice(selectedIndex, 1);
    }
  }

  clearSelection(clearAll:boolean = false ) {
    if (clearAll === false) {
      this.tableData.forEach((row) => {
        const index: number = this.selectedRows.findIndex((element: any) => element.serialNumber === row.serialNumber);
        if (index !== -1) {
          this.selectedRows.splice(index, 1);
        }
      })
    }else{
      this.selectedRows = [];
    }
  }

  restoreCustomer(){
    if (!this.selectedRows.length) {
      this.toastr.error("Please select one or more customer to archive.")
    }
    else{
      let customerId: number[] = [];
      let id: number[] = [];
      this.selectedRows.forEach((customer) => customerId.push(customer.customerId));
      // this.selectedRows.forEach((customer) => id.push(customer.id));
      this.spinner.show();

      const restoreCust = this.reportService.restoreCustomer(customerId).subscribe((res) => {
        console.log(customerId)
        this.spinner.hide();
  
        if (res.statusCode === 200) {
          // this._items$.next(res?.data);
          this.toastr.success(res.message);
          this.getArchiveCustomerList();
        } else {
            this.toastr.error(res.message)
        }
      })
      this.unsubscribe.push(restoreCust);
    }
  }


  getArchiveCustomerList() {
    this.spinner.show();
    this.isLoading = true;
    const listSub = this.reportService.archiveReport(this.archiveCustomerForm.getRawValue()).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        this._items$.next(res.data.customers);
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
    }, error => {
      this.isLoading = false
    })
    this.subscriptions.push(listSub);
    //   this.spinner.hide();

    //   if (res.statusCode === 200) {
    //     this._items$.next(res?.data);
    //     this.length = res?.data?.totalCount;
    //   } else {
    //     this._items$.next([]);
    //     if (res.message) {
    //       this.toastr.error(res.message)
    //     }
    //   }
    // })
    // this.unsubscribe.push(listSub);
  }

  paginator(event: any) {
    this.archiveCustomerForm.controls['pageSize'].patchValue(event.pageSize);
    this.archiveCustomerForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getArchiveCustomerList();
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
