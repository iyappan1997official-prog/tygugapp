import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { InventoryService } from 'src/app/modules/inventory/inventory.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';

@Component({
  selector: 'app-filter-by-company',
  templateUrl: './filter-by-company.component.html',
  styleUrls: ['./filter-by-company.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterByCompanyComponent implements OnInit {
  // @Input() companies: any[] =[];
  @Output() passCustomerId: EventEmitter<any> = new EventEmitter()
  @Input() tab: string;
  private unsubscribe: Subscription[] = [];
  allCustomers: any[] = [];
  customerName: any[] = [];
  customerId: any[] = [];
  quiltsMovementForm: FormGroup;
  public roleEnum = Roles;
  loggedInUserRole: Roles;
  constructor(
    public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private fetchCustomerService: FetchCustomersService,
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.initForm();
    this.fetchAllCustomers();
    console.log(this.tab, this.tab === 'consignment' || !this.tab);

  }

  initForm() {
    this.quiltsMovementForm = this.fb.group({
      searchBy: "",
      checkbox: ""
    })
  }

  fetchConsignedCustomer() {
    this.spinner.show();
    let apiCalled = false;
    const allCustomersSub = this.inventoryService.getLocationForConsign().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.allCustomers = res?.data
      }
    })

    this.unsubscribe.push(allCustomersSub);
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

  toggle(id: number, customerName: any) {
    if (!this.customerId.includes(id) && !this.customerName.includes(customerName)) {
      this.customerId.push(id);
      this.customerName.push(customerName)
      // this.customerName = customerName; 
    }
    else {
      let selectedIndex = this.customerId.findIndex(customerId => customerId === id);
      this.customerId.splice(selectedIndex, 1);
      let selectedName = this.customerName.findIndex(customerName => customerName === customerName);
      this.customerName.splice(selectedName, 1);
    }

  }



  applyFilter() {
    //  this.companies = this.customerId;
    // this.onSearchByValueChange();
    // if (this.quiltsMovementForm.invalid) {
    //   this.quiltsMovementForm.markAllAsTouched();
    // } else {
    //   this.modal.close(this.quiltsMovementForm.getRawValue());
    // }

    //  this.onSearchByValueChange();
    //  this.companies = this.customerId;
    //  console.log("comapny",this.companies, "cust", this.customerId);
    const details = { customerId: this.customerId, searchBy: this.quiltsMovementForm.controls.searchBy.value, customerName: this.customerName }
    this.modal.close(details);

  }

  resetFunction() {
    this.quiltsMovementForm.reset();


  }


}
