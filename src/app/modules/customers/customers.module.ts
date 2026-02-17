import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerComponent } from './customer/customer.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { TrimWhiteSpaceModule } from 'src/app/shared/directives/trim-white-space/trim-white-space.module';
import { IntegersModule } from 'src/app/shared/directives/integers/integers.module';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';


const routes: Routes = [
  {
    path: '',
    component: CustomerComponent
  },
  {
    path: 'add-customer',
    component: AddCustomerComponent,
    data: {
      componentAccessFor: "add-customer"
    }
  },
  // {
  //   path: 'edit-customer/:id',
  //   component: AddCustomerComponent,
  //   data: {
  //     componentAccessFor: "edit-customer"
  //   }
  // },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]

@NgModule({
  declarations: [
    CustomerComponent,
    AddCustomerComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    ShowErrorModule,
    TrimWhiteSpaceModule,
    IntegersModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  exports: [AddCustomerComponent]
})
export class CustomersModule { }
