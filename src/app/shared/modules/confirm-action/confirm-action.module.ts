import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmActionComponent } from './component/confirm-action.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ConfirmActionComponent],
  imports: [
    CommonModule,
    NgbModalModule,
    FlexLayoutModule
  ],
  exports: [ConfirmActionComponent]
})
export class ConfirmActionModule { }
