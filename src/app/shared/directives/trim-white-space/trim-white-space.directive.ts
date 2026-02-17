import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: "input[trimValue],textarea[trimValue]"
})
export class TrimWhiteSpaceDirective {
  @Input() disableTrim: boolean = false;
  supportedDataTypes: string[] = ["number", "string"];

  constructor(private _ngControl: NgControl) { }

  ngOnInit(): void {
    if (!this._ngControl) {
      console.warn(
        "Note: The trimValue directive should be used with one of ngModel, formControl or formControlName directives."
      );

      return;
    }
  }

  @HostListener("blur", ["$event"]) onBlur(event: any): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disableTrim) return;

    let { value: initialValue } = this._ngControl.control;

    if (!initialValue) return;

    if (typeof initialValue === "number") {
      initialValue = initialValue?.toString();
    }

    const changedValue = initialValue.trim();

    if (initialValue !== changedValue) {
      this._ngControl.control.setValue(changedValue);
    }
  }
}
