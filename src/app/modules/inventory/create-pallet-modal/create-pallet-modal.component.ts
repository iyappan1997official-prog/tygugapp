import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegexService } from 'src/app/shared/services/regex.service';
import { InventoryService } from '../inventory.service';
import { ToastrService } from 'ngx-toastr';
import { ScannerModalComponent } from '../scanner-modal/scanner-modal.component';
import { Router } from '@angular/router';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-create-pallet-modal',
  templateUrl: './create-pallet-modal.component.html',
  styleUrls: ['./create-pallet-modal.component.scss']
})
export class CreatePalletModalComponent implements OnInit {
  quiltsQuantity: FormControl = new FormControl("", [Validators.min(1), Validators.max(99999), Validators.pattern(this.regexService.number)]);
  detailsBySerialNumber: FormControl = new FormControl("");
  showError:boolean=false;
  newQuilts: any[] = [];
  newPallets: any[] = [];
  palletSerialNumber: any[] = []
  dataOfSerial: any;
  dataOfSerial1: any;
  newSerialNumber: any[] = [];
  newSerialNUmber1: any[] = [];
  selectedRows: any[] = [];
  arrowErrorShow: boolean = false;
  shipErrorShow: boolean = false;
  masterUsers: boolean = false;
  loggedInUserRole: Roles;
  userDetails: any;

  constructor(public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private authService: AuthService,
    private toastrService: ToastrService,
    private regexService: RegexService) { }

    ngOnInit(): void {
      this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
      this.loggedInUserRole = this.userDetails?.roles[0];
      if(this.loggedInUserRole===Roles.masterAdmin || this.loggedInUserRole===Roles.serviceManager){
        this.masterUsers=true;
      }
    }

  assignDataToArrays(data: any) {
    this.detailsBySerialNumber.reset();
    data?.forEach((quilt: any) => {
      if (quilt.quilts === null) {
        if (!this.newQuilts.some(x => x.id === quilt.id))
          this.newQuilts.push(quilt);
      } else {
        if (!this.newPallets.some(x => x.id === quilt.id)) {
          this.newPallets.push(quilt);
          this.palletSerialNumber.push(quilt.serialNumber);
        }
      }
    });
  }

  getDetailsBySerialNumber() {
    this.showError=false;
    this.arrowErrorShow = true;
    if (!!this.detailsBySerialNumber.value) {
      this.arrowErrorShow = false;
      this.shipErrorShow = false;
      this.spinner.show();

      let commaSeperatedValues = new Array();
      commaSeperatedValues = this.detailsBySerialNumber.value.split(",");

      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(commaSeperatedValues,false,true).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          this.detailsBySerialNumber.markAsDirty();
          if ((this.newQuilts && this.newQuilts.length && this.newQuilts.length > 0)) {
            if ((this.newQuilts.length > 0 && this.newQuilts[0].customerId === res?.data[0].customerId)) {
              this.assignDataToArrays(res?.data);
              this.dataOfSerial1 = res?.data;
            } else {
              this.toastrService.error("Customer is different from existing customer's Quilts.")
            }
          } else {
            this.assignDataToArrays(res?.data);
            this.dataOfSerial = res?.data;
          }
        } else {
          if (res.message) {
            this.toastrService.error(res.message);
          }
        }
      })
    }
  }

  openScannerModal() {
    const modalRef = this.modalService.open(ScannerModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })

    modalRef.result.then((result: any) => {
      this.spinner.show();
      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(result.output,false,true).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          res?.data?.forEach((quilt: any) => {
            if (quilt.quilts === null) {
              this.newQuilts.push(quilt);
              this.selectedRows = this.newQuilts
              const isAllQuiltsStatuesSame: boolean = this.checkQuiltsForSameStatus();
              if (!!isAllQuiltsStatuesSame) {
                this.inventoryService.allQuiltsToCreatePallet.next(this.selectedRows);
                modalRef.close();
              }
            }
          });
        } else {
          if (res.message) {
            this.toastrService.error(res.message)
          }
        }
      })
    });
  }

  removeSerialNumber(array: any[], index: number, indexParentArray?: number) {
    array.splice(index, 1);
    if (!array.length && indexParentArray != undefined) {
      this.newPallets.splice(indexParentArray, 1);
    }
    if (indexParentArray != undefined) {
      this.newPallets.forEach((quilt: any) => {
        quilt.quilts.forEach((item: any) => {
          this.newQuilts.push(item);
          this.newPallets.splice(indexParentArray, 1);
        })
      });
    }
  }

  checkQuiltsForSameStatus(): boolean {
    const selectedQuilts: any[] = this.newQuilts;
    let valueOf = selectedQuilts.every((quilt, i, selectedQuilts) => {
      if (selectedQuilts[0].quiltStatusId === undefined) {
        return selectedQuilts[i].statusId === selectedQuilts[0].statusId && quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId
      } else {
        return selectedQuilts[i].quiltStatusId === selectedQuilts[0].quiltStatusId && quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId
      }
    })
    return valueOf
    // return selectedQuilts.every((quilt) => quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId && quilt.quiltStatusId === selectedQuilts[0].quiltStatusId)
  }

  createMockPallet() {
    this.showError=false;
    if (this.quiltsQuantity.value && !this.newQuilts.length) {
      this.modal.close(+this.quiltsQuantity.value);
    } else if (this.newQuilts.length) {
      const isAllQuiltsStatuesSame: boolean = this.checkQuiltsForSameStatus();
      this.quiltsQuantity.clearValidators();
      this.quiltsQuantity.updateValueAndValidity();
      if (!!isAllQuiltsStatuesSame) {
        this.modal.close(this.newQuilts);
      } else {
        this.toastrService.error("To create a pallet, choose quilts with the same status and types.");
      }
    }else{
      this.showError=true;
    }
  }
}