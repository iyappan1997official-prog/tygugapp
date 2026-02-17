import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeasedComponent } from './leased/leased.component';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { QuiltDefinitionComponent } from './quilt-definition/quilt-definition.component';
import { MatMenuModule } from '@angular/material/menu';
import { InStockComponent } from './in-stock/in-stock.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreatePalletModalComponent } from './create-pallet-modal/create-pallet-modal.component';
import { UpdateStatusModalComponent } from './update-status-modal/update-status-modal.component';
import { MatSelectModule } from '@angular/material/select';
import { AssignQuiltModalComponent } from './assign-quilt-modal/assign-quilt-modal.component';
import { PalletDetailsComponent } from './pallet-details/pallet-details.component';
import { EditPalletDetailsComponent } from './edit-pallet-details/edit-pallet-details.component';
import { AddTableRowComponent } from './quilt-definition/modal/add-table-row/add-table-row.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { IntegersModule } from 'src/app/shared/directives/integers/integers.module';
import { QuiltsInventoryComponent } from './quilts-inventory/quilts-inventory.component';
import { IndividualInStockComponent } from './in-stock/child-components/individual-in-stock/individual-in-stock.component';
import { PalletInStockComponent } from './in-stock/child-components/pallet-in-stock/pallet-in-stock.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FullTableViewComponent } from './leased/full-table-view/full-table-view.component';
import { GenerateSerialNumberComponent } from './quilt-definition/generate-serial-number/generate-serial-number.component';
import { MomentUtcDateAdapter } from 'src/app/shared/ts/moment-utc-date-adapter';
import { MatDividerModule } from '@angular/material/divider';
import { DecimalDirectiveModule } from '../../shared/directives/decimal-directive/decimal-directive.module';
import { UppercaseDirectiveModule } from '../../shared/directives/uppercase-directive/uppercase-directive.module'
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { StringFilterByModule } from '../../shared/pipes/string-filter-by/string-filter-by.module';
import { MatButtonModule } from '@angular/material/button';
import { PalletTableViewComponent } from './in-stock/child-components/pallet-table-view/pallet-table-view.component';
import { AutosizeModule } from 'ngx-autosize';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { ScannerModalComponent } from './scanner-modal/scanner-modal.component';
import { AutomatePalletComponent } from './automate-pallet/automate-pallet.component';
import { InactiveStockComponent } from './in-stock/child-components/inactive-stock/inactive-stock.component';
import { EpicorComponent } from './epicor/epicor.component';
import { CustomerInventoryComponent } from './customer-inventory/customer-inventory.component';

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
    path: 'quilts-inventory',
    children: [
      {
        path: '',
        component: QuiltsInventoryComponent
      },
      {
        path: 'leased/:id',
        component: FullTableViewComponent
      },
      {
        path: 'purchased/:id',
        component: FullTableViewComponent
      },
      {
        path: 'details',
        component: FullTableViewComponent
      },
      {
        path: 'leased',
        component: FullTableViewComponent
      },
      {
        path: 'purchased',
        component: FullTableViewComponent
      },
      {
        path: 'generate-serial-number',
        component: GenerateSerialNumberComponent
      },
      {
        path: 'automate-pallet',
        component: AutomatePalletComponent
      },
      {
        path: 'pallet-details/:id',
        component: PalletDetailsComponent
      },
      {
        path: 'edit-pallet-details/:id',
        component: EditPalletDetailsComponent,
        data: {
          componentAccessFor: "edit-pallet"
        }
      },
      {
        path: 'merge-pallet/:id',
        component: EditPalletDetailsComponent,
        data: {
          componentAccessFor: "merge-pallet"
        }
      },
      {
        path: 'create-pallet',
        component: EditPalletDetailsComponent,
        data: {
          componentAccessFor: "create-pallet"
        }
      },
    ]
  },
  { path: '', redirectTo: 'quilts-inventory', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]

@NgModule({
  declarations: [
    LeasedComponent,
    QuiltDefinitionComponent,
    InStockComponent,
    CreatePalletModalComponent,
    UpdateStatusModalComponent,
    AssignQuiltModalComponent,
    PalletDetailsComponent,
    EditPalletDetailsComponent,
    AddTableRowComponent,
    QuiltsInventoryComponent,
    IndividualInStockComponent,
    PalletInStockComponent,
    FullTableViewComponent,
    GenerateSerialNumberComponent,
    PalletTableViewComponent,
    ScannerModalComponent,
    AutomatePalletComponent,
    InactiveStockComponent,
    EpicorComponent,
    CustomerInventoryComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT },
    { provide: DateAdapter, useClass: MomentUtcDateAdapter },
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    FlexLayoutModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgbCollapseModule,
    MatMenuModule,
    MatTabsModule,
    MatCheckboxModule,
    NgbCollapseModule,
    MatSelectModule,
    ShowErrorModule,
    ReactiveFormsModule,
    IntegersModule,
    MatDividerModule,
    DecimalDirectiveModule,
    UppercaseDirectiveModule,
    MatPaginatorModule,
    MatButtonModule,
    StringFilterByModule,
    IntegersModule,
    NgxMatSelectSearchModule,
    AutosizeModule,
    NgxScannerQrcodeModule
  ]
})
export class InventoryModule { }
