import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ActionPopupComponent } from './component/action-popup.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ActionPopupComponent],
  imports: [
    CommonModule,
    NgbModalModule,
    FlexLayoutModule
  ],
  exports: [ActionPopupComponent]
})
export class ActionPopupModule { }
