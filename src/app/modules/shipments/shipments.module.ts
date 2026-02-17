import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ViewShipmentComponent } from './view-shipment/view-shipment.component';
import { OrderModalComponent } from './order-modal/order-modal.component';
import { ShipComponent } from './ship/ship.component';
import { ReceiveComponent } from './receive/receive.component';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { TrackShipmentComponent } from './track-shipment/track-shipment.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { GoogleMapsModule } from '@angular/google-maps'
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentUtcDateAdapter } from 'src/app/shared/ts/moment-utc-date-adapter';
import { StringFilterByModule } from 'src/app/shared/pipes/string-filter-by/string-filter-by.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReceiveallModalComponent } from './receiveall-modal/receiveall-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
//import { AgmCoreModule } from '@agm/core';
import { LoaderModule } from "../loader/loader.module";

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
    path: 'track-shipments',
    component: TrackShipmentComponent
  },
  { path: '', redirectTo: 'track-shipments', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]
@NgModule({
  declarations: [
    TrackShipmentComponent,
    ViewShipmentComponent,
    OrderModalComponent,
    ShipComponent,
    ReceiveComponent,
    AlertModalComponent,
    ReceiveallModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDividerModule,
    MatFormFieldModule,
    MatMenuModule,
    FlexLayoutModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    ShowErrorModule,
    MatPaginatorModule, GoogleMapsModule,
    NgxScannerQrcodeModule,
    StringFilterByModule,
    NgxMatSelectSearchModule,
    MatCheckboxModule,
    MatDialogModule,
    LoaderModule
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyDC0i34zD7u5NwIkTWxYqyL241KzDSkHKE'
    // }),
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT },
    { provide: DateAdapter, useClass: MomentUtcDateAdapter },
  ],
})
export class ShipmentsModule { }
