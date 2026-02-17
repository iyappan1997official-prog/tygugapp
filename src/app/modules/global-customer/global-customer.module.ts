import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { GlobalCustomerComponent } from './global-customer.component';
import { AddGlobalCustomerComponent } from './add-global-customer/add-global-customer.component';
import { ShowErrorModule } from 'src/app/shared/modules/show-error/show-error.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { StringFilterByModule } from 'src/app/shared/pipes/string-filter-by/string-filter-by.module';

const routes: Routes = [
    {
        path: '',
        component: GlobalCustomerComponent
    },
    {
        path: 'add-global-customer',
        data: {
            componentAccessFor: "add-global-customer"
        },
        component: AddGlobalCustomerComponent
    },
    {
        path: 'edit-global-customer/:id',
        component: AddGlobalCustomerComponent,
        data: {
            componentAccessFor: "edit-global-customer"
        }
    },
    { path: '**', redirectTo: '', pathMatch: 'full' },

]

@NgModule({
    declarations: [
        GlobalCustomerComponent,
        AddGlobalCustomerComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FlexLayoutModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatPaginatorModule,
        MatSelectModule,
        ShowErrorModule,
        StringFilterByModule,
        NgxMatSelectSearchModule
    ]
})
export class GlobalCustomerModule { }
