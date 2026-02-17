import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StatesService } from 'src/app/shared/services/states.service';
import { FetchCountriesService } from 'src/app/shared/services/fetch-countries.service';
import { FetchOrderStatusService } from 'src/app/shared/services/fetch-order-status.service';
import { FetchOrderTypesService } from 'src/app/shared/services/fetch-order-types.service';
import { FetchQuiltTypesService } from 'src/app/shared/services/fetch-quilt-types.service';
import { CustomersService } from '../../customers/customers.service';
import { InventoryService } from '../../inventory/inventory.service';
import { SidebarService } from '../../sidebar/sidebar.service';
import { RegexService } from 'src/app/shared/services/regex.service';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddOrderComponent implements OnInit {
  viewOrderDetails: any = {};
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  customerId: string = this.activatedRoute?.snapshot?.queryParams?.customerId;
  orderId: string = this.activatedRoute?.snapshot?.params?.id;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  addOrderForm: FormGroup;
  arrData: any;
  allTypes: any[] = [];
  allStatus: any[] = [];
  allStates: any[] = [];
  allCountries: any[] = [];
  allQuiltTypes: any[] = [];
  allPartNumbers: any[] = [];
  searchText: string = undefined;
  quiltData: any = {};
  totalQuilt: number;
  totalLeased: number;
  totalPurchased: number;
  customerName: number = this.activatedRoute?.snapshot?.queryParams?.customerName;
  customerNumber: number = this.activatedRoute?.snapshot?.queryParams?.customerNumber;
  customerNameFromList: any;
  customerNumberFromList: any;
  oStatus: any[] = [{ id: false, name: 'Public' }, { id: true, name: 'Private' }]
  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private customersService: CustomersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private statesService: StatesService,
    private orderStatusService: FetchOrderStatusService,
    private countriesService: FetchCountriesService,
    private orderTypesService: FetchOrderTypesService,
    private quiltTypesService: FetchQuiltTypesService,
    private inventoryService: InventoryService,
    private sidebarService: SidebarService,
    private regexService: RegexService,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getPartNumbers();
    this.customerNameFromList = this.dataSharingService.data['customerName'];
    this.customerNumberFromList = this.dataSharingService.data['customerNumber'];
  }

  initForm() {
    this.addOrderForm = this.fb.group({
      id: 0,
      orderNumber: ["", [Validators.required, Validators.pattern(this.regexService.alphaNumericSpecialChar)]],
      orderTypeId: ["", [Validators.required]],
      orderDate: ["", [Validators.required]],
      orderStatusId: [1, [Validators.required]],
      totalQuilts: ["", [Validators.max(999999999)]],
      // isPrivate:[false,[Validators.required]],
      orderInfo: this.fb.array([]),

      thirdPartyBillingDetails: this.fb.group({
        id: 0,
        name: "",
        address: "",
        cityName: "",
        countryId: 0,
        stateId: 0,
        zip: "",
      })
    });
    this.addOrderInfo();
    this.addOrderForm.controls.orderStatusId.disable();
  }
  get orderInfo(): FormArray {
    return this.addOrderForm.get('orderInfo') as FormArray;
  }

  newOrderInfo(): FormGroup {
    return this.fb.group({
      id: 0,
      partNumberId: ["", [Validators.required]],
      quiltTypeId: { value: "", disabled: true },
      quiltsAdded: ["", [Validators.required]],
      addedOn: ["", [Validators.required]]
    })
  }
  addOrderInfo() {
    this.orderInfo.push(this.newOrderInfo());
  }

  deleteOrderInfo(index: number) {
    this.orderInfo.removeAt(index);
  }
  newOrderInfoWithData(data: any, i: number): FormGroup {
    return this.fb.group({
      id: [data[i].id ? data[i].id : 0],
      quiltTypeId: [data[i].quiltTypeId ? data[i].quiltTypeId : ''],
      quiltsAdded: [data[i].quiltsAdded ? data[i].quiltsAdded : ''],
      addedOn: [data[i].addedOn ? data[i].addedOn : '']
    })
  }

  updateQuiltsCount(control: AbstractControl, orderInfoArr: any) {
    const totalQuilts = this.addOrderForm.controls.totalQuilts as FormControl;

    control.valueChanges.pipe(debounceTime(2000)).subscribe((value) => {
      orderInfoArr.updateValueAndValidity();
      let totalQuiltsCount: number = 0;

      this.orderInfo?.getRawValue()?.forEach((info: any) => {
        totalQuiltsCount += +info.quiltsAdded;
      });
      totalQuilts.patchValue(+totalQuiltsCount);
      totalQuilts.markAsTouched();
    })
  }

  totalQuiltsCount(orderInfoArr: any[]) {
    const totalQuilts = this.addOrderForm.controls.totalQuilts as FormControl;
    let totalQuiltsCount: number = 0;
    orderInfoArr.forEach((info: any) => {
      totalQuiltsCount += +info.quiltsAdded;
    });
    totalQuilts.patchValue(+totalQuiltsCount);
  }

  resetForm() {
    const addOrderForm = this.addOrderForm;

    if (!addOrderForm.pristine) {
      if (this.componentAccessFor === "add-order") {
        this.initForm();
        this.allStates = [];
      } else {
        const { stateId, countryId } = this.viewOrderDetails?.thirdPartyBillingDetails || {};

        if (addOrderForm?.getRawValue()?.thirdPartyBillingDetails?.stateId !== stateId) {
          this.fetchAllStates(countryId);
        } else {
          this.orderInfo.clear();
          this.orderInfo.push(this.newOrderInfo());
          this.patchFormvalues();
        }
      }
    }
  }


  getTotalQuiltsData() {
    let apiCalled = false;
    const getAllLoc = this.sidebarService.sidebarNumbers.subscribe((sidebarNumbers) => {
      if (sidebarNumbers.length || apiCalled) {
        this.quiltData = sidebarNumbers;
      } else if (!apiCalled) {
        apiCalled = true;
        this.sidebarService.getTotalQuiltsCounts();
      }
    })
    this.unsubscribe.push(getAllLoc);
  }

  addOrderDetails() {
    this.spinner.show();
    let body = this.addOrderForm.getRawValue();
    //body.isPrivate=this.addOrderForm.controls.isPrivate.value=="1"?true:false;
    const addDetails = this.customersService.addOrderDetails(+this.customerId, body).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.getTotalQuiltsData();
        this.router.navigate(["orders", "view-orders", this.customerId], {
          queryParams: {
            tab: "orders",
            customerName: this.customerName,
            customerNumber: this.customerNumber
          }
        });
        if (res?.message) {
          this.toastr.success(res.message);
        }
      } else if (res?.message) {
        this.toastr.error(res.message);
      }
    })
    this.unsubscribe.push(addDetails);
  }

  addOrder() {
    const addOrderForm = this.addOrderForm;

    if (addOrderForm.invalid) {
      addOrderForm.markAllAsTouched();
    } else if (!this.addOrderForm.pristine) {
      this.addOrderDetails();
    }
  }

  getOrderDetails() {
    this.spinner.show();
    const orderDetails = this.customersService.getOrderDetails(+this.customerId, +this.orderId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.viewOrderDetails = res?.data;
        if (!this.allStates.length && res?.data?.thirdPartyBillingDetails && res?.data?.thirdPartyBillingDetails?.countryId !== 0) {
          this.fetchAllStates(res?.data?.thirdPartyBillingDetails?.countryId);
        } else {
          this.spinner.hide();
          this.patchFormvalues();
        }
      } else {
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(orderDetails);
  }

  patchFormvalues() {
    const orderDetails = this.viewOrderDetails || {};

    if (!!orderDetails) {
      this.addOrderForm.patchValue(orderDetails);

      const orderArr: any[] = this.viewOrderDetails?.orderInfo;
      if (!!orderArr) {
        orderArr.forEach((info: any, index: number) => {

          if (!!index) {
            this.orderInfo.push(this.newOrderInfo());
          }
          this.orderInfo.controls[index].patchValue(info);
        });
        this.totalQuiltsCount(orderArr);
      }
      if (orderArr && orderArr.length > 0) {
        this.disableRequiredFields();
        this.cd.detectChanges();
      }
    }
  }

  disableRequiredFields() {
    const { orderNumber, orderTypeId, orderDate } = this.addOrderForm.controls;

    orderNumber.disable();
    orderTypeId.disable();
    orderDate.disable();
    // isPrivate.disable();

    this.orderInfo.controls.forEach(group => {
      group.disable();
    });
  }

  resetState(countryId: number) {
    const thirdPartyBillingDetails = this.addOrderForm.controls.thirdPartyBillingDetails as FormGroup;
    thirdPartyBillingDetails.controls.stateId.reset("");
    this.fetchAllStates(countryId, false);
  }

  fetchAllStates(countryId: number, patchForm: boolean = true) {
    this.spinner.show();

    const orderDetailstSub = this.statesService.getAllStates(+countryId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.allStates = res?.data;

        if (!!patchForm) {
          this.patchFormvalues();
        }
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(orderDetailstSub);
  }

  getPartNumbers() {
    this.spinner.show();

    const partNumbersSub = this.inventoryService.getPartNumbers().subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allPartNumbers = res?.data;
        this.fetchAllCountries();
      } else {
        this.spinner.hide();
        this.allPartNumbers = [];
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(partNumbersSub);
  }

  partNumberMappedData(id: number, control: AbstractControl) {
    if (id > 0) {
      this.spinner.show();

      const mappedDataSub = this.inventoryService.getInventoryMappingByPartNumber(id).subscribe((res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          control.patchValue(res?.data?.quiltTypeIdForOrder);

        } else if (res.message) {
          this.toastr.error(res.message)
        }
      });
      this.unsubscribe.push(mappedDataSub);
    }
  }

  fetchAllCountries() {
    this.spinner.show();
    let apiCalled = false;
    const userRolesSub = this.countriesService.allCountries.subscribe((countries) => {
      if (countries.length || apiCalled) {
        this.allCountries = countries;
        this.fetchOrderStatus();
      } else if (!apiCalled) {
        apiCalled = true;
        this.countriesService.getAllCountries();
      }
    })
    this.unsubscribe.push(userRolesSub);
  }

  fetchOrderStatus() {
    let apiCalled = false;
    const orderStatusOption = this.orderStatusService.orderStatus.subscribe((status) => {
      if (status.length || apiCalled) {
        this.allStatus = status;
        this.fetchOrderTypes();
      } else if (!apiCalled) {
        apiCalled = true;
        this.orderStatusService.getAllStatus()
      }
    })
    this.unsubscribe.push(orderStatusOption);
  }

  fetchOrderTypes() {
    let apiCalled = false;
    const orderTypesOption = this.orderTypesService.orderTypes.subscribe((types) => {
      if (types.length || apiCalled) {
        this.allTypes = types;
        this.fetchQuiltTypes();
      } else if (!apiCalled) {
        apiCalled = true;
        this.orderTypesService.getAllTypes()
      }
    })
    this.unsubscribe.push(orderTypesOption);
  }

  fetchQuiltTypes() {
    let apiCalled = false;
    const quiltTypesOption = this.quiltTypesService.quiltTypes.subscribe((types) => {
      if (types.length && apiCalled) {
        this.allQuiltTypes = types;
        if (this.componentAccessFor === "edit-order") {
          this.getOrderDetails();
        } else {
          this.spinner.hide();
        }
      } else if (!apiCalled) {
        apiCalled = true;
        this.quiltTypesService.getQuiltTypes()
      }
    })
    this.unsubscribe.push(quiltTypesOption);
  }
}
