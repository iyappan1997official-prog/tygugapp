import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationsComponent } from './locations/locations.component'
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { TrimWhiteSpaceModule } from 'src/app/shared/directives/trim-white-space/trim-white-space.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IntegersModule } from 'src/app/shared/directives/integers/integers.module';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { StringFilterByModule } from 'src/app/shared/pipes/string-filter-by/string-filter-by.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatRadioModule } from '@angular/material/radio';
import { AutosizeModule } from 'ngx-autosize';
import { AddLocationsComponent } from './add-locations/add-locations.component';


const routes: Routes = [
  {
    path: '',
    component: LocationsComponent
  },
  {
    path: 'location',
    component: LocationsComponent
  },
  {
    path: 'add-location',
    component: AddLocationsComponent,
    data: {
      componentAccessFor: "add-location"
    }
  },
  {
    path: 'edit-location/:id',
    component: AddLocationsComponent,
    data: {
      componentAccessFor: "edit-location"
    }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]

@NgModule({
  declarations: [
    LocationsComponent,
    AddLocationsComponent
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
  ]
})
export class LocationServiceModule { }
