import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionListComponent } from './distribution-list/distribution-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AddListComponent } from './add-list/add-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TrimWhiteSpaceModule } from 'src/app/shared/directives/trim-white-space/trim-white-space.module';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConfirmActionModule } from 'src/app/shared/modules/confirm-action/confirm-action.module';
import {ActionPopupModule} from 'src/app/shared/modules/action-popups/action-popup.module'
import { MatSelectModule } from '@angular/material/select';

const routes: Routes = [
  {
    path: '',
    component: DistributionListComponent
  },
  {
    path: 'add-list',
    data: {
      componentAccessFor: "add-list"
    },
    component: AddListComponent
  },
  {
    path: 'edit-list/:id',
    component: AddListComponent,
    data: {
      componentAccessFor: "edit-list"
    }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },

]

@NgModule({
  declarations: [
    DistributionListComponent,
    AddListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    ShowErrorModule,
    MatAutocompleteModule,
    TrimWhiteSpaceModule,
    MatButtonModule,
    MatPaginatorModule,
    ConfirmActionModule,
    ActionPopupModule,
    MatSelectModule
  ]
})
export class DistributionListModule { }
