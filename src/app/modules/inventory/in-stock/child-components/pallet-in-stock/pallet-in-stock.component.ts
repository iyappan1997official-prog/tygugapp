import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import { AssignQuiltModalComponent } from '../../../assign-quilt-modal/assign-quilt-modal.component';
import { InventoryService } from '../../../inventory.service';
import { UpdateStatusModalComponent } from '../../../update-status-modal/update-status-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'pallet-in-stock',
  templateUrl: './pallet-in-stock.component.html',
  styleUrls: ['./pallet-in-stock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PalletInStockComponent implements OnInit, OnChanges {
  private _items$ = new BehaviorSubject<[]>([]);
  @Input() pallets: any[] = [];
  @Input() palletLength: number;
  @Output() refreshData = new EventEmitter<any>();
  @Input() pageNumber: number;
  @Input() pageSize: number;
  @Output() paginate: any = new EventEmitter();
  @Output() assignQuilts: any = new EventEmitter();
  @Input() allPalletsStatus: any[] = [];
  @Input() loggedInUserRole: Roles;
  @Output() updateStatus: any = new EventEmitter();
  pageSizeOptions: number[];
  private subscriptions: Subscription[] = [];
  private unsubscribe: Subscription[] = [];
  palletListForm: FormGroup;
  length: number;
  isLoading: boolean = false;
  palletIds: any[] = []
  public roleEnum = Roles;
  // borderStyle: string;
  get items$() {
    return this._items$.asObservable();
  }

  pageEvent: PageEvent;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private generatePdfService: GeneratePdfService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.refreshData.emit()
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.palletIds = [];
    this.pageSizeOptions = [5, 10, 50, 100];
    if (!this.pageSizeOptions.includes(this.palletLength)) {
      this.pageSizeOptions.push(this.palletLength)
    }
    if (this.palletLength < 5) {
      this.pageSizeOptions = [5, 10];
    }
    // const { pallets, totalCount } = this.pallets || {};

    // if (changes.pallets || !!pallets?.length) {
    //   this._items$.next(pallets);
    //   this.length = totalCount;
    //   console.log(this.length);

    // } else {
    //   this._items$.next([]);
    //   this.length = 0;
    // }
  }

  // ngOnInit(): void {
  //   this.palletIds.includes("");
  //   console.log(this.palletIds);
  // }


  borderStyle = 'card-default';

  selectPallet(pallet: any): void {
    if (!this.palletIds.includes(pallet)) {
      this.palletIds.push(pallet);
    } else {
      const index = this.palletIds.indexOf(pallet);
      this.palletIds.splice(index, 1);
    }
  }

  printQrCodes() {
    if (!!this.palletIds.length) {
      let serialNumbers: string[] = [];
      this.palletIds.forEach((pallet: any) => serialNumbers.push(pallet?.serialNumber));
      this.generatePdfService.rePrintQrCodeBySerialNumber(serialNumbers);
      // this.palletIds = [];
    } else {
      this.toastr.error("Please select pallets");
    }
  }

  openConfirmDeleteModal(palletId: number) {
    const modalRef = this.modalService.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      this.removePallet(palletId);
    }).catch((res) => { })
  }

  removePallet(palletId: number) {
    this.spinner.show();
    const deletePallet = this.inventoryService.removePallet(+palletId)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.refreshData.emit();
          if (res.message) {
            this.toastr.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deletePallet);
  }

  navigateToViewPalletDetails(id: any) {
    this.router.navigate(["/inventory/quilts-inventory/pallet-details", id])
  }

  assignPalletsToCustomer() {
    if (this.palletIds?.length && this.checkPalletsForOnHandStatus() === false) {
      this.toastr.error('Only pallets with the "On Hand" status can be assigned to customers.')
    } else if (!this.palletIds?.length) {
      this.toastr.error("Please choose at least one On Hand pallet.")
    }
    else {
      const modalRef = this.modalService.open(AssignQuiltModalComponent, {
        size: "md",
        centered: true,
        windowClass: "modal-dialog-centered",
        backdrop: 'static'
      });

      let totalQuilts: number = 0;
      let palletIds: number[] = [];
      this.palletIds.forEach((pallet) => {
        palletIds.push(pallet.id)
        totalQuilts += pallet?.quilts?.length;
      });
      modalRef.componentInstance.palletsAssigned = this.palletIds.length;
      modalRef.componentInstance.quiltsAssigned = totalQuilts;
      modalRef.componentInstance.componentAccessFor = "Pallets";
      modalRef.result.then(({ orderNumber }) => {
        this.spinner.show();
        this.assignQuilts.emit({ orderNumber, palletIds });
      }).catch((res) => { })
    }
  }

  checkPalletsForOnHandStatus(): boolean {
    const selectedPallets: any[] = this.palletIds;
    return selectedPallets.every((pallet) => pallet.palletStatus === "On Hand");
  }

  updatePalletStatus() {
    this.toastr.error("Pallet status update is disabled.");
    return;
    if (!this.palletIds.length) {
      this.toastr.error("Please select one or more pallets to update their status.")
    } else {
      const modalRef = this.modalService.open(UpdateStatusModalComponent, {
        size: "md",
        centered: true,
        windowClass: "modal-dialog-centered",
        backdrop: 'static'
      });

      let palletIds: number[] = [];
      console.log(this.loggedInUserRole);

      this.palletIds.forEach((pallet) => palletIds.push(pallet.id));
      modalRef.componentInstance.allStatus = this.allPalletsStatus;
      modalRef.componentInstance.serviceRole = [this.roleEnum.serviceManager, this.roleEnum.serviceUser].includes(this.loggedInUserRole) ? true : false;
      modalRef.componentInstance.fromPallet = true;
      modalRef.result.then((resObject) => {
        this.spinner.show();
        const { quiltStatusId, retiredStatusId, quiltRepairTypes } = resObject
        console.log(modalRef.componentInstance.fromPallet);
        this.spinner.hide();
        this.updateStatus.emit({ palletStatusId: quiltStatusId, retiredStatusId, quiltRepairTypes,palletIds });
      }).catch((res) => { })
    }
  }

}
