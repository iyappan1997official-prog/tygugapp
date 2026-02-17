import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { confirmPasswordValidator } from 'src/app/shared/validators/confirm-password.validator';
import { AuthService } from '../../auth/auth.service';
import { UserModel } from '../../auth/models/user.model';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  formGroup: FormGroup = new FormGroup({});
  user: UserModel;
  passwordVisible = false;
  passwordVisible1 = false;
  passwordVisible2 = false;
  private unsubscribe: Subscription[] = [];
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private userProfileService: ProfileService,
    private toastr: ToastrService,
    private router: Router,
    private regexService: RegexService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.formGroup = this.fb.group({
      currentPassword: [this?.user?.password, Validators.required],
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
      ]
    }
    );
    const newPasswordValueChangeSubscr = this.formGroup.valueChanges
    .pipe(
      debounceTime(250),
    ).subscribe((controls) => {
      this.formGroup?.get("cPassword")?.updateValueAndValidity();
    })
  
  this.unsubscribe.push(newPasswordValueChangeSubscr)
  }


  changePassword() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
    } 
    else{
    this.spinner.show();
    const changePassword = this.userProfileService.changePassword(this.formGroup.controls['currentPassword'].value, this.formGroup.controls['password'].value)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          // this.router.navigate(["/profile"]);
          this.authService.logout();
          this.toastr.success(res.message);
        } else {
          this.toastr.error(res.message);
        }
      });
    this.unsubscribe.push(changePassword);
    }
  }

  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string | number): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string | number): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }

}
