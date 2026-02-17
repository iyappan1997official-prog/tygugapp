import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegersDirective } from './integers.directive';



@NgModule({
  declarations: [
    IntegersDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [IntegersDirective]
})
export class IntegersModule { }
