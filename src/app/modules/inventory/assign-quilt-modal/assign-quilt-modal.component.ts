import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-assign-quilt-modal',
  templateUrl: './assign-quilt-modal.component.html',
  styleUrls: ['./assign-quilt-modal.component.scss'],
})
export class AssignQuiltModalComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  allCustomers: any[] = [];
  allOrders: any[] = [];
  assignQuiltsForm: FormGroup;
  @Input() quiltsAssigned: number = 0;
  @Input() palletsAssigned: number = 0;
  @Input() componentAccessFor: string;
  private _items$ = new BehaviorSubject<[]>([]);
  private subscriptions: Subscription[] = [];
  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private inventoryService: InventoryService,
    public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private fetchCustomerService: FetchCustomersService,
    private fb: FormBuilder,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchAllCustomers();

    const { quiltsAssigned, palletsAssigned } = this.assignQuiltsForm.controls;
    quiltsAssigned.patchValue(this.quiltsAssigned);
    palletsAssigned.patchValue(this.palletsAssigned);
  }

  initForm() {
    this.assignQuiltsForm = this.fb.group({
      customerId: ["", [Validators.required]],
      customerNumber: { value: "", disabled: true },
      orderNumber: ["", [Validators.required]],
      quiltsAssigned: { value: "", disabled: true },
      palletsAssigned: { value: "", disabled: true }
    });
  }

  fetchAllCustomers() {
    this.spinner.show();

    let apiCalled = false;
    const allCustomersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
      if (customers.length && apiCalled) {
        this.allCustomers = customers;
      } else if (!apiCalled) {
        apiCalled = true;
        this.fetchCustomerService.getAllCustomers(true, false);
      }
      this.spinner.hide();
    })

    this.unsubscribe.push(allCustomersSub);
  }

  getOrdersByCustomerId(customer: any) {
    const { id, customerNumber } = customer || {};
    const { customerId, customerNumber: customerNumberControl } = this.assignQuiltsForm.controls;

    if (customerId != id) {
      this.spinner.show();
      customerNumberControl.patchValue(customerNumber);

      const individualInStockSub = this.inventoryService.getOrdersByCustomerId(id).subscribe((res) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.allOrders = res?.data;
        } else {
          this.allOrders = [];
          if (res.message) {
            this.toastrService.error(res.message)
          }
        }
      })
      this.unsubscribe.push(individualInStockSub);
    }
  }

  callAssignApi() {
    if (this.assignQuiltsForm.invalid) {
      this.assignQuiltsForm.markAllAsTouched();
    } else {
      this.modal.close(this.assignQuiltsForm.getRawValue());
    }
  }

  //   getOrder(id: any) {
  //     const {customerId}: any = 
  //       this.assignQuiltsForm.getRawValue()

  //     const orderList = this.inventoryService.getQuiltsOrderInfo(customerId, id).subscribe((res) => {
  //       this.spinner.hide();
  //       if (res.statusCode === 200) {
  //         this._items$.next(res.data);
  //       } else {
  //         this._items$.next([]);
  //         if (res.message) {
  //           this.toastrService.error(res.message)
  //         }

  //       }
  //     })
  //     this.subscriptions.push(orderList);
  // };

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
