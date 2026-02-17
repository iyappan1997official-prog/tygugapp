import { Directive, HostListener, Input, OnInit } from "@angular/core";
import { NgControl } from "@angular/forms";
@Directive({
  selector: "input[uppercase],textarea[uppercase]"
})
export class UppercaseDirective implements OnInit {
  constructor(private _ngControl: NgControl) {}

  ngOnInit(): void {
    if (!this._ngControl) {
      console.warn(
        "Note: The uppercase directive should be used with one of ngModel, formControl or formControlName directives."
      );

      return;
    }

      this.changeInputValue();
  }

  @HostListener("input", ["$event"]) onInputChange(event:any): void {
    event.preventDefault();
    event.stopPropagation();

    this.changeInputValue();
  }

  changeInputValue(): void {
    let { value: initialValue } = this._ngControl.control;

    if (typeof initialValue === "number") {
      initialValue = initialValue?.toString();
    }

    const changedValue = initialValue?.toUpperCase();

    if (initialValue !== changedValue) {
      this._ngControl.control.setValue(changedValue);
    }
  }
}
