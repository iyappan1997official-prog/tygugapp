import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../users.service';
import { confirmPasswordValidator } from 'src/app/shared/validators/confirm-password.validator';

@Component({
  selector: 'app-change-password-popup',
  templateUrl: './change-password-popup.component.html',
  styleUrls: ['./change-password-popup.component.scss']
})
export class ChangePasswordPopupComponent implements OnInit {

  @Input() userId!: number;
  @Output() passwordChanged = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  formGroup!: FormGroup;

  passwordVisible = false;
  passwordVisible1 = false;
  passwordVisible2 = false;

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toastr: ToastrService
  ) { }

  /*ngOnInit(): void {
    this.formGroup = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.maxLength(25),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,25}$/
            )
          ]
        ],
        cPassword: ['', Validators.required]
      },
      {
        validators: confirmPasswordValidator
      }
    );
  }*/

  ngOnInit(): void {
    this.formGroup = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.maxLength(25),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,25}$/
            )
          ]
        ],
        cPassword: ['', Validators.required]
      },
      {
        validators: confirmPasswordValidator
      }
    );
  }


  changePassword(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    
    const newPassword = this.formGroup.value.password;

    this.isLoading = true;

    this.usersService.resetUserPassword(this.userId, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Password Reset successfully');
        this.passwordChanged.emit();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message || 'Password reset failed');
      }
    });
  }


  onCancel(): void {
    this.cancel.emit();
  }

  controlHasError(error: string, controlName: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control && control.hasError(error) && control.touched);
  }
}
