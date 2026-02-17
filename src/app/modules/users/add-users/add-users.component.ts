import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { FetchUserRolesService } from 'src/app/shared/services/fetch-user-roles.service';
import { RegexService } from 'src/app/shared/services/regex.service';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../users.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { ShipmentsService } from '../../shipments/shipments.service';
import { ReportsService } from '../../reports/reports.service';

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;
  addUserForm: FormGroup;
  passwordVisible = false;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  savedUserDetails: any = {};
  userId: number | string = this.activatedRoute?.snapshot?.params?.id;
  loggedInUserDetails: any = {};
  loggedInUserRole: Roles;
  allUserRoles: any[] = [];
  allCustomers: any[] = [];
  alllocations: any[] = [];
  selectedCompaniesId: number[] = [];
  allCompanyRegions: any[] = [];
  allCompanyGroups: any[] = [];
  roleIdSelect: number = 0;
  roleId: number = 0;
  loggedLocation: number;
  loggedRegion: number
  custGroupIdForCustomer: number;
  isCustomGroupRequired : boolean = true;
  isCustomerLocationsRequired:boolean=false;
  // selectedCompaniesforConsign = new FormControl();
  constructor(
    private fb: FormBuilder,
    private userRolesService: FetchUserRolesService,
    private regexService: RegexService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private reportService: ReportsService,
    private router: Router,
    private authService: AuthService,
    private fetchCustomerService: FetchCustomersService,
    private shipmentsService: ShipmentsService,
  ) { }

  ngOnInit(): void {
    this.loggedInUserDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.loggedLocation = this.authService?.getUserFromLocalStorage()?.data?.locationId || null
    this.loggedRegion = this.authService?.getUserFromLocalStorage()?.data?.regionId || null
    this.spinner.show();
    this.initForm();
    // this.addUserForm.controls.password
if(this.loggedInUserRole !== this.roleEnum.serviceManager && this.loggedInUserRole !== this.roleEnum.consignManager
  && this.loggedInUserRole !== this.roleEnum.customerManager)
{
  this.fetchUserRolesService();
}

    if (this.loggedInUserRole === this.roleEnum.masterAdmin) {
      this.fetchAllCustomers();
    } else if (this.loggedInUserRole === this.roleEnum.globalAdmin) {
      this.custGroupIdForCustomer = this.authService?.getUserFromLocalStorage()?.data?.custGroupId || "";
      // this.fetchAllCustGroups()
    }
    if (this.componentAccessFor === "add-user") {
      this.getLocations(this.loggedInUserDetails?.companyId);
    } else {
      this.getUserDetailsById();
    }


    const password = this.addUserForm.controls.password;
    password.setValidators([Validators.pattern(this.regexService.passwordPattern)]);
    password.updateValueAndValidity();
    if (this.componentAccessFor === "add-user") {
      password.setValidators([Validators.required, Validators.pattern(this.regexService.passwordPattern)]);
      password.updateValueAndValidity();
    }

    if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
      this.checkForCompanyAdmin();
    } else if (this.loggedInUserRole === this.roleEnum.customerManager) {
      this.checkForCustomerManager();
    } else if (this.loggedInUserRole === this.roleEnum.consignManager) {
      this.checkForConsignUser();
    } else if ([this.roleEnum.consignAdmin].includes(this.loggedInUserRole)) {
      this.checkForConsignAdmin();
      this.getConsignedCustomers()
    } else if ([this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      this.checkForServiceUser();
    } 
  }

  checkForCompanyAdmin() {
    const { roleId, locationId, companyId,custGroupId } = this.addUserForm.controls;

    // roleId.patchValue(4);
    roleId.clearValidators();
    roleId.updateValueAndValidity();
    custGroupId.patchValue(this.loggedInUserDetails?.custGroupId);
    // companyId.patchValue(this.loggedInUserDetails?.companyId);
    companyId.clearValidators();
    companyId.updateValueAndValidity();

    locationId.setValidators(Validators.required);
    locationId.updateValueAndValidity();
  }

  checkForServiceUser() {
    const { roleId, locationId, companyId, regionId } = this.addUserForm.controls;

    roleId.patchValue(10);
    roleId.clearValidators();
    roleId.updateValueAndValidity();
    companyId.patchValue(0);
    companyId.clearValidators();
    companyId.updateValueAndValidity();
    locationId.patchValue(this.loggedLocation)
    locationId.clearValidators();
    locationId.updateValueAndValidity();
    regionId.patchValue(this.loggedRegion)
    regionId.setValidators(Validators.required);
    regionId.updateValueAndValidity();
  }
  checkForCustomerManager() {
    const { roleId, locationId, companyId, regionId,custGroupId } = this.addUserForm.controls;
    regionId.patchValue(this.loggedRegion)
    roleId.patchValue(5);
    roleId.clearValidators();
    roleId.updateValueAndValidity();
    custGroupId.patchValue(this.loggedInUserDetails?.custGroupId);
    companyId.patchValue(this.loggedInUserDetails?.companyId);
    companyId.clearValidators();
    companyId.updateValueAndValidity();
    locationId.patchValue(this.loggedLocation)
    locationId.clearValidators();
    locationId.updateValueAndValidity();
  }
  checkForConsignUser() {
    const { roleId, locationId, companyId, regionId } = this.addUserForm.controls;

    regionId.patchValue(this.loggedRegion)
    roleId.patchValue(8);
    roleId.clearValidators();
    roleId.updateValueAndValidity();
    companyId.patchValue(this.loggedInUserDetails?.companyId);
    companyId.clearValidators();
    companyId.updateValueAndValidity();
    locationId.patchValue(this.loggedLocation)
    locationId.clearValidators();
    locationId.updateValueAndValidity();
  }

  checkForConsignAdmin() {
    const { locationId, companyId } = this.addUserForm.controls;

    companyId.setValue(0);
    companyId.clearValidators();
    companyId.updateValueAndValidity();

    locationId.setValidators(Validators.required);
    locationId.updateValueAndValidity();
  }
  checkForGlobalCustomer() {
    const { custGroupId } = this.addUserForm.controls;
    custGroupId.setValidators(Validators.required);
    custGroupId.updateValueAndValidity();
  }
  get passwordFieldAsFormControl() {
    return this.addUserForm.controls.password as FormControl;
  }

  initForm() {
    this.addUserForm = this.fb.group({
      id: 0,
      companyId: 0,
      roleId: ["", [Validators.required]],
      roleName:'',
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.pattern(this.regexService.email)]],
      phoneNumber: ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.regexService.allPhoneNumber)]],
      locationId: '',
      regionId: '',
      customerIds: this.selectedCompaniesId,
      password: ["", [Validators.maxLength(25)]],
      custGroupId: [0]
    });
    // this.addUserForm.controls["roleId"].valueChanges.subscribe(m=>{
    //   debugger
    // })
    this.addUserForm.controls["custGroupId"].valueChanges.subscribe(m=>{
      // if(this.isCustomerLocationsRequired){
      this.getLocationsByCustGroup(m);
      // }else{

      // }
    })
  }

  getUserDetailsById() {
    this.spinner.show();
    const userDetailstSub = this.usersService.getUserDetailsById(+this.userId).subscribe(res => {
      if (res.statusCode == 200) {
        this.addUserForm.controls['password'].clearValidators();
        this.savedUserDetails = res?.data;
        // this.getCompanyRegions();
        const { roleId, company, regionId, companyId, custGroupId,role } = this.savedUserDetails;
        this.roleIdSelect = roleId
        if ([this.roleEnum.masterAdmin].includes(this.loggedInUserRole) && [1, 2].includes(roleId) && !this.addUserForm.touched) {
          this.getAllLocations();
          this.roleId = roleId;
        }
        // if ([3, 4, 5].includes(roleId)) {
        //   this.getLocations(company.id, true);
        //   if ([3].includes(roleId)) {
        //     this.getCustomerByCompany(regionId, false)
        //   }
        // } else {
          // if ([7, 8].includes(roleId)) {
          //   this.getLocations(company.id);
          //   this.getCompanyGroups();
          //   custGroupId.setValidators(Validators.required)
          // }
          if ([9, 10].includes(roleId)) {
            this.getLocationsByLocationType(4)
            this.roleId = roleId;
          }
          this.patchFormvalues();
          if ([3, 4, 7, 8, 11].includes(roleId)) {
            if(this.roleEnum.globalAdmin==role){
              this.isCustomGroupRequired=false;
            }
            this.getCompanyGroups();
            // custGroupId.setValidators(Validators.required)
          }
          this.spinner.hide();
        // }
      } else {
        this.router.navigate(["users"]);
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(userDetailstSub);
    this.enableEditUserFields();
  }

  getConsignedCustomers() {
    this.spinner.show()
    const customerDrop = this.shipmentsService.getConsignedCustomers().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomers = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(customerDrop);

  }

  enableEditUserFields() {
    const addUserForm = this.addUserForm;
    const { email, roleId, companyId, locationId, regionId, password } = addUserForm.controls;
    addUserForm.enable();
    email.disable();
    roleId.disable();
    password.disable()
    if (![this.roleEnum.masterAdmin].includes(this.loggedInUserRole)) {
      regionId.disable();
      // companyId.disable();
      locationId.disable();
    } else {
      roleId.enable();
    }
    if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      regionId.enable()
      companyId.enable();
      locationId.enable();
    }
    if ([this.roleEnum.consignAdmin].includes(this.loggedInUserRole)) {
      companyId.disable();
      locationId.enable();
    }
    if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
      locationId.enable();
    }
  }

  patchFormvalues() {
    const userDetails = this.savedUserDetails || {};
    const addUserForm = this.addUserForm;
    if (!!userDetails) {
      addUserForm.patchValue({ ...userDetails });
      console.log(addUserForm);

    }

    this.cd.detectChanges();
  }

  fetchUserRolesService() {
    this.spinner.show();

    let apiCalled = false;
    const userRolesSub = this.userRolesService.allUserRoles.subscribe((userRoles) => {
      if (userRoles.length || apiCalled) {
        this.allUserRoles = userRoles;
        this.spinner.hide();
      } else if (!apiCalled) {
        apiCalled = true;
        this.userRolesService.getAllRoles();
      }
    })
    this.unsubscribe.push(userRolesSub);
  }

  fetchAllCustGroups() {
    this.spinner.show();
    let apiCalled = false;
    const customersSub = this.reportService.getCustomersByGroup(+this.custGroupIdForCustomer).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomers = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(customersSub);
  }

  fetchAllCustomers() {
    this.spinner.show();

    let apiCalled = false;
    const customersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
      if (customers.length || apiCalled) {
        if ([this.roleEnum.consignAdmin].includes(this.loggedInUserRole)) {
          for (let i = 0; i < customers.length; i++) {
            if (customers[i].isConsignedCustomer) {
              this.allCustomers.push(this.allCustomers[i])
            }
          }
        } else {
          this.allCustomers = customers;
        }
        this.fetchUserRolesService();
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchCustomerService.getAllCustomers(false, false);
      }
    })
    this.unsubscribe.push(customersSub);
  }

  getLocationsById(id: number) {
    this.addUserForm.controls.locationId.patchValue("");
    // if (this.addUserForm.getRawValue().roleId === 4) {
    this.getLocations(id);
    // }
  }
  // companyArr(id: any) {
  //   console.log(id);

  // }
  getLocations(id: number, patchValues?: boolean) {
    this.spinner.show();
    let locationType = 0;
    if ([7, 8].includes(this.roleIdSelect)) {
      locationType = 3
    } else if ([9, 10].includes(this.roleIdSelect)) {
      locationType = 4
    } else if ([3, 4, 5].includes(this.roleIdSelect)) {
      locationType = 2
    }
    const locationSub = this.usersService.getLocationsByCustomerId(+id, +locationType).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.alllocations = res?.data?.sort((a: any, b: any) => {
          const A = a?.name?.toUpperCase();
          const B = b?.name?.toUpperCase();

          if (A > B) {
            return 1;
          } else if (A < B) {
            return -1;
          } else {
            return 0;
          }
        });

        if (!!patchValues) {
          this.patchFormvalues();
        }
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }
  getLocationsByCustGroup(id: number) {
    this.spinner.show();
    const locationSub = this.usersService.getLocationByCustGroup(+id).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.alllocations = res?.data
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }

  getLocationsByLocationType(id: number) {
    this.spinner.show();
    const locationSub = this.usersService.GetLocationsByLocationTypeId(+id).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.alllocations = res?.data
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }

  // getLocationsByRegion(id: number) {
  //   this.spinner.show();
  //   const locationSub = this.usersService.getLocationByRegion(+id).subscribe(res => {
  //     this.spinner.hide();
  //     if (res.statusCode == 200) {
  //       this.alllocations = res?.data
  //     } else if (res.message) {
  //       this.toastrService.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(locationSub);
  // }
  getAllLocations() {
    this.spinner.show();
    const locationSub = this.usersService.getAllLocations().subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.alllocations = res?.data
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }

  resetForm() {
    if (this.componentAccessFor === "add-user") {
      this.addUserForm.reset({ id: 0 });

      if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
        this.checkForCompanyAdmin();
      }
    } else {
      this.patchFormvalues();
    }
  }

  addUser() {
    const addUserForm = this.addUserForm;
    if (addUserForm.invalid) {
      addUserForm.markAllAsTouched();
    } else if (!this.addUserForm.pristine) {
      this.callAddUserApi();
    }
  }

  callAddUserApi() {
    this.spinner.show();
    const formValues = this.addUserForm.getRawValue();
    let body = {
      ...formValues,
    };
    if(!body.regionId || body.regionId==""){
      body.regionId=0;
    }
    if(!body.locationId || body.locationId==""){
      body.locationId=0;
    }
    const addUserSub = this.usersService.addUser(body)
      .subscribe((res: any) => {
        this.spinner.hide();
        this.addUserForm.markAsPristine();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.usersService.allUsers.next([]);
          this.router.navigate(["users"]);

          let userData = this.authService.getUserFromLocalStorage();
          const { firstName, lastName, locationId, regionId } = res?.data;
          if (res?.data?.id === userData?.data?.userId && userData.data["locationId"] != `${locationId}` && userData.data["regionId"] != `${regionId}`) {
            userData.data["locationId"] = `${locationId}`;
            userData.data["regionId"] = `${regionId}`;
            this.authService.setUserFromLocalStorage(userData);
            this.authService.currentUserSubject.next(userData);
          }
          if (res?.data?.id === userData?.data?.userId && userData.data["userFullName"] != `${firstName} ${lastName}`) {
            userData.data["userFullName"] = `${firstName} ${lastName}`;
            this.authService.setUserFromLocalStorage(userData);
            this.authService.currentUserSubject.next(userData);
          }

          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else if (res?.message) {
          this.toastrService.error(res.message);
        }
      });
    this.unsubscribe.push(addUserSub);
  }

  // regionSelect(id: number) {
  //   const addUserForm = this.addUserForm;
  //   const { companyId, customerIds, locationId } = addUserForm.controls;
  //   companyId.reset();
  //   customerIds.reset();
  //   locationId.reset();
  //   if ([1, 9, 10].includes(this.roleIdSelect) || ([1, 9, 10].includes(this.roleId) && !this.addUserForm.touched)) {
  //     this.getAllLocations();
  //     // this.getLocationsForConsignManager(4)
  //   } else if (([7, 8].includes(this.roleIdSelect) || ([7, 8].includes(this.roleId) && !this.addUserForm.touched)) && [this.roleEnum.consignAdmin].includes(this.loggedInUserRole)) {
  //     this.getCustomerByCompany(id, true)
  //   } else if (([7, 8].includes(this.roleIdSelect) || ([7, 8].includes(this.roleId) && !this.addUserForm.touched))) {
  //     this.getCustomerByCompany(id, true)
  //   } else {
  //     this.getCustomerByCompany(id)
  //   }
  // }

  getCustomerByCompany(id: any, isConsign?: boolean) {
    this.spinner.show()
    const customerNames = this.usersService.getCustomerByCompanyId(id, isConsign).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomers = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(customerNames);
  }


  onRoleChange(event: any) {
    debugger
    const { companyId, locationId, customerIds, regionId, custGroupId } = this.addUserForm.controls;
    let id = event.value;
    let  role= event.source.triggerValue;
    this.addUserForm.controls["roleName"].patchValue(role);
    this.roleIdSelect = id;

    if(this.loggedInUserRole==this.roleEnum.masterAdmin){
      this.allCompanyGroups=[];
      this.alllocations = [];
      custGroupId.reset();
      regionId.reset();
      locationId.reset();
      companyId.reset();
    }
    if([this.roleEnum.consignAdmin,this.roleEnum.customerAdmin, this.roleEnum.globalAdmin].includes(role)){
      locationId.clearValidators();
      locationId.updateValueAndValidity();
    }
    if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      custGroupId.patchValue(this.loggedInUserDetails?.custGroupId);
    }
    // if ([this.roleEnum.serviceManager, this.roleEnum.customerManager,this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
    //   locationId.patchValue(this.loggedLocation);
    // }
    this.isCustomerLocationsRequired=[this.roleEnum.consignManager,this.roleEnum.consignUser,
      this.roleEnum.customerManager,this.roleEnum.customerUser].includes(role);
    if([this.roleEnum.consignAdmin,this.roleEnum.consignManager,this.roleEnum.consignUser,
      this.roleEnum.customerAdmin, this.roleEnum.customerManager,this.roleEnum.customerUser].includes(role)){
      this.isCustomGroupRequired = true;
      this.getCompanyGroups();
      custGroupId.setValidators(Validators.required);
    }
    else if(role== this.roleEnum.globalAdmin){
      this.isCustomGroupRequired = false;
      this.getCompanyGroups();
      custGroupId.setValidators(Validators.required);
    }
    
    // if ([this.roleEnum.consignAdmin,this.roleEnum.consignManager,this.roleEnum.consignUser,this.roleEnum.globalAdmin,
    //   this.roleEnum.customerAdmin, this.roleEnum.customerManager,this.roleEnum.customerUser].includes(role)) {
    //   this.getCompanyGroups();
    //   custGroupId.setValidators(Validators.required);
    //   // if ([this.roleEnum.customerManager,this.roleEnum.customerUser].includes(role)) {
    //   //   this.getLocations(this.loggedInUserDetails?.companyId);
    //   // }
    //   // if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
    //   //   companyId.patchValue(this.loggedInUserDetails?.companyId);
    //   // }

      
    //   custGroupId.setValidators(Validators.required);
    //   // companyId.setValidators(Validators.required);
    //   // locationId.setValidators(Validators.required);
    // } 
    else if ([6].includes(id)) {
      customerIds.setValidators(Validators.required);
      this.fetchAllCustomers();
      for (let i = 0; i < this.allCustomers.length; i++) {
        if (this.allCustomers[i].isConsignedCustomer) {
          this.selectedCompaniesId.push(this.allCustomers[i].id)
        }
      }
      customerIds.setValue(this.selectedCompaniesId)
      // this.selectedCompaniesforConsign.setValue(this.selectedCompaniesId)
    } else if ([7, 8].includes(id)) {
      // regionId.setValidators(Validators.required)
      locationId.setValidators(Validators.required);
      // companyId.setValidators(Validators.required);  
      this.getCompanyGroups();
      custGroupId.setValidators(Validators.required)
      if ([this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        this.getConsignedCustomers()
      }
    } else if ([1, 9, 10].includes(id)) {
      this.clearCompanyControl(companyId);
      // this.getAllLocations()
      // this.getCompanyRegions();
      // regionId.setValidators(Validators.required)
       this.getLocationsByLocationType(4);
    } 
    // else if ([3, 4, 7, 8, 11].includes(id)) {
    //   this.getCompanyGroups();
    //   custGroupId.setValidators(Validators.required)
    // } 
    else {
      this.clearCompanyControl(companyId);
      this.clearLocationControl(locationId);
    }
    companyId.updateValueAndValidity();
    locationId.updateValueAndValidity();
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
  getCompanyGroups() {
    this.spinner.show()
    const companyGroupNames = this.usersService.getAllCustGroups(this.isCustomGroupRequired).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCompanyGroups = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(companyGroupNames);
  }
  clearLocationControl(locationId: AbstractControl) {
    locationId.reset(0);
    locationId.clearValidators();
  }

  clearCompanyControl(companyId: AbstractControl) {
    companyId.reset(0);
    companyId.clearValidators();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
