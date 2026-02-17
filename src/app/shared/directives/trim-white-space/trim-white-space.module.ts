import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrimWhiteSpaceDirective } from './trim-white-space.directive';



@NgModule({
  declarations: [
    TrimWhiteSpaceDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [TrimWhiteSpaceDirective]
})
export class TrimWhiteSpaceModule { }
