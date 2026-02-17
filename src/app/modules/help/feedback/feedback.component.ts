import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HelpService } from '../help.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  public roleEnum = Roles;
  feedForm: FormGroup;
  feedbackList: FormGroup;
  locArr: any[] = []
  allCustomers: any[] = [];
  pageSizeMoreOptions: number[] = [5, 10, 50, 100]
  searchFilter: boolean = false;
  totalFeed: number;
  @Input() userRole: Roles;
  private _items$ = new BehaviorSubject<[]>([]);
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  private unsubscribe: Subscription[] = [];
  companyRoles: string[] = [this.roleEnum.customerAdmin, this.roleEnum.customerManager];
  masterAdminRoles = [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser]
  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private helpService: HelpService,
    private fetchCustomerService: FetchCustomersService,
    private activatedRoute: ActivatedRoute) { }
  get items$() {
    return this._items$.asObservable();
  }

  ngOnInit(): void {
    // if (this.tab === "feedback") {
    this.feedbackType()
    // }
  }
  feedbackType() {
    if ([...this.companyRoles, this.roleEnum.globalAdmin].includes(this.userRole)) {
      this.feedbackForm();
    } else {
      this.feedList();
      this.getFeedbackList();
      this.fetchAllCustomers()
    }
  }
  feedbackForm() {
    this.feedForm = this.fb.group({
      title: ['Customer Feedback'],
      description: ['', [Validators.required]]
    })
  }

  feedList() {
    this.feedbackList = this.fb.group({
      sortByColumn: '',
      sortAscendingOrder: true,
      searchBy: '',
      pageNumber: 1,
      pageSize: 10,
      custGroupId: 0,
      locationIds: [],
      startDate: null,
      endDate: null
    })
  }

  addFeedback() {
    const feedForm = this.feedForm;
    if (feedForm.invalid) {
      feedForm.markAllAsTouched();
    } else if (!this.feedForm.pristine) {
      this.addFeedbackDetails();
    }
  }


  addFeedbackDetails() {
    this.spinner.show();
    const addFeedbackToList = this.helpService.addFeedback(this.feedForm.getRawValue()).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.feedForm.reset();
        if (res.message) {
          this.toastr.success(res.message);
        }
      } else if (res.message) {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(addFeedbackToList);
  }

  getFeedbackList() {
    this.spinner.show();
    const formValues = this.feedbackList.getRawValue();
    let body = {
      ...formValues,
      locationIds: this.locArr
    };

    const feedbackSub = this.helpService.getFeedbackList(body).subscribe((res) => {
      if (res.statusCode === 200) {
        this._items$.next(res.data.reports);
        this.totalFeed = res.data.totalCount;
        this.pageSizeMoreOptions = [5, 10, 50, 100];
        if (!this.pageSizeMoreOptions.includes(this.totalFeed)) {
          this.pageSizeMoreOptions.push(this.totalFeed)
        }
        if (this.totalFeed < 5) {
          this.pageSizeMoreOptions = [5, 10];
        }
        this.spinner.hide();
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(feedbackSub);
  }

  fetchAllCustomers() {
    this.spinner.show();

    let apiCalled = false;
    const customersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
      if (customers.length || apiCalled) {
        this.allCustomers = customers;
        console.log(this.allCustomers)
        // this.getFeedbackList();
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchCustomerService.getAllCustomers(false, false);
      }
    })
    this.unsubscribe.push(customersSub);
  }
  onSearchByValueChange() {
    this.searchFilter = true;
    const { pageNumber, searchBy } = this.feedbackList.controls;
    pageNumber.patchValue(1);
    this.getFeedbackList()
  }
  // searchReset() {
  //   this.searchFilter = false;
  //   this.feedList();
  //   this.feedbackList.controls.searchBy.patchValue("");
  //   this.fetchAllCustomers();
  // }

  searchReset() {
    this.searchFilter = false;
  
    // Reset form values instead of reinitializing the form
    this.feedbackList.reset({
      sortByColumn: '',
      sortAscendingOrder: true,
      searchBy: '',
      pageNumber: 1,
      pageSize: 10,
      custGroupId: 0,
      locationIds: [],
      startDate: null,
      endDate: null
    });
  
    // Ensure the UI updates
    this.feedbackList.markAsPristine();
    this.feedbackList.markAsUntouched();
  
    // Stop the loader and fetch new data
    this.spinner.hide(); // Ensure loader stops
    this.getFeedbackList();
  }
  

  paginator(event: any) {
    const { pageSize, pageNumber } = this.feedbackList.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);
    this.getFeedbackList()
    //this.fetchData()
  }
}
