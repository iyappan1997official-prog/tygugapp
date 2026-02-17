import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../inventory.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-epicor',
  templateUrl: './epicor.component.html',
  styleUrls: ['./epicor.component.scss']
})
export class EpicorComponent implements OnInit {

  constructor(private inventoryService:InventoryService, private toasterService: ToastrService, private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    
  }
  syncCustomers(){
    this.spinner.show();
    this.inventoryService.syncCustomes().subscribe(res=>{
      if (res.statusCode === 200) {
        this.toasterService.success(res.message);
      } else if (res.message) {
        this.toasterService.error(res.message);
      }
      this.spinner.hide();
});
  }
  syncCustomerOrders(){
    this.spinner.show();
    this.inventoryService.syncCustomesOrders().subscribe(res=>{
      if (res.statusCode === 200) {
        this.toasterService.success(res.message);
      } else if (res.message) {
        this.toasterService.error(res.message);
      }
      this.spinner.hide();
});
  }
  syncCustomerLocations(){
    this.spinner.show();
    this.inventoryService.syncCustomesLocations().subscribe(res=>{
      if (res.statusCode === 200) {
        this.toasterService.success(res.message);
      } else if (res.message) {
        this.toasterService.error(res.message);
      }
      this.spinner.hide();
});
  }
}
