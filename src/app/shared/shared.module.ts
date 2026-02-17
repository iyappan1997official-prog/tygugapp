import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular forms + material
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

// Correct module imports based on your folder structure
import { LoaderModule } from '../modules/loader/loader.module';
import { ShowErrorModule } from './modules/show-error/show-error.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    LoaderModule,      
    ShowErrorModule    
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    LoaderModule,      
    ShowErrorModule    
  ]
})
export class SharedModule { }
