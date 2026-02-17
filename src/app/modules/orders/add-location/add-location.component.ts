import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { FetchCountriesService } from 'src/app/shared/services/fetch-countries.service';
import { FetchLocationTypesService } from 'src/app/shared/services/fetch-location-types.service';
import { RegexService } from 'src/app/shared/services/regex.service';
import { StatesService } from 'src/app/shared/services/states.service';
import { CustomersService } from '../../customers/customers.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent implements OnInit, OnDestroy {
  public roleEnum = Roles;
  loggedInUserRole: Roles;
  allStates: any[] = [];
  allCities: any[] = [{ id: 1, name: "CQ28" }];
  allTypes: any[] = [];
  allCountries: any[] = [];
  customerNameFromList: any;
  customerNumberFromList: any;
  addLocationForm: FormGroup;
  locationId: number | string = this.activatedRoute?.snapshot?.params?.id;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  savedLocationDetails: any = {};
  customerId: number = this.activatedRoute?.snapshot?.queryParams?.customerId;
  customerName: number = this.activatedRoute?.snapshot?.queryParams?.customerName;
  customerNumber: number = this.activatedRoute?.snapshot?.queryParams?.customerNumber;
  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private customersService: CustomersService,
    private regexService: RegexService,
    private statesService: StatesService,
    private countriesService: FetchCountriesService,
    private authService: AuthService,
    private locationTypeService: FetchLocationTypesService,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    if([this.roleEnum.customerAdmin,this.roleEnum.customerManager].includes(this.loggedInUserRole)){
      this.customerId=this.authService?.getUserFromLocalStorage()?.data?.custGroupId || 0;
    }
    this.initForm();
    this.fetchAllCountries();

    this.customerNameFromList = this.dataSharingService.data['customerName'];
    this.customerNumberFromList = this.dataSharingService.data['customerNumber'];
    if ([this.roleEnum.consignAdmin, this.roleEnum.customerAdmin, this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      this.addLocationForm.controls.locationTypeId.patchValue(2)
      this.addLocationForm.controls.locationTypeId.disable()
    }
    // this.fetchQuiltTypes();

    // if (["edit-location"].includes(this.componentAccessFor)) {
    //   this.getLocationDetailsById();
    // }
  }

  initForm() {
    this.addLocationForm = this.fb.group({
      id: 0,
      customerId: "",
      name: ["", [Validators.required]],
      nickName: [""],
      locationTypeId: ["", [Validators.required]],
      address: ["", [Validators.required]],
      city: ["", [Validators.required]],
      stateId: ["", [Validators.required]],
      zip: ["", [Validators.required]],
      phoneNumber: ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.regexService.allPhoneNumber)]],
      countryId: ["", [Validators.required]],
      latitude: [null],
      Longitude: [null],
      locationPartyModel: this.fb.group({
        name: [""],
        phoneNumber: ["", [Validators.maxLength(15), Validators.pattern(this.regexService.allPhoneNumber)]]
      }),
      customerGroupId:this.customerId
    });
  }

  getLocationDetailsById() {
    this.spinner.show();
    const locationDetailstSub = this.customersService.getLocationDetailsById(+this.locationId).subscribe(res => {
      // this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedLocationDetails = res?.data;
        console.log(this.savedLocationDetails)
        this.patchFormvalues();
        if (!this.allStates.length) {
          this.fetchAllStates(res?.data?.countryId);
        } else {
          this.spinner.hide();
        }
      } else {
        this.navigateToLocationsListing();
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(locationDetailstSub);
    this.enableEditLocationFields();
  }
  // getAddressCoOrdinates(){
  //   this.customersService.getLocation($event.source.triggerValue).subscribe(
  //     response => {
  //       if (response.status === 'OK' && response.results?.length) {
  //         const location = response.results[0];
  //         const loc: any = location.geometry.location;        
  //       } 
  //     },
  //     (err: HttpErrorResponse) => {
  //       console.error('geocoder error', err);
  //     }
  //   );
  // }
  enableEditLocationFields() {
    const addLocationForm = this.addLocationForm;
    // addLocationForm.disable();
    // const { company, phoneNumber, email, firstName, lastName, location, roleId } = addLocationForm.controls;

    // addLocationForm.enable();
    // email.disable();
    // roleId.disable();

    // addLocationForm.controls..enable();
  }

  resetState(countryId: number) {
    this.addLocationForm.controls.stateId.reset("");
    this.fetchAllStates(countryId, false);
  }

  patchFormvalues() {
    const locationDetails = this.savedLocationDetails || {};

    if (!!locationDetails) {
      this.addLocationForm.patchValue(locationDetails);
      this.addLocationForm.markAsPristine();
      this.toggleNickNameField();
      this.cd.detectChanges();
    }
  }

  toggleNickNameField() {
    if ([this.roleEnum.masterAdmin,this.roleEnum.customerAdmin,this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      this.addLocationForm.controls['nickName'].enable();  
    } else {
      this.addLocationForm.controls['nickName'].disable(); 
    }
  }

  // fetchAllStates() {
  //   let apiCalled = false;
  //   this.statesService.allStates.subscribe((states) => {
  //     if (states.length || apiCalled) {
  //       this.allStates = states
  //     } else if (!apiCalled) {
  //       apiCalled = true;
  //       this.statesService.getAllStates()
  //     }
  //   })
  // }

  fetchQuiltTypes() {
    let apiCalled = false;
    const quiltTypesOption = this.locationTypeService.locationType.subscribe((types) => {
      if (types.length || apiCalled) {
        this.allTypes = types;
        if (this.componentAccessFor.includes("edit-location")) {
          this.getLocationDetailsById();
        } else {
          this.spinner.hide();
        }
      }
      else if (!apiCalled) {
        apiCalled = true;
        this.locationTypeService.getAllLocationTypes()
      }
    })
    this.unsubscribe.push(quiltTypesOption);
  }

  fetchAllCountries() {
    this.spinner.show();
    let apiCalled = false;
    const userRolesSub = this.countriesService.allCountries.subscribe((countries) => {
      if (countries.length || apiCalled) {
        this.allCountries = countries;
        this.fetchQuiltTypes();

        //   if (this.componentAccessFor.includes("edit-location")) {
        //     this.getLocationDetailsById();
        //   }else{
        //     this.spinner.hide();
        //   }
      }
      else if (!apiCalled) {
        apiCalled = true;
        this.countriesService.getAllCountries();
      }
    })
    this.unsubscribe.push(userRolesSub);
  }


  fetchAllStates(countryId: number, patchForm: boolean = true) {
    this.spinner.show();

    const locationDetailstSub = this.statesService.getAllStates(+countryId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.allStates = res?.data;
        if (!!patchForm) {
          this.patchFormvalues();
        }
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationDetailstSub);

  }


  navigateToLocationsListing() {
    this.router.navigate(["orders", "view-orders", this.customerId], {
      queryParams: {
        tab: "locations",
        customerName: this.customerName,
        customerNumber: this.customerNumber
      }
    });
  }

  resetForm() {
    const addLocationForm = this.addLocationForm;

    if (!addLocationForm.pristine) {
      if (this.componentAccessFor === "add-location") {
        addLocationForm.reset({ id: 0, isPreferred: true });
        this.allStates = [];
      } else {
        const { stateId, countryId } = this.savedLocationDetails || {};

        if (addLocationForm?.getRawValue()?.stateId !== stateId) {
          this.fetchAllStates(countryId);
        } else {
          this.patchFormvalues();
        }
      }
    }
  }

  addLocation() {
    const addLocationForm = this.addLocationForm;
    if (addLocationForm.invalid) {
      addLocationForm.markAllAsTouched();
    } else if (!this.addLocationForm.pristine) {
      this.callAddLocationApi();
    }
  }
  getFullAddress(): string {
    let address: string = '';
    let state = this.allStates.find(m => m.id == this.addLocationForm.controls['stateId'].value);
    let country = this.allStates.find(m => m.id == this.addLocationForm.controls['countryId'].value);
    address = `${this.addLocationForm.controls['address'].value} ${this.addLocationForm.controls['city'].value}`;
    if (state && state != '') {
      address = `${address} ${state}`;
    }
    if (country && country != '') {
      address = `${address} ${country}`;
    }
    return address;
  }
  callAddLocationApi() {
    this.spinner.show();
    this.addLocationForm.controls.customerGroupId.patchValue(+this.customerId);


    this.customersService.getLocation(this.getFullAddress()).subscribe(
      (response: any) => {
        debugger;
        if (response.status === 'OK' && response.results?.length) {
          const location = response.results[0];
          const loc: any = location.geometry.location;
          this.addLocationForm.controls['latitude'].setValue(loc.lat);
          this.addLocationForm.controls['Longitude'].setValue(loc.lng);
          //loc.lat, loc.lng      
        }
        const addLocationSub = this.customersService.addLocation(this.addLocationForm.getRawValue())
          .subscribe((res: any) => {
            if (res.statusCode === 200 || res.statusCode === 201) {
              if (this.componentAccessFor === "add-location" || this.componentAccessFor === "edit-location") {
                this.spinner.hide();
                this.navigateToLocationsListing();
              } else {
                this.getLocationDetailsById();
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
        this.unsubscribe.push(addLocationSub);
      }
    );

  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }


}
