import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[integers],textarea[integers]',
})
export class IntegersDirective {
  constructor(private _ngControl: NgControl) {}

  ngOnInit(): void {
    if (!this._ngControl) {
      return;
    }
  }

  // Too accept digits for phone number & pincode
  @HostListener('input', ['$event']) onInputChange(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    let initialValue = this._ngControl?.control.value;

      if (typeof initialValue === 'number') {
        initialValue = initialValue?.toString();
      }

      const changedValue = initialValue?.replace(/[^0-9]*/g, '');

      if (initialValue !== changedValue) {
        this._ngControl?.control?.setValue(changedValue);
      }
  }
}
