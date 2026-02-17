import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../profile.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public roleEnum = Roles;

  isLoading: boolean = false;
  loggedInUserRole: Roles;
  userDetails: any;
  loggedInLocationId: number;
  loggedInRegionId: number;
  private unsubscribe: Subscription[] = [];
  constructor(
    private userProfileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loggedInUserRole = this.authService?.getUserFromLocalStorage()?.data?.roles[0] || "";
    this.loggedInLocationId = this.authService?.getUserFromLocalStorage()?.data?.locationId || "";
    this.loggedInRegionId = this.authService?.getUserFromLocalStorage()?.data?.regionId || 0;
    this.getUserProfileDetails();
  }

  getUserProfileDetails() {
    this.spinner.show();
    const userProfile = this.userProfileService.userProfile().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.userDetails = res.data;

      } else {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(userProfile);
  }



}
