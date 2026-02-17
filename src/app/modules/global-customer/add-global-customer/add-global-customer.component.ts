import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, Observable, startWith, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { GlobalCustomerService } from '../global-customer.service'
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';

@Component({
  selector: 'app-add-global-customer',
  templateUrl: './add-global-customer.component.html',
  styleUrls: ['./add-global-customer.component.scss']
})
export class AddGlobalCustomerComponent implements OnInit {
  addCustomerList: FormGroup;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  custId: number | string = this.activatedRoute?.snapshot?.params?.id;
  private unsubscribe: Subscription[] = [];
  allCustomers: any[] = [];
  selectedCompaniesId: number[] = [] || null;
  savedCustListDetails: any = {};
  searchText: string = undefined;
  constructor(
    private globalCustomerService: GlobalCustomerService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private fetchCustomerService: FetchCustomersService
  ) { }

  
  ngOnInit(): void {
    this.initForm();
    this.fetchAllCustomers();
    if (this.componentAccessFor !== "add-global-customer") {
      this.getListDetailsById()
    }

  }
  initForm() {
    this.addCustomerList = this.fb.group({
      id: 0,
      custGroupName: "",
      custGroupIds: this.selectedCompaniesId
    });
  }
  resetForm() {
    const addCustomerList = this.addCustomerList;
    if (!addCustomerList.pristine) {
      if (this.componentAccessFor === "add-global-customer") {
        this.initForm();
        this.fetchAllCustomers();
      } else {
        this.getListDetailsById()
      }
    }
  }

  fetchAllCustomers() {
    this.spinner.show();

    // first we Reset the allCustomers BehaviorSubject so that no old data is retained
    this.fetchCustomerService.allCustomers.next([]);

    let apiCalled = false;
    const customersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
      if (customers.length || apiCalled) {
        this.allCustomers = customers;
      } else if (!apiCalled) {
        apiCalled = true;
        // if (this.componentAccessFor !== "add-global-customer") {
        //   this.fetchCustomerService.getAllCustomersInGlobalCustomer(false, false);

        // } else {
        //   this.fetchCustomerService.getAllCustomersInGlobalCustomer(false, true);
        // }
        // const customGroupRequired = (this.componentAccessFor === "add-global-customer");
        // console.log(customGroupRequired)
        this.fetchCustomerService.getAllCustomersInGlobalCustomer(true);
      }
    })
    this.spinner.hide();
    this.unsubscribe.push(customersSub);
  }

  getListDetailsById() {
    debugger
    this.spinner.show();
    const listDetailstSub = this.globalCustomerService.getCustGroupDetailsById(+this.custId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedCustListDetails = res?.data;
        this.patchFormvalues();
      } else {
        this.router.navigate(["global-customer"]);
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(listDetailstSub);
  }

  patchFormvalues() {
    const listDetails = this.savedCustListDetails || {};
    if (!!listDetails) {
      const groupMembers: any[] = listDetails?.customerList;
      if (groupMembers?.length) {
        groupMembers.forEach(member => this.selectedCompaniesId.push(member?.id));
      }
      this.addCustomerList.controls.custGroupName.patchValue(listDetails?.name)
      this.addCustomerList.controls.custGroupIds.setValue(this.selectedCompaniesId)
      this.addCustomerList.markAsPristine();
      this.cd.detectChanges();
    }
  }

  addGlobalList() {
    this.spinner.show();

    const body: any = {
      ...this.addCustomerList.getRawValue(),
      id: this.componentAccessFor !== "add-global-customer" ? +this.savedCustListDetails.id : 0
    };
    // debugger
    const addListSub = this.globalCustomerService.addGlobalCustomer(body)
      .subscribe((res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.selectedCompaniesId = [];
          if (this.componentAccessFor === "add-global-customer") {
            this.spinner.hide();
            this.router.navigate(["global-customer"]);
          } else {
            this.getCustomerDetailsById();
            this.router.navigate(["global-customer"]);
          }
          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res?.message) {
            this.toastrService.error(res.message);
          }
        }
      });
    this.unsubscribe.push(addListSub);

  }
  getCustomerDetailsById() {

  }

}
