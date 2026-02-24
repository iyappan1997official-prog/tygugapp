import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { RepairService } from 'src/app/modules/repair/repair.service';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-repair-reports',
  templateUrl: './repair-reports.component.html',
  styleUrls: ['./repair-reports.component.scss'],
  animations: [
    trigger('sectionTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' }))
      ])
    ])
  ]
})

export class RepairReportsComponent implements OnInit {

  title = 'Repair Reports Module';

  repairreportForm!: FormGroup;
  isLoading = false;
  allCustomers: { id: number, name: string }[] = [];
  serviceCenterLocations: { id: number, name: string }[] = [];
  userDetails: any;
  loggedInUserRole: string;
  loggedInCustGroupId: number | null = null;
  loggedInCustomerId: number | null = null;
  isMasterAdmin: boolean = false;
  showCustomerSection = false;
  showServiceCenterSection = false;
  selectedReport: 'customer' | 'service center' | null = null;
  selectedTabIndex = 0;
  isTabSwitching = false;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private repairService: RepairService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles?.[0] || '';
    this.loggedInCustGroupId = this.userDetails?.custGroupId || null;
    this.loggedInCustomerId = null;
    this.isMasterAdmin = this.loggedInUserRole === Roles.masterAdmin; // ✅ Check role

    this.initForm();

    // If not Master Admin → set customer ID automatically
    if (!this.isMasterAdmin) {
      this.repairreportForm.patchValue({ customerId: null });
      this.repairreportForm.get('customerId')?.disable(); // lock the field
      this.resolveCustomerIdByCustGroupId();
    } else {
      this.loadCustomers(); // load all customers only for Master Admin
    }

    this.selectReport('customer');
  }
  private initForm(): void {
    this.repairreportForm = this.fb.group({
      reportType: [''],
      customerId: [null],
      serviceCenterLocationId: [0],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });
  }

  private loadCustomers(): void {
    this.isLoading = true;
    this.repairService.getAllCustomers().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.hasError && res.data) {
          this.allCustomers = res.data.map((c: any) => ({
            id: c.id,
            name: c.name
          }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching customers', err);
      }
    });
  }

  private loadServiceCenterLocations(): void {
    this.isLoading = true;
    this.repairService.getServiceCenterLocations().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.data) {
          this.serviceCenterLocations = res.data.map((l: any) => ({
            id: l.id,
            name: l.name
          }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching service centers', err);
      }
    });
  }

  private resolveCustomerIdByCustGroupId(onResolved?: () => void): void {
    if (this.isMasterAdmin || !this.loggedInCustGroupId) {
      onResolved?.();
      return;
    }

    this.isLoading = true;
    this.repairService.getCustomersByCustGroupId(this.loggedInCustGroupId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const resolvedCustomerId = res?.data?.length ? Number(res.data[0].id) : null;
        this.loggedInCustomerId = resolvedCustomerId;
        this.repairreportForm.patchValue({ customerId: resolvedCustomerId });
        onResolved?.();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error resolving customerId by custGroupId', err);
      }
    });
  }

  private navigateToCustomerReport(customerId: number | null, startDateStr: string, endDateStr: string): void {
    const queryParams: any = {
      startDate: startDateStr,
      endDate: endDateStr
    };

    if (customerId) {
      queryParams.customerId = customerId;
    }

    this.router.navigate(['/repair/repair-summary-report'], {
      queryParams
    });
  }

  generateRepairSummary(): void {
    if (!this.selectedReport) {
      this.repairreportForm.markAllAsTouched();
      return;
    }

    if (!this.repairreportForm.valid) {
      this.repairreportForm.markAllAsTouched();
      return;
    }

    const { customerId, serviceCenterLocationId, startDate, endDate } =
      this.repairreportForm.getRawValue();

    const startDateStr =
      startDate instanceof Date ? startDate.toISOString() : startDate;
    const endDateStr =
      endDate instanceof Date ? endDate.toISOString() : endDate;

    // ✅ CASE 1: CUSTOMER REPORT → GO TO REPAIR SUMMARY REPORT
    if (this.selectedReport === 'customer') {
      if (this.isMasterAdmin) {
        this.navigateToCustomerReport(customerId, startDateStr, endDateStr);
        return;
      }

      if (this.loggedInCustomerId) {
        this.navigateToCustomerReport(this.loggedInCustomerId, startDateStr, endDateStr);
        return;
      }

      this.resolveCustomerIdByCustGroupId(() => {
        if (!this.loggedInCustomerId) {
          return;
        }
        this.navigateToCustomerReport(this.loggedInCustomerId, startDateStr, endDateStr);
      });
      return;
    }

    // ✅ CASE 2: SERVICE CENTER REPORT → GO TO BLANK PAGE (NEW ROUTE)
    else if (this.selectedReport === 'service center') {
      this.router.navigate(['/repair/service-center-report'], {
        queryParams: {
          startReceiveDate: startDateStr,
          endReceiveDate: endDateStr,
          locationId: serviceCenterLocationId || 0
        }
      });
    }
  }
  // generateRepairSummary(): void {
  //    if(!this.repairreportForm.valid) {
  //    this.repairreportForm.markAllAsTouched();
  //    return;
  //  }

  //  const { customerId, startDate, endDate } =
  //    this.repairreportForm.getRawValue();
  //  const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
  //  const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

  //  const queryParams: any = {
  //    startDate: startDateStr,
  //    endDate: endDateStr
  //  };

  //  if (customerId) {
  //    queryParams.customerId = customerId;
  //  }

  //  this.router.navigate(['/repair/repair-summary-report'], {
  //    queryParams
  //  });
  //} 
  //onReportSelect(value: string) {
  //  if (value === 'customer') {
  //    this.showCustomerSection = true;
  //    this.showServiceCenterSection = false;
  //    this.loadCustomers();
  //  }
  //  else if (value === 'service center') {
  //    this.showCustomerSection = false;
  //    this.showServiceCenterSection = true;
  //    this.loadServiceCenterLocations();
  //  }
  //  else {
  //    this.showCustomerSection = false;
  //    this.showServiceCenterSection = false;
  //    this.repairreportForm.reset();
  //  }
  //}
  selectReport(type: 'customer' | 'service center') {
    if (type === 'service center' && !this.isMasterAdmin) {
      return;
    }

    this.selectedReport = type;

    if (type === 'customer') {
      this.selectedTabIndex = 0;
      this.showCustomerSection = true;
      this.showServiceCenterSection = false;
      if (this.isMasterAdmin) {
        this.loadCustomers();
      }
    }

    else if (type === 'service center') {
         this.selectedTabIndex = 1;
         this.showCustomerSection = false;
         this.showServiceCenterSection = true;
         this.loadServiceCenterLocations();
      }

    else {
        this.showCustomerSection = false;
        this.showServiceCenterSection = false;
        this.repairreportForm.reset();
       }
  }

  onReportTabChange(index: number): void {
    this.isTabSwitching = true;

    // Show spinner briefly while switching sections for smoother UX.
    setTimeout(() => {
      this.isTabSwitching = false;
      if (index === 0) {
        this.selectReport('customer');
        return;
      }

      this.selectReport('service center');
    }, 180);
  }

    get f() {
     return this.repairreportForm.controls;
  }
}


