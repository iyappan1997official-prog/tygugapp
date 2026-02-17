import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentsService } from '../shipments.service';
import { InventoryService } from '../../inventory/inventory.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActionPopupComponent } from 'src/app/shared/modules/action-popups/component/action-popup.component';

@Component({
  selector: 'app-receiveall-modal',
  templateUrl: './receiveall-modal.component.html',
  styleUrls: ['./receiveall-modal.component.scss']
})
export class ReceiveallModalComponent implements OnInit {

  receiveAllForm: FormGroup;
  customerId: any;
  sourceLocation: any;
  GetQuiltPalletDetailsBySerialNumber: any

  constructor(private fb: FormBuilder, private shipmentsService: ShipmentsService, private inventoryService: InventoryService, private dialogRef: MatDialogRef<ReceiveallModalComponent>, private modalService: NgbModal,) { }

  ngOnInit(): void {
    this.loadStoredData();
    this.initializeForm();
  }

  // Load data from localStorage and initialize customerId
  loadStoredData(): void {
    const storedResponse = localStorage.getItem('GetQuiltPalletDetailsBySerialNumber');
    if (storedResponse) {
      this.GetQuiltPalletDetailsBySerialNumber = JSON.parse(storedResponse);
      this.customerId = this.GetQuiltPalletDetailsBySerialNumber.data[0]?.customerId;
      this.getSourceLocation();
    }
  }

  // Initialize the form with validation rules
  initializeForm(): void {
    this.receiveAllForm = this.fb.group({
      protectedCount: ['', [Validators.required]],
      autoshipSourceLocationId: ['', [Validators.required]]
    });
  }

  getSourceLocation() {
    this.shipmentsService.getLocationsByCustomerId(this.customerId, true).subscribe(res => {
      this.sourceLocation = res.data

    })
  }

  onSubmit() {
    if (this.receiveAllForm.valid) {

      const body = {
        orderId: this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.orderId || 0,
        customerId: this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.customerId || 0,
        customerName: this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.customerName || '',
        orderNumber: this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.orderNumber || 0,
        orderStatusId: this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.orderStatusId || 0,
        mockPalletId: this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.mockPalletId || 0,  
        sendEmail: false,
        ignoreInvalidQuilts: false,
        receiveAndCreatePallet: false,
        inventories: [this.GetQuiltPalletDetailsBySerialNumber?.data[0]?.serialNumber || ''],
        protectedCount: this.receiveAllForm.value.protectedCount,
        autoshipSourceLocationId: this.receiveAllForm.value.autoshipSourceLocationId,
        ignoreProtectedShipmentConfirmation: true,

      }
      this.inventoryService.receiveShipment(body).subscribe((res: any) => {
        this.dialogRef.close();
        if (res?.message) {
          this.openActionModal(res.message, res.data);
        }
      })

    }
  }

  openActionModal(msg: string, data: any) {
    const modalRef = this.modalService.open(ActionPopupComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.title = 'Awesome';
    modalRef.componentInstance.body = msg;
    modalRef.componentInstance.confirmBtnText = 'Ok';
    modalRef.componentInstance.showBackButton = false
    modalRef.componentInstance.isSuccess = true
  }

  // Helper function to check if the form control has an error
  hasError(controlName: string, errorName: string) {
    return this.receiveAllForm.controls[controlName].hasError(errorName) && this.receiveAllForm.controls[controlName].touched;
  }

}
