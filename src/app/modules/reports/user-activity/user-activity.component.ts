import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService } from '../reports.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileModalComponent } from '../user-profile-modal/user-profile-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss']
})
export class UserActivityComponent implements OnInit {
  // customerId: any = this.activatedRoute?.snapshot?.queryParams?.customerId;
  // customerName: any = this.activatedRoute?.snapshot?.queryParams?.customerName;
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  allCustomersOrders: any[] = [];
  allStatus: any[] = [];
  searchFilter: boolean = false;
  activityDetailForm: FormGroup;
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  pageEvent: PageEvent;
  public roleEnum = Roles;
  userDetails: any;
  loggedInUserRole: Roles;


  get items$() {
    return this._items$.asObservable();
  }

  constructor(private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportsService,
    private toastr: ToastrService,
    public datePipe: DatePipe,
    private modalService: NgbModal,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";

    this.initForm();
    this.activityReport();
  }
  initForm() {
    this.activityDetailForm = this.fb.group({
      sortByColumn: '',
      sortDescendingOrder: true,
      pageNumber: 1,
      pageSize: 10,
      companyId: 0,
      searchBy: "",
      startDate: null,
      endDate: null
    })
  }

  get formValues() {
    return this.activityDetailForm.getRawValue();
  }

  activityReport() {
    this.spinner.show();
    const body = {
      ...this.formValues,
      // companyId: +this.customerId
    }
    const listSub = this.reportService.getActivityReport(body).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this._items$.next(res?.data?.logInHistory);
        console.log(res?.data?.logInHistory);
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
    this.activityDetailForm.controls['pageNumber'].patchValue(1);
    this.activityReport();
  }

  resetFilters() {
    this.searchFilter = false;
    this.initForm();
    this.applyFilters();
  }

  paginator(event: any) {
    this.activityDetailForm.controls['pageSize'].patchValue(event.pageSize);
    this.activityDetailForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.activityReport();
  }

  public profileModal(userId: number): void {
    const modalRef = this.modalService.open(UserProfileModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.componentInstance.userId = +userId;
  }
}
