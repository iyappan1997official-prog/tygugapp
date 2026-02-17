import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { AuthService } from '../auth.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnDestroy {
  passwordVisible = false;
  loggedIn: boolean = false
  loginForm: FormGroup = this.fb.group({
    emailId: ["", [Validators.required, Validators.pattern(this.regexService.email)]],
    password: ["", [Validators.required, Validators.pattern(this.regexService.passwordPattern)]],
    loginSourceId: 1
  });

  public roleEnum = Roles;
  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private regexService: RegexService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.spinner.show();
      const { emailId, password, loginSourceId } = this.loginForm.value;
      const loginSubscr = this.authService
        .login({ emailId, password, loginSourceId }).subscribe((res: any) => {
          this.spinner.hide();
          if (res?.statusCode === 200) {
            this.loggedIn = true;
            const loginRole = res.data.roles[0];
            if (![this.roleEnum.customerUser, this.roleEnum.serviceUser, this.roleEnum.consignUser, this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(loginRole)) {
              this.router.navigate(["/dashboard"], {
                queryParams: {
                  logStatus: this.loggedIn
                }
              });
            } else {
              this.toastr.error('You are not authorized to access the application.')
            }
          } else if (res?.message) {
            this.toastr.error(res?.message);
          }
        });
      this.unsubscribe.push(loginSubscr);
    }
  }


  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }
}
