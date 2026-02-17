import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-add-locations',
  templateUrl: './add-locations.component.html',
  styleUrls: ['./add-locations.component.scss']
})
export class AddLocationsComponent implements OnInit, OnDestroy {

  allStates: any[] = [];
  allCities: any[] = [{ id: 1, name: "CQ28" }];
  allTypes: any[] = [];
  allCountries: any[] = [];
  allCompanyRegions: any[] = [];

  addLocationForm: FormGroup;
  locationId: number | string = this.activatedRoute?.snapshot?.params?.id;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  savedLocationDetails: any = {};
  customerId: number = this.activatedRoute?.snapshot?.queryParams?.customerId;
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
    private usersService: UsersService,
    private countriesService: FetchCountriesService,
    private locationTypeService: FetchLocationTypesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchAllCountries();
    this.getCompanyRegions()
    this.addLocationForm.controls.locationTypeId.patchValue(4)
    this.addLocationForm.controls.locationTypeId.disable()
  }
  initForm() {
    this.addLocationForm = this.fb.group({
      id: 0,
      customerId: "",
      name: ["", [Validators.required]],
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
      // regionId: ["", [Validators.required]]
    });
  }
  getLocationDetailsById() {
    this.spinner.show();
    const locationDetailstSub = this.customersService.getLocationDetailsById(+this.locationId).subscribe(res => {
      // this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedLocationDetails = res?.data;
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
      this.cd.detectChanges();
    }
  }

  getCompanyRegions() {
    this.spinner.show()
    const companyNames = this.usersService.getCompaniesRegion().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCompanyRegions = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(companyNames);
  }

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
    this.router.navigate(["location"])
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
    this.addLocationForm.controls.customerId.patchValue(+this.customerId);


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
