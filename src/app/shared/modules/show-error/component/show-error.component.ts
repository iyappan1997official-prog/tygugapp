import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'show-error',
  templateUrl: './show-error.component.html',
  styleUrls: ['./show-error.component.scss']
})
export class ShowErrorComponent {
  @Input() formControlErr: AbstractControl;
  @Input() requiredMsg: string = "This field is required.";
  @Input() patternMsg: string = "Invalid Value.";
  @Input() minLengthMsg: string;
  @Input() maxLengthMsg: string;
  @Input() minValueMsg: string;
  @Input() maxValueMsg: string;
}
