import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { confirmPasswordValidator } from 'src/app/shared/validators/confirm-password.validator';
import { AuthHttpService } from '../auth-http/auth-http.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  passwordVisible = false;
  passwordVisible1 = false;
  token: string = this.activatedRoute?.snapshot?.queryParams?.token;
  userEmail: string = this.activatedRoute?.snapshot?.queryParams?.email;
  private unsubscribe: Subscription[] = [];
  resetPasswordForm: FormGroup

  initForm() {
    this.resetPasswordForm = this.fb.group({
      password: [
        "",
        [
          Validators.required, Validators.pattern(this.regexService.passwordPattern), Validators.maxLength(25)
        ],
      ],
      cPassword: [
        "",
        [
          Validators.required,
          confirmPasswordValidator,
          Validators.maxLength(25)
        ],
      ],
    })

    const newPasswordValueChangeSubscr = this.resetPasswordForm.valueChanges
      .pipe(
        debounceTime(250),
      ).subscribe((controls) => {
        this.resetPasswordForm?.get("cPassword")?.updateValueAndValidity();
      })

    this.unsubscribe.push(newPasswordValueChangeSubscr)
  }




  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthHttpService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private regexService: RegexService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  resetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
    } else {
      this.spinner.show();
      this.resetPasswordForm.markAsPristine();

      const resetPasswordSubscr = this.authService
        .resetPassword({ token: this.token, email: this.userEmail, password: this.resetPasswordForm.controls.password.value })
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode == 200) {
            this.router.navigate(['/auth/login']);

            if (res?.message) {
              this.toastr.success(res.message, 'Reset')
            }
          }
          else if (res?.message) {
            this.toastr.error(res.message)
          }
        });
      this.unsubscribe.push(resetPasswordSubscr);
    }
  }

  controlHasError(validation: string, controlName: string | number): boolean {
    const control = this.resetPasswordForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());

  }
}
