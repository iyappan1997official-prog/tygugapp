import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { CustomersService } from '../../customers/customers.service';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

@Component({
  selector: 'app-add-carrier',
  templateUrl: './add-carrier.component.html',
  styleUrls: ['./add-carrier.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddCarrierComponent implements OnInit, OnDestroy {
  addCarrierForm: FormGroup;
  carrierId: number | string = this.activatedRoute?.snapshot?.params?.id;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  customerId: number = this.activatedRoute?.snapshot?.queryParams?.customerId;
  savedCarrierDetails: any = {};
  private unsubscribe: Subscription[] = [];
  customerName: number = this.activatedRoute?.snapshot?.queryParams?.customerName;
  customerNumber: number = this.activatedRoute?.snapshot?.queryParams?.customerNumber;
  customerNameFromList: any;
  customerNumberFromList: any;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private customersService: CustomersService,
    private regexService: RegexService,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.customerNameFromList = this.dataSharingService.data['customerName'];
    this.customerNumberFromList = this.dataSharingService.data['customerNumber'];
    if (["edit-carrier"].includes(this.componentAccessFor)) {
      this.getCarrierDetailsById();
    }
  }

  initForm() {
    this.addCarrierForm = this.fb.group({
      id: 0,
      name: ["", [Validators.required]],
      phoneNumber: ["", [Validators.maxLength(15), Validators.pattern(this.regexService.allPhoneNumber)]],
      additionalNotes: "",
      isPreferred: [false, [Validators.required]],
      customerId: "",
    });
  }

  getCarrierDetailsById() {
    this.spinner.show();
    const carrierDetailstSub = this.customersService.getCarrierDetailsById(+this.carrierId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedCarrierDetails = res?.data;
        this.patchFormvalues();
      } else {
        this.navigateToCarriersListing();
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(carrierDetailstSub);
  }

  patchFormvalues() {
    const carrierDetails = this.savedCarrierDetails || {};

    if (!!carrierDetails) {
      this.addCarrierForm.patchValue(carrierDetails);
    }
    this.cd.detectChanges();
  }

  navigateToCarriersListing() {
    this.router.navigate(["orders", "view-orders", this.customerId], {
      queryParams: {
        tab: "carrier",
        customerName: this.customerName,
        customerNumber: this.customerNumber
      }
    });
  }

  resetForm() {
    if (this.componentAccessFor === "add-carrier") {
      this.addCarrierForm.reset({ id: 0, isPreferred: false });
    } else {
      this.patchFormvalues();
    }
  }

  addCarrier() {
    const addCarrierForm = this.addCarrierForm;
    if (addCarrierForm.invalid) {
      addCarrierForm.markAllAsTouched();
    } else if (!this.addCarrierForm.pristine) {
      this.callAddCarrierApi();
    }
  }

  callAddCarrierApi() {
    this.spinner.show();
    this.addCarrierForm.controls.customerId.patchValue(+this.customerId);

    const addCarrierSub = this.customersService.addCarrier(this.addCarrierForm.getRawValue())
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.navigateToCarriersListing();

          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else if (res?.message) {
          this.toastrService.error(res.message);
        }
      });
    this.unsubscribe.push(addCarrierSub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
