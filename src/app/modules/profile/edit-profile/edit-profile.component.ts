import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { ProfileService } from '../profile.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  public roleEnum = Roles;
  userDetails: any;
  userForm: FormGroup;
  loggedInUserRole: Roles;
  loggedInLocationId: number;
  loggedInRegionId: number;
  alllocations: any[] = [];
  allCompanyRegions: any[] = [];
  loggedInUserDetails: any = {};
  custGroupId: any = null;

  private unsubscribe: Subscription[] = [];
  constructor(
    private userProfileService: ProfileService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private regexService: RegexService,
    private cd: ChangeDetectorRef,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {

    const userDetailsString = localStorage.getItem('userDetails');
    if (userDetailsString) {

      const userDetails = JSON.parse(userDetailsString);
      // Access the custgroupid field
      this.custGroupId = userDetails.data.custGroupId;

    }

    this.loggedInUserDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.loggedInLocationId = this.authService?.getUserFromLocalStorage()?.data?.locationId || "";
    this.loggedInRegionId = this.authService?.getUserFromLocalStorage()?.data?.regionId || 0;

    this.initForm();
    this.getCompanyRegions()
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.getLocations(this.loggedInUserDetails?.companyId);
    } else if ([this.roleEnum.masterAdmin, this.roleEnum.serviceUser, this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      this.getLocationsByRegion();
      this.getUserProfileDetails();
    } else {
      this.getLocations(this.loggedInUserDetails?.companyId);
      // this.getLocationsByRegion(this.loggedInRegionId);
      this.getUserProfileDetails();
      // this.userForm.controls.region.patchValue(this.loggedInRegionId)
    }
  }

  initForm() {
    this.userForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required]],
      phoneNumber: ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.regexService.allPhoneNumber)]],
      locationId: "",
      region: ''
    });
  }

  getCompanyRegions() {
    this.spinner.show()
    const companyNames = this.usersService.getCompaniesRegion().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCompanyRegions = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(companyNames);
  }

  getLocationsByRegion() {
    this.spinner.show();
    const locationSub = this.usersService.GetServiceCenterLocations().subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.alllocations = res?.data
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(locationSub);
  }


  getLocations(custGroupId: number,) {
    this.spinner.show();
    const locationSub = this.usersService.getLocationByCustGroup(this.custGroupId).subscribe(res => {
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

        this.getUserProfileDetails();
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(locationSub);
  }


  getSelectedLocationName(): string {
    const selectedLocation = this.alllocations.find(location => location.id === this.userForm.get('locationId').value);
    return selectedLocation ? selectedLocation.name : '';
  }

  disableRequiredFields() {
    const { firstName, lastName, phoneNumber, locationId, region } = this.userForm.controls;
    this.userForm.disable();
    firstName.enable();
    lastName.enable();
    phoneNumber.enable();
    // if (this.loggedInUserRole === this.roleEnum.customerAdmin) {
    //   locationId.enable();
    //   locationId.setValidators(Validators.required);
    // }
  }

  patchFormvalues() {
    const editProfileDetails = this.userDetails || {};

    if (!!editProfileDetails) {
      this.userForm.patchValue({ ...editProfileDetails, locationId: editProfileDetails?.location?.id, region: editProfileDetails?.region?.id });
    }
    let locationdata = editProfileDetails?.location;
    this.alllocations = [...this.alllocations, ...locationdata]
    this.disableRequiredFields();
    this.cd.detectChanges();
  }

  getUserProfileDetails() {
    this.spinner.show();
    const userProfile = this.userProfileService.userProfile().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.userDetails = res?.data;
        this.patchFormvalues();
      } else {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(userProfile);
  }

  editUserProfile() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
    } else {
      this.spinner.show();
      const formValues = this.userForm.getRawValue();
      let body = {
        ...formValues,
      };
      const addUserSub = this.userProfileService.editProfile(body)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            const { firstName, lastName } = res?.data;
            let userData = this.authService.getUserFromLocalStorage();

            userData.data["userFullName"] = `${firstName} ${lastName}`;
            this.authService.setUserFromLocalStorage(userData);
            this.authService.currentUserSubject.next(userData);


            this.router.navigate(["/profile"]);

            if (res?.message) {
              this.toastr.success(res.message);
            }
          } else {
            this.getUserProfileDetails();
            if (res?.message) {
              this.toastr.error(res.message);
            }
          }
        });
      this.unsubscribe.push(addUserSub);
    }
  }
}
