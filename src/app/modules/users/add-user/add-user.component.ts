import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { FetchUserRolesService } from 'src/app/shared/services/fetch-user-roles.service';
import { RegexService } from 'src/app/shared/services/regex.service';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../users.service';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { ShipmentsService } from '../../shipments/shipments.service';
import { ReportsService } from '../../reports/reports.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  public roleEnum = Roles;

  showMultiSelectCustomers:boolean =false;
  showCustomerGroups:boolean=false;
  showLocations:boolean=false;

  addUserForm: FormGroup;
  passwordVisible = false;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  savedUserDetails: any = {};
  userId: number = this.activatedRoute?.snapshot?.params?.id;
  loggedInUserDetails: any = {};
  
  loggedInUserRole: Roles;
  allUserRoles: any = [];
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
  isCustomerLocationsRequired: boolean = false;
  //Add New
  showChangePasswordModal = false;
  isLoading: boolean = false;
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
    this.loggedLocation = this.authService?.getUserFromLocalStorage()?.data?.locationId || null;
    this.loggedRegion = this.authService?.getUserFromLocalStorage()?.data?.regionId || null;
    this.custGroupIdForCustomer = this.authService?.getUserFromLocalStorage()?.data?.custGroupId || "";
    this.isLoading = true;
    this.spinner.show();
    let fetchData = [this.usersService.getRoles().pipe(catchError(error => of(error)))];
    this.spinner.hide();
    this.initForm();
    let hideSpinner=false;
    if (this.componentAccessFor === "edit-user" && this.userId && this.userId>0) {
      fetchData.push(this.usersService.getUserDetailsById(+this.userId).pipe(catchError(error => of(error))));
    }else{
      hideSpinner=true;
    }
    forkJoin(fetchData).subscribe({
      next: (results) => {
        if (results[0]) {
          if (results[0].statusCode === 200) {
            this.allUserRoles = results[0]?.data;
          }
          else {
            this.allUserRoles = [];
            if (results[0].message) {
              this.toastrService.error(results[0].message);
            }
          }
        }
        if (results[1]) {
          if (results[1].statusCode === 200) {
            this.savedUserDetails = results[1]?.data;
            //this.getMasterData(this.savedUserDetails.role,this.savedUserDetails.custGroupId);
            this.getMasterData(this.savedUserDetails.role, this.savedUserDetails.custGroupId, true);
          }
          else {
            this.savedUserDetails = [];
            if (results[1].message) {
              this.toastrService.error(results[1].message);
            }
          }
        }
      },
      error: (e) => {this.toastrService.error(e.message)},
      complete: () => { if (hideSpinner) this.isLoading = false; }
    });

    const password = this.addUserForm.controls.password;
    password.setValidators([Validators.pattern(this.regexService.passwordPattern)]);
    password.updateValueAndValidity();
    if (this.componentAccessFor === "add-user") {
      password.setValidators([Validators.required, Validators.pattern(this.regexService.passwordPattern)]);
      password.updateValueAndValidity();
    }
  }
 /*getMasterData(role:string,custmerGroupId:number){
    debugger
    let fetchData=[];
    const { roleId, locationId, companyId,custGroupId } = this.addUserForm.controls;
      switch (role) {
        case this.roleEnum.masterAdmin:
        case this.roleEnum.serviceManager:
        case this.roleEnum.serviceUser:
        locationId.addValidators(Validators.required);
          if(this.loggedInUserRole==this.roleEnum.serviceManager){
            locationId.patchValue(this.loggedLocation);
            fetchData=[of(null),of(null)]
          }else{
            this.showLocations=true;
            fetchData=[of(null),
              this.usersService.GetLocationsByLocationTypeId(4).pipe(catchError(error => of(error)))
            ];
          }
          break;
        case this.roleEnum.globalAdmin:
          this.showCustomerGroups=true;
          custGroupId.addValidators(Validators.required);
            fetchData=[this.usersService.getAllCustGroups(false).pipe(catchError(error => of(error))),of(null)
          ];
          break;
        case this.roleEnum.customerAdmin:
        case this.roleEnum.customerManager:
        case this.roleEnum.customerUser:
          this.isCustomerLocationsRequired=role!=this.roleEnum.customerAdmin;
          if (this.loggedInUserRole === this.roleEnum.masterAdmin) {  
            this.showCustomerGroups=true;
            custGroupId.addValidators(Validators.required);
            fetchData=[this.usersService.getAllCustGroups(true).pipe(catchError(error => of(error))),
              custmerGroupId>0?  this.usersService.getLocationsByCustomerId(custmerGroupId, 2).pipe(catchError(error => of(error))):of(null)
            ];
          }else if(this.loggedInUserRole === this.roleEnum.globalAdmin) {
            this.showCustomerGroups=true;
            custGroupId.addValidators(Validators.required);
            fetchData=[this.usersService.getGlobalAdminCustomers().pipe(catchError(error => of(error))),of(null)]
          }else if(this.loggedInUserRole === this.roleEnum.customerAdmin){
            custGroupId.addValidators(Validators.required);
            locationId.addValidators(Validators.required);
            custGroupId.patchValue(this.custGroupIdForCustomer);
            this.showLocations=true;
            fetchData=[of(null),of(null)]
          }else{
            this.isCustomerLocationsRequired=false;
            custGroupId.addValidators(Validators.required);
            locationId.addValidators(Validators.required);
            custGroupId.patchValue(this.custGroupIdForCustomer);
            locationId.patchValue(this.loggedLocation);
            fetchData=[of(null),of(null)]
          }
          
          break;
        case this.roleEnum.consignAdmin:
          fetchData=[of(null),of(null)]
          //get customer groups 
          break;
        case this.roleEnum.consignUser:
        case this.roleEnum.consignManager:
          fetchData=[of(null),of(null)]
          //get consigned locations
            break;
        default:
          fetchData=[of(null),of(null)]
          break;
      }
      if(custmerGroupId==0)this.spinner.show();
      forkJoin(fetchData).subscribe({
        next: (results) => {
          if (results[0]) {
            if (results[0].statusCode === 200) {
              this.allCompanyGroups = results[0]?.data;
              this.showCustomerGroups=true;
            }
            else {
              this.allCompanyGroups = [];
              if (results[0].message) {
                this.toastrService.error(results[0].message);
              }
            }
          }
          if (results[1]) {
            if (results[1].statusCode === 200) {
              this.alllocations = results[1]?.data;
              if(role!=this.roleEnum.customerAdmin)
              this.showLocations=true;
            }else {
              this.alllocations = [];
              if (results[0].message) {
                this.toastrService.error(results[0].message);
              }
            }
          }
        },
        error: (e) => this.toastrService.error(e.message),
        complete: () => { 
          this.spinner.hide();
          if(this.userId>0 && this.savedUserDetails){
            this.patchFormvalues();
            this.enableEditUserFields();
          }
        }
      });
 }*/

  getMasterData(role: string, custmerGroupId: number, shouldPatch: boolean = false) {

    // debugger; // Optional: Keep for debugging if needed

    let fetchData = [];

    const { roleId, locationId, companyId, custGroupId } = this.addUserForm.controls;



    switch (role) {

      case this.roleEnum.masterAdmin:

      case this.roleEnum.serviceManager:

      case this.roleEnum.serviceUser:

        locationId.addValidators(Validators.required);

        if (this.loggedInUserRole == this.roleEnum.serviceManager) {

          locationId.patchValue(this.loggedLocation);

          fetchData = [of(null), of(null)];

        } else {

          this.showLocations = true;

          fetchData = [

            of(null),

            this.usersService.GetLocationsByLocationTypeId(4).pipe(catchError(error => of(error)))

          ];

        }

        break;

      case this.roleEnum.globalAdmin:

        this.showCustomerGroups = true;

        custGroupId.addValidators(Validators.required);

        fetchData = [

          this.usersService.getAllCustGroups(false).pipe(catchError(error => of(error))),

          of(null)

        ];

        break;

      case this.roleEnum.customerAdmin:

      case this.roleEnum.customerManager:

      case this.roleEnum.customerUser:

        this.isCustomerLocationsRequired = role != this.roleEnum.customerAdmin;

        if (this.loggedInUserRole === this.roleEnum.masterAdmin) {

          this.showCustomerGroups = true;

          custGroupId.addValidators(Validators.required);

          fetchData = [

            this.usersService.getAllCustGroups(true).pipe(catchError(error => of(error))),

            custmerGroupId > 0 ? this.usersService.getLocationsByCustomerId(custmerGroupId, 2).pipe(catchError(error => of(error))) : of(null)

          ];

        } else if (this.loggedInUserRole === this.roleEnum.globalAdmin) {

          this.showCustomerGroups = true;

          custGroupId.addValidators(Validators.required);

          fetchData = [this.usersService.getGlobalAdminCustomers().pipe(catchError(error => of(error))), of(null)];

        } else if (this.loggedInUserRole === this.roleEnum.customerAdmin) {

          custGroupId.addValidators(Validators.required);

          locationId.addValidators(Validators.required);

          custGroupId.patchValue(this.custGroupIdForCustomer);

          this.showLocations = true;

          fetchData = [of(null), of(null)];

        } else {

          this.isCustomerLocationsRequired = false;

          custGroupId.addValidators(Validators.required);

          locationId.addValidators(Validators.required);

          custGroupId.patchValue(this.custGroupIdForCustomer);

          locationId.patchValue(this.loggedLocation);

          fetchData = [of(null), of(null)];

        }



        break;

      case this.roleEnum.consignAdmin:

        fetchData = [of(null), of(null)];

        //get customer groups

        break;

      case this.roleEnum.consignUser:

      case this.roleEnum.consignManager:

        fetchData = [of(null), of(null)];

        //get consigned locations

        break;

      default:

        fetchData = [of(null), of(null)];

        break;

    }



    // debugger;

    if (!this.userId || this.userId == 0) this.spinner.show();



    forkJoin(fetchData).subscribe({

      next: (results) => {

        if (results[0]) {

          if (results[0].statusCode === 200) {

            this.allCompanyGroups = results[0]?.data;

            this.showCustomerGroups = true;

          } else {

            this.allCompanyGroups = [];

            if (results[0].message) {

              this.toastrService.error(results[0].message);

            }

          }

        }

        if (results[1]) {

          if (results[1].statusCode === 200) {

            this.alllocations = results[1]?.data;

            if (role != this.roleEnum.customerAdmin)

              this.showLocations = true;

          } else {

            this.alllocations = [];

            if (results[0].message) {

              this.toastrService.error(results[0].message);

            }

          }

        }

      },

      error: (e) => this.toastrService.error(e.message),

      complete: () => {

        // --- THE FIX IS HERE ---

        // We now check 'shouldPatch' before overwriting the form

        if (shouldPatch && this.userId > 0 && this.savedUserDetails) {

          this.patchFormvalues();

          this.enableEditUserFields();

          this.isLoading = false;

        } else {

          this.spinner.hide();

          this.isLoading = false;

        }

      }

    });

  }
  get passwordFieldAsFormControl() {
    return this.addUserForm.controls.password as FormControl;
  }

  get isEditMode(): boolean {
    return this.componentAccessFor === 'edit-user';
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
    
    this.addUserForm.controls["custGroupId"].valueChanges.subscribe(m=>{
      if(this.isCustomerLocationsRequired){
          this.getLocationsByCustGroup(m);
      }
    })
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
      locationId.disable();
    } else {
      roleId.enable();
    }
    if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
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
    }
    this.cd.detectChanges();
  }

  getLocationsByCustGroup(id: number) {
    this.spinner.show();
    const locationSub = this.usersService.getLocationByCustGroup(+id).subscribe(res => {
      this.showLocations=true;
      if (res.statusCode == 200) {
        this.alllocations = res?.data
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
      this.spinner.hide();
    })
    this.unsubscribe.push(locationSub);
  }

  resetForm() {
    if (this.componentAccessFor === "add-user") {
      this.addUserForm.reset({ id: 0 });

      if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
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

  /*onRoleChange(event: any) {
    const { companyId, locationId, customerIds, regionId, custGroupId } = this.addUserForm.controls;
    let id = event.value;
    let  role= event.source.triggerValue;
    this.addUserForm.controls["roleName"].patchValue(role);
    this.roleIdSelect = id;
    this.showMultiSelectCustomers=false;
    this.showCustomerGroups=false;
    this.showLocations=false;
    this.isCustomerLocationsRequired=false;
    this.allCompanyGroups=[];
    this.alllocations = [];
    custGroupId.reset();
    regionId.reset();
    locationId.reset();
    companyId.reset();
    this.getMasterData(role,0);

  }*/

  onRoleChange(event: any) {

    const { companyId, locationId, regionId, custGroupId } = this.addUserForm.controls;

    let id = event.value;
    let role = event.source.triggerValue;

    this.addUserForm.controls["roleName"].patchValue(role);
    this.roleIdSelect = id;

    // 1. Hide everything first

    this.showMultiSelectCustomers = false;
    this.showCustomerGroups = false;
    this.showLocations = false;
    this.isCustomerLocationsRequired = false;

    // 2. Clear Arrays

    this.allCompanyGroups = [];

    this.alllocations = [];

    // 3. Reset Values AND Clear Validators 
    custGroupId.clearValidators();
    custGroupId.reset();
    custGroupId.updateValueAndValidity(); 
    regionId.clearValidators();
    regionId.reset();
    regionId.updateValueAndValidity();
    locationId.clearValidators();
    locationId.reset();
    locationId.updateValueAndValidity();
    companyId.clearValidators();
    companyId.reset();
    companyId.updateValueAndValidity();

    // 4. Fetch new requirements (which will re-add validators if needed)

    // Pass 'false' for the 3rd argument to prevent overwriting form data

    this.getMasterData(role, 0, false);

  }
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  openChangePassword() {
    this.showChangePasswordModal = true;
  }

  closeChangePassword() {
    this.showChangePasswordModal = false;
  }
}

