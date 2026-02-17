import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[alphabets]'
})
export class AlphabetsDirective {
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
    
    const changedValue = initialValue?.replace(/^[A-Z]*$/,'');
    
    console.log(initialValue,changedValue);
      if (initialValue !== changedValue) {
        this._ngControl?.control?.setValue(changedValue);
      }
  }

}
