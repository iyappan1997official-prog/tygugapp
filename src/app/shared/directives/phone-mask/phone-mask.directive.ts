import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName][phoneMask]',
})
export class PhoneMaskDirective {

  constructor(public ngControl: NgControl) { }


  @HostListener('ngModelChange', ['$event'])
  onModelChange(event:any) {
    this.onInputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event:any) {
    this.onInputChange(event.target.value, true);
  }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

  onInputChange(event:any, backspace:any) {
    let control:any;

    if (!event) {
      return
    }

    if (this.ngControl) {
      control = this.ngControl.control;
    }

    let newVal = event.replace(/\D/g, '');
    if (backspace && newVal.length <= 6) {
      newVal = newVal.substring(0, newVal.length - 1);
    }
    if (newVal.length === 0) {
      newVal = '';
    } else if (newVal.length <= 3) {
      newVal = newVal.replace(/^(\d{0,3})/, '($1)');
    } else if (newVal.length <= 6) {
      newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
    } else if (newVal.length <= 10) {
      newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
    } else {
      newVal = newVal.substring(0, 10);
      newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
    }

    if (newVal.length < 14) {
      control.setErrors({ pattern: true });
    }

    if (newVal.length === 0 && control.value.length > 0) {
      control.patchValue("");
    }

    if (control.value.length === 15) {
      control.patchValue(control.value.slice(0, -1));
    }

    this.ngControl?.valueAccessor?.writeValue(newVal);
  }
}
