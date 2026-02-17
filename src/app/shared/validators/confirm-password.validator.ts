import { ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent || !control) {
        return null
    }

    const newPassword = control.parent.get("password")
    const confirmPassword = control.parent.get("cPassword")

    if (!newPassword || !confirmPassword) {
        return null
    }
    if (newPassword.value !== confirmPassword.value) {
        return { confirmPassword: true }
    }

    return null
}