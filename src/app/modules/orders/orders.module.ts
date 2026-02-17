import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { TrimWhiteSpaceModule } from 'src/app/shared/directives/trim-white-space/trim-white-space.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { IntegersModule } from 'src/app/shared/directives/integers/integers.module';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MomentUtcDateAdapter } from 'src/app/shared/ts/moment-utc-date-adapter';
import { ViewCustomerDetailsComponent } from './view-customer-details/view-customer-details.component';
import { LocationComponent } from './location/location.component';
import { AddLocationComponent } from './add-location/add-location.component';
import { CarrierComponent } from './carrier/carrier.component';
import { AddCarrierComponent } from './add-carrier/add-carrier.component';
import { RecordsComponent } from './records/records.component';
import { AddOrderComponent } from './add-order/add-order.component';
import { EditOrderGuard } from '../../guards/edit-order.guard';
import { ArchiveModalComponent } from './modal/archive-modal/archive-modal.component';
import { ReconsileModalComponent } from './modal/archive-modal/reconsile-modal/reconsile-modal.component';
import { AddCustomerComponent } from '../customers/add-customer/add-customer.component';
import { StringFilterByModule } from 'src/app/shared/pipes/string-filter-by/string-filter-by.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AutosizeModule } from 'ngx-autosize';
import { CloseOrderModalComponent } from './close-order/close-order-modal/close-order-modal.component';
import { QuiltThresholdComponent } from './quilt-threshold/quilt-threshold.component';
import { AddQuiltThresholdComponent } from './quilt-threshold/add-quilt-threshold/add-quilt-threshold.component';
import { OrderNickNameComponent } from './modal/order-nick-name/order-nick-name.component';

export const DATE_FORMAT = {
  parse: {
    dateInput: "LL"
  },
  display: {
    dateInput: "MM/DD/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "MM/DD/YYYY",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

const routes: Routes = [
  {
    path: '',
    redirectTo: "view-orders/:id",
    pathMatch: "full"
  },
  {
    path: 'view-orders/:id',
    component: RecordsComponent
  },
  {
    path: 'edit-customer/:id',
    canActivate: [EditOrderGuard],
    canLoad: [EditOrderGuard],
    component: AddCustomerComponent,
    data: {
      componentAccessFor: "edit-customer"
    }
  },
  {
    path: 'add-order',
    canActivate: [EditOrderGuard],
    canLoad: [EditOrderGuard],
    component: AddOrderComponent,
    data: {
      componentAccessFor: "add-order"
    }
  },
  {
    path: 'edit-order/:id',
    component: AddOrderComponent,
    canActivate: [EditOrderGuard],
    canLoad: [EditOrderGuard],
    data: {
      componentAccessFor: "edit-order"
    }
  },
  {
    path: 'add-location',
    component: AddLocationComponent,
    data: {
      componentAccessFor: "add-location"
    }
  },
  {
    path: 'edit-location/:id',
    component: AddLocationComponent,
    data: {
      componentAccessFor: "edit-location"
    }
  },
  {
    path: 'add-carrier',
    canActivate: [EditOrderGuard],
    canLoad: [EditOrderGuard],
    component: AddCarrierComponent,
    data: {
      componentAccessFor: "add-carrier"
    }
  },
  {
    path: 'edit-carrier/:id',
    component: AddCarrierComponent,
    canActivate: [EditOrderGuard],
    canLoad: [EditOrderGuard],
    data: {
      componentAccessFor: "edit-carrier"
    }
  },
  {
    path: 'add-threshold',
    // canActivate: [EditOrderGuard],
    // canLoad: [EditOrderGuard],
    component: AddQuiltThresholdComponent,
    data: {
      componentAccessFor: "add-threshold"
    }
  },
  {
    path: 'edit-threshold/:id',
    component: AddQuiltThresholdComponent,
    // canActivate: [EditOrderGuard],
    // canLoad: [EditOrderGuard],
    data: {
      componentAccessFor: "edit-threshold"
    }
  },
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: '**', redirectTo: '/customers', pathMatch: 'full' },
]

@NgModule({
  declarations: [
    ViewCustomerDetailsComponent,
    LocationComponent,
    AddLocationComponent,
    CarrierComponent,
    AddCarrierComponent,
    ArchiveModalComponent,
    ReconsileModalComponent,
    RecordsComponent,
    AddOrderComponent,
    CloseOrderModalComponent,
    QuiltThresholdComponent,
    AddQuiltThresholdComponent,
    OrderNickNameComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTabsModule,
    ReactiveFormsModule,
    ShowErrorModule,
    TrimWhiteSpaceModule,
    MatDatepickerModule,
    MatNativeDateModule,
    IntegersModule,
    MatButtonModule,
    MatPaginatorModule,
    StringFilterByModule,
    NgxMatSelectSearchModule,
    MatRadioModule,
    AutosizeModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT },
    { provide: DateAdapter, useClass: MomentUtcDateAdapter },
  ],
})
export class OrdersModule { }
