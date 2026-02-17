import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { FetchCountriesService } from 'src/app/shared/services/fetch-countries.service';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { FetchOrderStatusService } from 'src/app/shared/services/fetch-order-status.service';
import { RegexService } from 'src/app/shared/services/regex.service';
import { StatesService } from 'src/app/shared/services/states.service';
import { CustomersService } from '../customers.service';

@Component({
  selector: 'add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent implements OnInit {
  private unsubscribe: Subscription[] = [];
  addCustomerForm: FormGroup;
  componentAccessFor: string = this.activatedRoute?.snapshot?.routeConfig?.path;
  savedUserDetails: any = {};
  customerId: number | string = this.activatedRoute?.snapshot?.params?.id;
  epicorCustomer: string = "";
  allStates: any[] = [];
  allOrderStatus: any[] = [
    { id: 1, name: "Open" }, { id: 2, name: "Partially Shipped" }, { id: 3, name: "Active" }, { id: 4, name: "Closed" }
  ];
  allCountries: any[] = [];
  allCustomerType: any[] = [];

  orderTypes: any[] = [
    { id: 1, name: "Leased" },
    { id: 2, name: "Purchased" },
  ];

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private fetchCustomerService: FetchCustomersService,
    private regexService: RegexService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private statesService: StatesService,
    private orderStatusService: FetchOrderStatusService,
    private countriesService: FetchCountriesService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.addCustomerForm = this.fb.group({
      id: 0,
      customerNumber: ["", [Validators.required]],
      name: ["", [Validators.required]],
      phoneNumber: ["", [ Validators.maxLength(15), Validators.pattern(this.regexService.allPhoneNumber)]],
      cityName: ["", [Validators.required]],
      stateId: ["", [Validators.required]],
      countryId: ["", [Validators.required]],
      specialCustomer: [false, [Validators.required]],
      eol: [0],
      message: [""],
      allowReverse: [false],
      customerTypeId: [2, [Validators.required]],
      isProtectedShipment: [false],
    });

    this.addCustomerForm.get('specialCustomer').valueChanges.subscribe(val => {
      if (val) {
        this.addCustomerForm.controls['eol'].setValidators([Validators.required]);
      } else {
        this.addCustomerForm.controls['eol'].clearValidators();
      }
      this.addCustomerForm.controls['eol'].updateValueAndValidity();
    });
    this.fetchAllCountries();
  }

  

  fetchAllCountries() {
    this.spinner.show();
    let apiCalled = false;
    const userRolesSub = this.countriesService.allCountries.subscribe((countries) => {
      if (countries.length || apiCalled) {
        this.allCountries = countries;
        this.getCustomerType()

        if (this.componentAccessFor.includes("edit-customer")) {
          this.getCustomerById();
          this.enableEditUserFields();
        } else {
          this.spinner.hide();
        }
        this.addCustomerForm.controls.customerTypeId.value === 0 ? this.addCustomerForm.controls.customerTypeId.patchValue(2) : this.addCustomerForm.controls.customerTypeId.patchValue(this.savedUserDetails.customerTypeId)
      } else if (!apiCalled) {
        apiCalled = true;
        this.countriesService.getAllCountries();
      }
    })
    this.unsubscribe.push(userRolesSub);
  }

  getSelectedCountryName(): string {
    const selectedCountry = this.allCountries.find(country => country.id === this.addCustomerForm.get('countryId').value);
    return selectedCountry ? selectedCountry.name : '';
  }
  


  handleRouting() {
    if (this.componentAccessFor === "add-customer") {
      this.router.navigate(["/customers"]);
    } else {
      this.router.navigate(["/orders/view-orders", this.customerId], {
        queryParams: {
          tab: "orders"
        }
      });
    }
  }

  fetchAllStates(countryId: number, patchForm: boolean = true) {
    this.spinner.show();

    const customerDetailstSub = this.statesService.getAllStates(+countryId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.allStates = res?.data;

        if (!!patchForm) {
          this.enableEditUserFields()
          this.patchFormvalues();
        }
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(customerDetailstSub);

  }

  getSelectedStateName(): string {
    const selectedState = this.allStates.find(state => state.id === this.addCustomerForm.get('stateId').value);
    return selectedState ? selectedState.name : '';
  }

  resetState(countryId: number) {
    this.addCustomerForm.controls.stateId.reset("");
    this.fetchAllStates(countryId, false);
  }

  fetchOrderStatus() {
    let apiCalled = false;
    this.orderStatusService.orderStatus.subscribe((status) => {
      if (status.length || apiCalled) {
        this.allStates = status
      } else if (!apiCalled) {
        apiCalled = true;
        this.orderStatusService.getAllStatus()
      }
    })
  }

  getCustomerType() {
    this.spinner.show();
    const customerDetailstSub = this.customersService.getCustomerType().subscribe(res => {
      if (res.statusCode == 200) {
        this.allCustomerType = res.data
        this.spinner.hide();
      } else {
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(customerDetailstSub);
  }

  getCustomerById() {
    this.spinner.show();
    const customerDetailstSub = this.customersService.getCustomerDetailsById(+this.customerId).subscribe(res => {
      if (res.statusCode == 200) {
        this.savedUserDetails = res?.data;
        if (!this.allStates.length) {
          this.fetchAllStates(res?.data?.countryId);
        } else {
          this.spinner.hide();
        }
      } else {
        this.router.navigate(["customers"]);
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(customerDetailstSub);
  }

  patchFormvalues() {
    const customerDetails = this.savedUserDetails || {};
    const addCustomerForm = this.addCustomerForm;

    if (!!customerDetails) {
      addCustomerForm.patchValue(customerDetails);
      if(customerDetails.isCustom){
        this.addCustomerForm.controls["customerNumber"].disable();
        this.addCustomerForm.controls["name"].disable();
        this.addCustomerForm.controls["phoneNumber"].disable();
        this.addCustomerForm.controls["cityName"].disable();
        this.addCustomerForm.controls["stateId"].disable();
        this.addCustomerForm.controls["countryId"].disable();
      }
      addCustomerForm.markAsPristine();
      this.cd.detectChanges();
    }
  }

  enableEditUserFields() {
    const addCustomerForm = this.addCustomerForm;
    const { eol, message, customerTypeId, specialCustomer } = addCustomerForm.controls
    // console.log(this.savedUserDetails);


    if (this.savedUserDetails.isEpicoreIntegrated) {
      addCustomerForm.disable();
      eol.enable()
      message.enable()
      customerTypeId.enable();
      specialCustomer.enable()
    } else {
      addCustomerForm.enable();
    }
  }

  resetForm() {
    const addCustomerForm = this.addCustomerForm;

    if (!addCustomerForm.pristine) {
      if (this.componentAccessFor === "add-customer") {
        addCustomerForm.reset({ id: 0 });
        this.allStates = [];
      } else {
        const { stateId, countryId } = this.savedUserDetails || {};

        if (addCustomerForm?.getRawValue()?.stateId !== stateId) {
          this.fetchAllStates(countryId);
        } else {
          this.patchFormvalues();
        }
      }
    }
  }

  addCustomer() {
    const addCustomerForm = this.addCustomerForm;
    if (addCustomerForm.invalid) {
      addCustomerForm.markAllAsTouched();
    } else if (!this.addCustomerForm.pristine) {
      this.callAddCustomerApi();
    }
  }

  callAddCustomerApi() {
    this.spinner.show();

    const formValues = this.addCustomerForm.getRawValue();

    let body = {
      ...formValues,
    };


    const addCustomerSub = this.customersService.addCustomer(body)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.fetchCustomerService.allCustomers.next([]);
          this.addCustomerForm.markAsPristine();

          // if (this.componentAccessFor === "add-customer") {
          this.router.navigate(["customers"]);
          // } else {
          //   this.getCustomerById();
          // }
          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else if (res?.message) {
          this.toastrService.error(res.message);
        }
      });
    this.unsubscribe.push(addCustomerSub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
