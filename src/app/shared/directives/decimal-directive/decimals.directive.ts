import { Directive, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "input[decimals],textarea[decimals]"
})
export class DecimalsDirective {
  constructor(private _ngControl: NgControl) {}

  ngOnInit(): void {
    if (!this._ngControl) {
      console.warn(
        "Note: The decimals directive should be used with one of ngModel, formControl or formControlName directives."
      );

      return;
    }
  }

  // Too accept digits & decimals in input field type number
  @HostListener("input", ["$event"]) onInputChange(event:any): void {
    event.preventDefault();
    event.stopPropagation();

    let { value: initialValue } = this._ngControl.control;

    if (typeof initialValue === "number") {
      initialValue = initialValue?.toString();
    }

    const changedValue = initialValue?.replace(/[^0-9\.{2}]*/g, "");

    if (initialValue !== changedValue) {
      this._ngControl.control.setValue(changedValue);
    }
  }
}
