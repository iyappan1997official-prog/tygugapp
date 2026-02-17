import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { CustomersService } from 'src/app/modules/customers/customers.service';
import { InventoryService } from 'src/app/modules/inventory/inventory.service';
import { ShipmentsService } from 'src/app/modules/shipments/shipments.service';

@Component({
  selector: 'app-add-quilt-threshold',
  templateUrl: './add-quilt-threshold.component.html',
  styleUrls: ['./add-quilt-threshold.component.scss']
})
export class AddQuiltThresholdComponent implements OnInit {
  addThresholdForm: FormGroup;
  locationId: number | string = this.activatedRoute?.snapshot?.params?.id;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  thresholdId: number = +this.activatedRoute?.snapshot?.params?.id
  savedDetails: any[] = [];
  customerId: number = this.activatedRoute?.snapshot?.queryParams?.customerId;
  private unsubscribe: Subscription[] = [];
  allLocations: any[] = [];
  loggedCustomerId: number;
  allPartNumbers: any[] = [];
  locationSelected: number = 0
  partNumberId: FormControl = new FormControl(0, [Validators.required]);
  customerFacing: FormControl = new FormControl("");

  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private customersService: CustomersService,
    private cd: ChangeDetectorRef,
    private inventoryService: InventoryService,
    private router: Router, private authService: AuthService,
    private shipmentsService: ShipmentsService) { }

  ngOnInit(): void {
    this.loggedCustomerId = this.authService?.getUserFromLocalStorage()?.data?.companyId || "";
    this.initForm()
    this.getCustomerLocation();
    // this.getLocationByCustomerId(+this.loggedCustomerId);
    if (this.thresholdId) {
      this.getCustomerFacingForInventory()
      // this.getThresholdDetails(this.thresholdId);
    }
  }

  initForm() {
    this.addThresholdForm = this.fb.group({
      id: 0,
      inventoryId: 0,
      locationId: 0,
      thresholdValue: 0,
      quantity: 0
    });
  }

  // getLocationByCustomerId(customerId: any) {
  //   this.spinner.show()
  //   const locationDrop = this.shipmentsService.getLocationsByCustomerId(customerId).subscribe((res) => {
  //     this.spinner.hide();
  //     if (res.statusCode === 200) {
  //       this.allLocations = res?.data;
  //     } else if (res.message) {
  //       this.toastrService.error(res.message)
  //     }
  //   })
  //   this.unsubscribe.push(locationDrop);
  // }
  locationFilter(event: any) {
    this.locationSelected = event
    if (this.locationSelected) {
      this.getCustomerFacingForInventory()
    }

  }
  getCustomerLocation() {
    this.spinner.show()
    const locationDrop = this.inventoryService.getCustomerLocations(false, false, true).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allLocations = res?.data;
      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  getThresholdDetails(id: any) {
    this.spinner.show()
    const { thresholdValue, quantity } = this.addThresholdForm.controls
    this.addThresholdForm.disable()
    this.partNumberId.disable()
    thresholdValue.enable()
    quantity.enable()
    const locationDrop = this.customersService.getThresholdDetails(id).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        // this.locationSelected = res.data.locationId
        // this.getCustomerFacingForInventory()
        const partdata = this.savedDetails.find(x => x.inventoryId == res.data.inventoryId)
        this.addThresholdForm.patchValue(res.data)
        this.partNumberId.patchValue(partdata.inventoryId)
        this.partNumberSelect(partdata.inventoryId)

      } else if (res.message) {
        this.toastrService.error(res.message)
      }
    })
    this.unsubscribe.push(locationDrop);
  }

  getCustomerFacingForInventory() {
    this.spinner.show();
    const Sub = this.inventoryService.getCustomerInventoryOverview(0, '', '', +this.locationSelected, '').subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedDetails = res?.data;
        if (this.thresholdId) {
          this.getThresholdDetails(this.thresholdId);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(Sub);
  }

  partNumberSelect(val: any) {
    this.customerFacing.patchValue(val)
    this.addThresholdForm.controls.inventoryId.patchValue(val)
  }
  addThreshold() {
    const addThresholdForm = this.addThresholdForm;
    if (addThresholdForm.invalid) {
      addThresholdForm.markAllAsTouched();
    } else if (!this.addThresholdForm.pristine) {
      this.callAddThresholdApi();
    }
  }

  callAddThresholdApi() {
    this.spinner.show();
    const addThresholdSub = this.customersService.addThreshold(this.addThresholdForm.getRawValue()).subscribe((res: any) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        if (this.componentAccessFor === "add-threshold" || this.componentAccessFor === "edit-threshold") {
          this.spinner.hide();
          this.navigateToThresholdListing();
        } else {
          // this.getThresholdDetailsById();
        }

        if (res?.message) {
          this.toastrService.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res?.message) {
          this.toastrService.error(res.message);
        }
      }
    });
    this.unsubscribe.push(addThresholdSub);
  }


  navigateToThresholdListing() {
    this.router.navigate(["orders", "view-orders", this.loggedCustomerId], {
      queryParams: {
        tab: "threshold-limit"
      }
    });
  }
}
