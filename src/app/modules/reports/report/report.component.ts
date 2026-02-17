import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { FetchCustomerOrderService } from 'src/app/shared/services/fetch-customer-order.service';
import { FetchReportTypesService } from 'src/app/shared/services/fetch-report-types.service';
import { ReportsService } from '../reports.service';
import * as moment from "moment";
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { MatOption } from '@angular/material/core';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  allReportTypes: any[] = [];
  allCustomers: any[] = [];
  allCustomersOrders: any[] = [];
  customerIDs: any[] = [];
  reportValue: boolean = false;
  reportView: boolean = false;
  hideCustomerField: boolean = false;
  customerHisField: boolean = false;
  reportTypeForm: FormGroup;
  quiltHistoryForm: FormGroup;
  lastLocationForm: FormGroup;
  private _items$ = new BehaviorSubject<[]>([]);
  length: number;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10];
  pageEvent: PageEvent;
  quiltHis: boolean = false;
  custHis: boolean = false;
  lastLoc: boolean = false;
  quiltUti: boolean = false;
  details: boolean = false;
  startDateQuilt: any;
  endDateQuilt: any;
  customerHistoryForm: FormGroup;
  quiltUtilisationForm: FormGroup;
  collapsed: any = false;
  collapsedNot: number;
  detailData: any;
  userDetails: any;
  loggedInUserRole: Roles;
  get items$() {
    return this._items$.asObservable();
  }
  cusName: string;
  custGroupId: number;
  allLocation: any[] = [];
  locationReport: any[] = []
  userId: number;
  companyRoles = [this.roleEnum.customerAdmin, this.roleEnum.customerManager];
  todayDate: boolean = false;
  allItems: boolean = false
  @ViewChild('allSelected') private allSelected: MatOption;

  allOrderType: any[] = [{ id: 1, name: 'Leased' }, { id: 2, name: 'Purchased' }];


  constructor(
    private spinner: NgxSpinnerService,
    private reportTypeService: FetchReportTypesService,
    private fb: FormBuilder,
    private fetchCustomerService: FetchCustomersService,
    private fetchCustomerOrderService: FetchCustomerOrderService,
    private reportService: ReportsService,
    private router: Router,
    private toastr: ToastrService,
    public datePipe: DatePipe,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.custGroupId = this.userDetails?.custGroupId || "";
    this.userId = this.userDetails?.companyId;
    this.initForm();
    this.fetchReportTypes();
    debugger;
    //  this.companyList();
    if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
      this.getLocationsForCompanyUser(this.custGroupId)
    }
    if (this.loggedInUserRole === this.roleEnum.customerManager) {
      this.locationReport.push(this.userDetails?.locationId);
    }
    if (this.loggedInUserRole === this.roleEnum.globalAdmin) {
      this.fetchAllCustGroups()
    }
  }

  companyList() {
    if (this.loggedInUserRole === this.roleEnum.globalAdmin) {
      this.fetchAllCustGroups()
    } else if (!this.companyRoles.includes(this.loggedInUserRole)) {
      this.fetchAllCustomers();
    }
  }

  companySelected(event: any) {
    this.userId = event;
    this.getLocationsForCompanyUser(this.userId)
    this.cusName = this.allCustomersOrders.find(x => x.id === event).name;
  }

  locationSelected(event: any) {
    if (event[0] === -1) {
      this.locationReport.push(...this.allLocation.map(item => item.id));
      this.allItems = true;
    } else {
      this.locationReport = event;
    }
  }

  fetchReportTypes() {
    // this.spinner.show();
    let apiCalled = false;
    const reportTypesSub = this.reportTypeService.reportTypes.subscribe((types) => {
      if (types.length && apiCalled) {
        this.allReportTypes = types;
      } else if (!apiCalled) {
        apiCalled = true;
        this.reportTypeService.getAllReportTypes();
      }
    })
    this.unsubscribe.push(reportTypesSub);
  }
  fetchAllCustGroups() {
    this.spinner.show();
    let apiCalled = false;
    const customersSub = this.reportService.getCustomersByGroup(+this.custGroupId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomersOrders = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(customersSub);
  }

  fetchAllCustomers() {
    // this.spinner.show();

    // let apiCalled = false;
    // const customersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
    //   if (customers.length || apiCalled) {
    //     this.allCustomers = customers;
    //   } else if (!apiCalled) {
    //     apiCalled = true;
    //     this.fetchCustomerService.getAllCustomers();
    //   }
    // })
    // this.unsubscribe.push(customersSub);
    let apiCalled = false;
    const customersSub = this.fetchCustomerOrderService.allCustomersOrders.subscribe((customers) => {
      if (customers.length || apiCalled) {
        this.allCustomersOrders = customers;
      } else if (!apiCalled) {
        apiCalled = true;
        if (this.reportTypeForm.controls.reportId.value === 10) {
          this.fetchCustomerOrderService.getAllCustomerHaveUsers();
        } else
          this.fetchCustomerOrderService.getAllCustomersWithOrder();
        // this.allCustomersOrders = customers;
      }
    })
    this.unsubscribe.push(customersSub);
  }

  getLocationsForCompanyUser(customerId: any) {
    this.spinner.show()
    const locationDrop = this.reportService.getLocationsForCompanyUser(customerId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allLocation = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  initForm() {
    this.reportTypeForm = this.fb.group({
      reportId: ["", [Validators.required]],
      customerId: ["", [Validators.required]],
      startDate: ["", [Validators.required]],
      endDate: ["", [Validators.required]],
      locationIds: [''],
      orderTypeId: [0]
    });
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.reportTypeForm.controls.locationIds.patchValue([...this.allLocation.map(item => item.id), -1]);
    } else {
      this.reportTypeForm.controls.locationIds.patchValue([]);
    }
  }


  openData(toggleTo: boolean, index: number) {
    this.collapsed = toggleTo;
    if (toggleTo === true) {
      this.collapsedNot = index;
    } else {
      this.collapsedNot = undefined;
    }
  }

  // openDetails(name: any, order: any){
  //   this.details = true;
  //   this.spinner.show();

  //   const details = this.reportService.getQuiltDetailsByCustomer(name, order).subscribe((res) => {
  //     this.spinner.hide();

  //     if (res.statusCode === 0) {
  //     this.detailData = res.data;
  //     // console.log(this.detailData);

  //     } else {
  //         this.toastr.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(details);
  // }

  onReportTypeChange(event: any) {
    if (event.value !== 9) {
      this.reportValue = true;
    } else {
      this.reportValue = false;
    }
    if (event.value === 4 || event.value === 10 || this.loggedInUserRole.includes(this.roleEnum.customerAdmin) || this.loggedInUserRole.includes(this.roleEnum.customerManager)) {
      this.hideCustomerField = true;
      this.reportTypeForm.get('customerId').clearValidators();
      this.reportTypeForm.get('customerId').updateValueAndValidity();
      if (this.reportTypeForm.controls.reportId.value === 6 || this.reportTypeForm.controls.reportId.value === 7 || this.reportTypeForm.controls.reportId.value === 8) {
        this.todayDate = true
        this.reportTypeForm.controls['startDate'] = new FormControl((new Date()));
      } else { this.todayDate = false }
    }
    else if (event.value !== 9) {
      if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        this.reportTypeForm.controls.orderTypeId.setValue(2)
        this.reportTypeForm.controls.orderTypeId.disable()
      }
      this.hideCustomerField = false;
      this.companyList();
      this.newDateField()
    }
  }
  newDateField() {
    if (this.reportTypeForm.controls.reportId.value === 6 || this.reportTypeForm.controls.reportId.value === 7 || this.reportTypeForm.controls.reportId.value === 8) {
      this.todayDate = true
      this.reportTypeForm.controls['startDate'] = new FormControl((new Date()));
    } else { this.todayDate = false }
  }

  generateReport(id: any, cId: any, sDate: any, eDate: any) {
    console.log(id, cId, sDate, eDate)
    const reportTypeForm = this.reportTypeForm;
    const arrayOfValues = [cId]
    if (id === 9 || id === 10) { this.reportTypeForm.get('customerId').clearValidators(); this.reportTypeForm.get('customerId').updateValueAndValidity(); this.reportTypeForm.get('startDate').clearValidators(); this.reportTypeForm.get('startDate').updateValueAndValidity(); }
    if (id === 6 || id === 7 || id === 8 || id === 9 || id === 10) { this.reportTypeForm.get('endDate').clearValidators(); this.reportTypeForm.get('endDate').updateValueAndValidity(); }
    if (reportTypeForm.invalid) {
      reportTypeForm.markAllAsTouched();
    } else if (!this.reportTypeForm.pristine) {
      if (id === 1) {

        this.router.navigate(['/reports/quilt-history'], { queryParams: { customerId: arrayOfValues, startDate: moment(sDate).format("MM/DD/YYYY"), endDate: moment(eDate).format("MM/DD/YYYY") } });
        //  console.log(cId);
        // this.reportService.customerId.next(cId);
        //    this.router.navigate(['/reports/quilt-history'], { queryParams: {startDate:moment(sDate).format("MM/DD/YYYY"), endDate: moment(eDate).format("MM/DD/YYYY") } });
        //   this.quiltHistory()
        //   this.quiltHis = true;
        // this.getQuiltHistoryList();

      }
      else if (id === 2) {
        // this.reportService.customerId.next(cId);
        this.router.navigate(['/reports/customer-history'], { queryParams: { customerId: arrayOfValues, startDate: moment(sDate).format("MM/DD/YYYY"), endDate: moment(eDate).format("MM/DD/YYYY") } });
        // this.custHis = true;
        // this.customerHistory();
        // this.getCustomerHistoryList();
      }
      else if (id === 3) {
        // this.reportService.customerId.next(cId);
        this.router.navigate(['/reports/last-location'], { queryParams: { customerId: arrayOfValues, startDate: moment(sDate).format("MM/DD/YYYY"), endDate: moment(eDate).format("MM/DD/YYYY") } });
        // this.lastLoc = true;
        // this.lastLocation();
        // this.getLastLocationList();
      }
      else if (id === 4) {
        this.router.navigate(['/reports/archived-customer'], { queryParams: { startDate: moment(sDate).format("MM/DD/YYYY"), endDate: moment(eDate).format("MM/DD/YYYY") } });
      }
      else if (id === 5) {
        // this.reportService.customerId.next(cId);
        this.router.navigate(['/reports/quilt-utilization'], { queryParams: { customerId: arrayOfValues, startDate: moment(sDate).format("MM/DD/YYYY"), endDate: moment(eDate).format("MM/DD/YYYY") } });
        // this.quiltUti = true;
        // this.quiltUtilisation();
        // this.getQuiltUtilisationList();
      }
      else if (id === 6) {
        if(this.loggedInUserRole.includes(this.roleEnum.masterAdmin) || this.loggedInUserRole.includes(this.roleEnum.serviceManager)){
          this.router.navigate(['/reports/quilt-onHand'], { queryParams: { customerId: this.userId, customerName: this.cusName, locationIds: this.locationReport, orderType: this.reportTypeForm.controls.orderTypeId.value, typeOfReport: id, startDate: moment(sDate).format("MM/DD/YYYY"), dashboardView: false } });
        }else{
          this.router.navigate(['/reports/quilt-onHand'], { queryParams: { customerId: this.custGroupId, customerName: this.cusName, locationIds: this.locationReport, orderType: this.reportTypeForm.controls.orderTypeId.value, typeOfReport: id, startDate: moment(sDate).format("MM/DD/YYYY"), dashboardView: false } });
        }
        
      }
      else if (id === 7) {
        if(this.loggedInUserRole.includes(this.roleEnum.masterAdmin) || this.loggedInUserRole.includes(this.roleEnum.serviceManager)){
          this.router.navigate(['/reports/quilt-inbound'], { queryParams: { customerId: this.userId, customerName: this.cusName, locationIds: this.locationReport, orderType: this.reportTypeForm.controls.orderTypeId.value, typeOfReport: id, startDate: moment(sDate).format("MM/DD/YYYY"), dashboardView: false } });
      }else{
        this.router.navigate(['/reports/quilt-inbound'], { queryParams: { customerId: this.custGroupId, customerName: this.cusName, locationIds: this.locationReport, orderType: this.reportTypeForm.controls.orderTypeId.value, typeOfReport: id, startDate: moment(sDate).format("MM/DD/YYYY"), dashboardView: false } });
      }
        
      }
      else if (id === 8) {
        if(this.loggedInUserRole.includes(this.roleEnum.masterAdmin) || this.loggedInUserRole.includes(this.roleEnum.serviceManager)){
          this.router.navigate(['/reports/quilt-outbound'], { queryParams: { customerId: this.userId, customerName: this.cusName, locationIds: this.locationReport, orderType: this.reportTypeForm.controls.orderTypeId.value, typeOfReport: id, startDate: moment(sDate).format("MM/DD/YYYY"), dashboardView: false } });
        }else{
          this.router.navigate(['/reports/quilt-outbound'], { queryParams: { customerId: this.custGroupId, customerName: this.cusName, locationIds: this.locationReport, orderType: this.reportTypeForm.controls.orderTypeId.value, typeOfReport: id, startDate: moment(sDate).format("MM/DD/YYYY"), dashboardView: false } });
        }
        
      }
      else if (id === 9) {
        this.router.navigate(['/reports/quilt-usage'], { queryParams: {} });
      }
      else if (id === 10) {
        this.router.navigate(['/reports/user-activity'], { queryParams: {} });
      }
    }
  }

}
