import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { AuthHttpService } from '../auth-http/auth-http.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  email: FormControl = new FormControl("", [Validators.required, Validators.pattern(this.regexService.email)])
  unsubscribe: Subscription[] = [];

  constructor(
    private regexService: RegexService,
    private authService: AuthHttpService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  callForgotPasswordApi() {
    const emailControl = this.email;

    if (emailControl.invalid) {
      emailControl.markAsTouched();
    } else {
      this.spinner.show();
      const forgotPasswordSubscr = this.authService
        .forgotPassword(emailControl.value)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode == 200) {
            this.router.navigate(['/auth/login']);
            if (res.message) {
              this.toastrService.success(res.message)
            }
          }
          else if (res.message) {
            this.toastrService.error(res.message)
          }
        });
      this.unsubscribe.push(forgotPasswordSubscr);
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
