import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphabetsDirective } from './alphabets.directive';



@NgModule({
  declarations: [
    AlphabetsDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[AlphabetsDirective]
})
export class AlphabetsModule { }
