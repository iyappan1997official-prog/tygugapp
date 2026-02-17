import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecimalsDirective } from './decimals.directive';

@NgModule({
  declarations: [
    DecimalsDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[DecimalsDirective]
})
export class DecimalDirectiveModule { }
