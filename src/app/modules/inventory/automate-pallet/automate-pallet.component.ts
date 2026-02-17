import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InventoryService } from '../inventory.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActionPopupComponent } from 'src/app/shared/modules/action-popups/component/action-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneratePdfService } from "../../../shared/services/generate-pdf.service";


@Component({
  selector: 'automate-pallet',
  templateUrl: './automate-pallet.component.html',
  styleUrls: ['./automate-pallet.component.scss']
})
export class AutomatePalletComponent implements OnInit {
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  private subscriptions: Subscription[] = [];
  private _items$ = new BehaviorSubject<any[]>([]);
  allPartNumbers: any[] = [];
  searchText: string = undefined;
  errorMessage: string;
  hasError: boolean = false;
  maxLimitReached: boolean = false;
  hadQuilt: boolean = false
  startScan: boolean = false;
  output: any[] = [];
  valueAdd: boolean = false;
  partNumberValue: string;
  maxQuiltNo: number;
  automatePalletForm: FormGroup;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private ngbModal: NgbModal,
    private activatedRoute: ActivatedRoute,
    public generatePdfService: GeneratePdfService,
    private inventoryService: InventoryService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.tab === "automate-pallet") {
      this.getPartNumber();
    }
  }
  initForm() {
    this.automatePalletForm = this.fb.group({
      id: 0,
      palletStatusId: 0,
      masterQuiltTypeId: 0,
      description: "",
      totalQuilts: 0,
      quiltSerialNumbers: [
        ""
      ],
      partNumber: ""
    });
  }

  get formValues(): any {
    return this.automatePalletForm.getRawValue();
  }

  getPartNumber() {
    this.spinner.show();
    const partNumbers = this.inventoryService.getPartNumbersForAutomatePallet().subscribe((res) => {
      if (res.statusCode === 200) {
        this.allPartNumbers = res.data;
      } else {
        this.allPartNumbers = [];
        if (res.message) {
          this.toastr.error(res.message);
        }
      }
      this.spinner.hide();
    });
    this.subscriptions.push(partNumbers);
  }

  partNumberSelected(id: number) {
    this.output = [];
    if (id > 0) {      
      let findName = this.allPartNumbers.find(x => x.id === id).name;
      let maxQuilt = this.allPartNumbers.find(x => x.id === id).maxQuilts;
      if(maxQuilt && maxQuilt>0){
      this.startScan = true;
      this.partNumberValue = findName;
      this.maxQuiltNo = maxQuilt;
    }else{
      this.partNumberValue = '';
      this.maxQuiltNo = 0;
      this.openMaxQuiltErrorModal("Please set Max quilt value for partnumber first.")
    }
    } else {
      this.partNumberValue = '';
      this.maxQuiltNo = 0;
    }
  }
  public onError(e: any): void {
    alert(e)
  }



  startAdding(item: any, action: any) {
    
    action.data.isStopped = false

    if (!this.output.includes(item) && item && (this.output.length < this.maxQuiltNo)) {
      action.data.isStopped = true;
     
      this.spinner.show();
      const validQuiltArr = this.inventoryService.getValidQuilt(this.partNumberValue, item).subscribe((res) => {
        
        if (res?.statusCode === 200) {
          const newSerialNumber = res.data.serialNumber
          if (!this.output.includes(newSerialNumber)) {
            action.data.isStopped = false
            this.output.push(newSerialNumber);
          }
          if((this.output.length) === this.maxQuiltNo){
            action.stop()
      this.openActionModal(action);
      action.data.isStopped = false
          }
          this.spinner.hide();
        } else {
          this.spinner.hide();
          action.data.isStopped = true
          if (res.message) {
            action.stop()
            this.openErrorModal(res.message, action);
            action.data.isStopped = false
          }
        }
      });
      this.subscriptions.push(validQuiltArr);

      action.data.isStopped = true

    } else if (this.output.includes(item) && item) {
      // action.stop()
      // this.openErrorModal('Quilt already exists.', action) for already exist quilt comfirmation modal
      action.data.isStopped = false

    } else if ((this.output.length >= this.maxQuiltNo) && item) {
      action.stop()
      this.openActionModal(action);
      action.data.isStopped = false
      setInterval(() => {},1000)
    }

    // action.data.isStopped = false   To scan after error uncomment this

  }

  removeSerialNumber(array: any[], index: number, indexParentArray?: number) {
    array.splice(index, 1);
    if (array.length === 0) {
    }
  }

  savePallet(action: any) {
    action.stop();
    this.callCreatePalletApi();
  }

  callCreatePalletApi() {
    this.spinner.show();
    const automatePalletForm = this.automatePalletForm;
    const body = {
      ... this.formValues,
      partNumber: this.partNumberValue,
      quiltSerialNumbers: this.output
    }

    const generateSeriesSub = this.inventoryService.createAutomatPallet(body)
      .subscribe((res: any) => {
        this.automatePalletForm.markAsPristine();
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.generatePdfService.printPdfFile(res?.data)
          this.output = [];
          this.allPartNumbers = [];
          this.startScan = false;
          if (res?.message) {
            this.toastr.success(res.message);
          }
          this.getPartNumber()
          this.startScan = true
        } else {
          if (res?.message) {
            this.toastr.error(res.message);
          }
        }
      });
    this.subscriptions.push(generateSeriesSub);
    this.spinner.hide();
  }

  discardAction(action: any) {
    this.output = [];
    action.stop();
    this.router.navigate(["/inventory/quilts-inventory"], {
      queryParams: { tab: "automate-pallet" }
    });
  }

  openActionModal(action: any) {
    const modalRef = this.ngbModal.open(ActionPopupComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.title = 'Awesome';
    modalRef.componentInstance.body =
      "You have reached pallet's max limit.";
    modalRef.componentInstance.confirmBtnText = 'Save Pallet';
    modalRef.componentInstance.cancelBtnText = "Discard";
    modalRef.componentInstance.isSuccess = true

    modalRef.result
      .then(() => {
        this.callCreatePalletApi();
      })
      .catch((res) => {
        action.start();
       });
  }

  openErrorModal(message: string, action: any) {
    const modalRef = this.ngbModal.open(ActionPopupComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Invalid Quilt';
    modalRef.componentInstance.body = message;
    modalRef.componentInstance.showBackButton = false
    modalRef.componentInstance.confirmBtnText = "Skip and Continue";
    modalRef.result
      .then(() => {
        action.start()
      })
      .catch((res) => { });
  }
  openMaxQuiltErrorModal(message: string) {
    const modalRef = this.ngbModal.open(ActionPopupComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Max Quilt Error';
    modalRef.componentInstance.body = message;
    modalRef.componentInstance.showBackButton = false
    modalRef.componentInstance.confirmBtnText = "Ok";
    modalRef.result
      .then(() => {
        //action.start()
      })
      .catch((res) => { });
  }
}
