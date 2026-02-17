import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ReportsService } from '../reports.service';
import { FetchCustomerOrderService } from 'src/app/shared/services/fetch-customer-order.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FetchQuiltStatusesService } from 'src/app/shared/services/fetch-quilt-statuses.service';
import { PageEvent } from '@angular/material/paginator';
import * as moment from 'moment';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { InventoryService } from '../../inventory/inventory.service';

@Component({
  selector: 'app-quilt-usage',
  templateUrl: './quilt-usage.component.html',
  styleUrls: ['./quilt-usage.component.scss']
})
export class QuiltUsageComponent implements OnInit {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  allCustomersOrders: any[] = [];
  allStatus: any[] = [];
  searchFilter: boolean = false;
  webAppQueExpand: number;
  webQueCollapsed: any = false;
  quiltUsageForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  pageEvent: PageEvent;
  userDetails: any;
  usageData: any = {};
  startDate: any;
  endDate: any;
  startDateForData: any;
  endDateForData: any;
  allPartNumbers: any[] = [];
  allCustomers: any[] = [];
  rangeForm: FormGroup;
  get items$() {
    return this._items$.asObservable();
  }
  public isCollapsed = true;
  dates = [
    { value: 'thirtyDays', viewValue: '30 Days' },
    { value: 'sixtyDays', viewValue: '60 Days' },
    { value: 'ninetyDays', viewValue: '90 Days' },
    { value: 'thisYear', viewValue: 'YTD' },
    { value: 'yearly', viewValue: 'Prior Yearly' },
    { value: 'twoyears', viewValue: '2 Years' },
    { value: 'threeyears', viewValue: '3 Years' },
    { value: 'custom', viewValue: 'Custom' }
  ];
  selectedRange = 'thisYear';
  dateRange: boolean = false;
  dateRangeCustom: boolean = true;

  constructor(private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private fetchCustomerOrderService: FetchCustomerOrderService,
    private quiltStatusesService: FetchQuiltStatusesService,
    private reportService: ReportsService,
    private router: Router,
    private toastr: ToastrService,
    public datePipe: DatePipe,
    private fetchCustomerService: FetchCustomersService,
    private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.initForm();
    this.dateRangee('thisYear')
    // this.quiltUsageReport();
    this.fetchQuiltStatuses();
    this.getPartNumbers();
    const partNumberIdFilter = localStorage.getItem('partNumberFilter');
    const serialNoFilter = JSON.parse(localStorage.getItem('quiltSerialNumberFilter'))
    const statusFilter = localStorage.getItem('statusFilter')
    const customerIdFilter = localStorage.getItem('customerIdFilter')
    const dateFilter = localStorage.getItem('dateFilter')
    this.quiltUsageForm.controls.partNumberId.patchValue(+partNumberIdFilter)
    this.quiltUsageForm.controls.quiltSerialNumber.patchValue(serialNoFilter || '')
    this.quiltUsageForm.controls.quiltStatusId.patchValue(+statusFilter)
    this.quiltUsageForm.controls.customerId.patchValue(+customerIdFilter)
    // this.rangeForm.controls.rangeOpt.patchValue(+dateFilter)
    if (partNumberIdFilter || serialNoFilter || statusFilter || customerIdFilter) {
      this.searchAppliedFlters()
    } else {
      this.quiltUsageReport();
    }
  }

  initForm() {
    this.quiltUsageForm = this.fb.group({
      sortByColumn: '',
      sortDescendingOrder: true,
      searchBy: '',
      pageNumber: 1,
      pageSize: 10,
      quiltSerialNumber: '',
      customerId: 0,
      quiltStatusId: 0,
      startDate: this.startDate,
      endDate: this.endDate,
      orderId: 0,
      partNumber: '',
      partNumberId: 0
    });
    this.rangeForm = this.fb.group({
      rangeOpt: [this.selectedRange]
    });
  }

  quiltUsageReport() {
    this.spinner.show();
    const body = {
      ...this.quiltUsageForm.getRawValue()
    }
    const listSub = this.reportService.quiltUsageReport(body).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.results?.quiltsUsageQuiltModel);
        this.usageData = res?.data?.results
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

  fetchAllCustomers() {
    this.spinner.show();

    let apiCalled = false;
    const allCustomersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
      if (customers.length || apiCalled) {
        this.allCustomers = customers;
        this.spinner.hide();
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchCustomerService.getAllCustomers(false, false);
      }
    })

    this.unsubscribe.push(allCustomersSub);
  }

  getPartNumbers() {
    this.spinner.show();

    const partNumbersSub = this.inventoryService.getPartNumbers().subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allPartNumbers = res?.data;
        this.fetchAllCustomers();
      } else {
        this.spinner.hide();
        this.allPartNumbers = [];
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(partNumbersSub);
  }

  partNumberSelected(id: number) {
    let findName;
    debugger
    if (id > 0) {
      findName = this.allPartNumbers.find(x => x.id === id).name;
      this.quiltUsageForm.controls.partNumber.patchValue(findName)
    } else {
      findName = ''
    }
  }

  dateCalc(range: number) {
    let date: Date = new Date();
    this.dateRange = false;
    this.dateRangeCustom = true;
    this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDate = moment(date.setDate(date.getDate() - range)).format("YYYY-MM-DD");
    this.startDateForData = moment(date.setDate(date.getDate() - range)).format("YYYY-MM-DD");
    this.quiltUsageForm.controls.startDate.patchValue(this.startDate);
    this.quiltUsageForm.controls.endDate.patchValue(this.endDate);
    this.quiltUsageForm.controls.startDate.disable();
    this.quiltUsageForm.controls.endDate.disable();
  }

  dateRangee(dValue: any) {
    let date: Date = new Date();

    if (dValue === "thirtyDays") {
      this.dateCalc(29)
    }
    else if (dValue === "sixtyDays") {
      this.dateCalc(59)
    }
    else if (dValue === "ninetyDays") {
      this.dateCalc(89)
    } else if (dValue === 'thisYear') {
      let date: Date = new Date();
      this.dateRange = false;
      this.dateRangeCustom = true;
      this.startDate = moment().startOf('year').format("YYYY-MM-DD")
      this.startDateForData = moment().startOf('year').format("YYYY-MM-DD");
      this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.quiltUsageForm.controls.startDate.patchValue(this.startDate);
      this.quiltUsageForm.controls.endDate.patchValue(this.endDate);
      this.quiltUsageForm.controls.startDate.disable();
      this.quiltUsageForm.controls.endDate.disable();
    }
    else if (dValue === "yearly") {
      this.dateCalc(365)
    } else if (dValue === "twoyears") {
      this.dateCalc(730)
    } else if (dValue === "threeyears") {
      this.dateCalc(1095)
    }

    else if (dValue === "custom") {
      this.dateRangeCustom = false;
      this.dateRange = true;
      this.startDateForData = "";
      this.endDateForData = "";
      this.startDate = "";
      this.endDate = "";
      this.quiltUsageForm.controls.startDate.enable();
      this.quiltUsageForm.controls.endDate.enable();
      this.quiltUsageForm.controls.startDate.patchValue(this.startDate);
      this.quiltUsageForm.controls.endDate.patchValue(this.endDate);
    }

  }

  onStartingDateScheduledRange({ value }: { value: any }) {
    this.startDate = value;
  }

  onEndingDateScheduledRange({ value }: { value: any }) {
    this.endDate = value;
  }

  fetchAllCustomerswithOrders() {
    let apiCalled = false;
    const customersSub = this.fetchCustomerOrderService.allCustomersOrders.subscribe((customers) => {
      if (customers.length || apiCalled) {
        this.allCustomersOrders = customers;
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchCustomerOrderService.getAllCustomersWithOrder();
      }
    })
    this.unsubscribe.push(customersSub);
  }

  fetchQuiltStatuses() {
    // this.spinner.show();

    let apiCalled = false;
    const quiltStatusSub = this.quiltStatusesService.allQuiltStatuses.subscribe((allstatus) => {
      if (allstatus.length || apiCalled) {
        this.allStatus = allstatus;
      }
      else if (!apiCalled) {
        apiCalled = true;
        this.quiltStatusesService.getQuiltStatuses();
      }
    })
    this.unsubscribe.push(quiltStatusSub);
  }

  searchAppliedFlters() {
    this.searchFilter = true;
    this.applyFilters();
  }

  applyFilters() {
    this.quiltUsageForm.controls['pageNumber'].patchValue(1);
    this.quiltUsageReport();
    localStorage.setItem('partNumberFilter', JSON.stringify(this.quiltUsageForm.controls['partNumberId'].value))
    localStorage.setItem('quiltSerialNumberFilter', JSON.stringify(this.quiltUsageForm.controls['quiltSerialNumber'].value) || '')
    localStorage.setItem('statusFilter', JSON.stringify(this.quiltUsageForm.controls['quiltStatusId'].value))
    localStorage.setItem('customerIdFilter', JSON.stringify(this.quiltUsageForm.controls['customerId'].value))
    // localStorage.setItem('dateFilter', JSON.stringify(this.rangeForm.controls['rangeOpt'].value))
  }

  resetFilters() {
    this.searchFilter = false;
    this.initForm();
    this.applyFilters();
    localStorage.removeItem('partNumberFilter');
    localStorage.removeItem('quiltSerialNumberFilter')
    localStorage.removeItem('statusFilter')
    localStorage.removeItem('customerIdFilter')
    // localStorage.removeItem('dateFilter')
    this.dateRangee('thisYear')
    this.quiltUsageReport();
  }

  getCustomerDetails(cusId: number, quiltId: number, serialNo: string, cusName: string) {
    this.router.navigate(['/reports/quilt-usage-detail'], { queryParams: { customerId: cusId, quiltId: quiltId, serialNumber: serialNo, customerName: cusName } });
  }

  webAppQueToggle(toggleTo: boolean, index: number) {
    this.webQueCollapsed = toggleTo;
    if (toggleTo === true) {
      this.webAppQueExpand = index;
    } else {
      this.webAppQueExpand = undefined;
    }
  }

  paginator(event: any) {
    this.quiltUsageForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltUsageForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.quiltUsageReport();
  }
}
