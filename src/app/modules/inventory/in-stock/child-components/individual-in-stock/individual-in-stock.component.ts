import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { AssignQuiltModalComponent } from '../../../assign-quilt-modal/assign-quilt-modal.component';
import { CreatePalletModalComponent } from '../../../create-pallet-modal/create-pallet-modal.component';
import { InventoryService } from '../../../inventory.service';
import { UpdateStatusModalComponent } from '../../../update-status-modal/update-status-modal.component';
import { ScannerModalComponent } from '../../../scanner-modal/scanner-modal.component';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'individual-in-stock',
  templateUrl: './individual-in-stock.component.html',
  styleUrls: ['./individual-in-stock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndividualInStockComponent implements OnChanges {
  private _items$ = new BehaviorSubject<[]>([]);
  public roleEnum = Roles;
  @Input() individualStocks: any;
  @Input() loggedInUserRole: Roles;
  pageSizeOptions: number[];
  @Input() pageNumber: number;
  @Input() pageSize: number;
  @Input() sortDescendingOrder: boolean = false;
  @Input() sortByColumn: string;
  @Input() allQuiltsStatus: any[] = [];
  @Output() paginate: any = new EventEmitter();
  @Output() updateStatus: any = new EventEmitter();
  @Output() createMockPallet: any = new EventEmitter();
  @Output() assignQuilts: any = new EventEmitter();
  @Output() sortbtn: any = new EventEmitter();

  length: number;
  selectedRows: any[] = [];
  newQuilts: any[] = [];
  quiltDetail: any[] = [];

  get items$() {
    return this._items$.asObservable();
  }

  constructor(
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private inventoryService: InventoryService,
    private router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const { quilts, totalCount } = this.individualStocks || {};
    if (changes.individualStocks && !!quilts?.length) {
      this._items$.next(quilts);
      this.length = totalCount;
      this.pageSizeOptions = [5, 10, 50, 100, 500, 1000];
      // if (!this.pageSizeOptions.includes(this.length)) {
      //   this.pageSizeOptions.push(this.length)
      // }
      if (this.length < 5) {
        this.pageSizeOptions = [5, 10];
      }
    } else {
      this._items$.next([]);
      this.length = 0;
      this.pageSizeOptions = [5, 10, 50, 100, 500, 1000];
      // if (!this.pageSizeOptions.includes(this.length)) {
      //   this.pageSizeOptions.push(this.length)
      // }
      if (this.length < 5) {
        this.pageSizeOptions = [5, 10];
      }
    }
  }

  get isAllSelected(): boolean {
    return this.tableData.every((element) => this.selectedRows.some((row) => row.serialNumber === element.serialNumber));
  }

  get tableData(): any[] {
    return this._items$.getValue();
  }
  masterToggle(checked: boolean) {
    if (!!checked) {
      this.clearSelection();
      this.selectedRows.push(...this.tableData)
    } else {
      this.clearSelection();
    }
  }

  checkStockInSelectedRows(stock: any) {
    return this.selectedRows.some(element => element.serialNumber === stock.serialNumber);
  }

  selectRows(stock: any, checked: boolean) {
    if (!!checked) {
      this.selectedRows.push(stock)
    } else {
      let selectedIndex = this.selectedRows.findIndex(element => element.serialNumber === stock.serialNumber);
      this.selectedRows.splice(selectedIndex, 1);
    }
  }

  clearSelection(clearAll: boolean = false) {
    if (clearAll === false) {
      this.tableData.forEach((row) => {
        const index: number = this.selectedRows.findIndex((element: any) => element.serialNumber === row.serialNumber);
        if (index !== -1) {
          this.selectedRows.splice(index, 1);
        }
      })
    } else {
      this.selectedRows = [];
    }
  }

  updateQuiltStatus() {
    if (!this.selectedRows.length) {
      this.toastrService.error("Please select one or more quilts to update their status.")
    } else {
      const modalRef = this.modalService.open(UpdateStatusModalComponent, {
        size: "md",
        centered: true,
        windowClass: "modal-dialog-centered",
        backdrop: 'static'
      });

      let quiltIds: number[] = [];
      this.selectedRows.forEach((quilt) => quiltIds.push(quilt.id));
      modalRef.componentInstance.allStatus = this.allQuiltsStatus;
      modalRef.componentInstance.serviceRole = [this.roleEnum.serviceManager, this.roleEnum.serviceUser].includes(this.loggedInUserRole) ? true : false;
      modalRef.componentInstance.retiredSelected = false
      const selectedQuilt = this.selectedRows[0];
      modalRef.componentInstance.currentStatusId = selectedQuilt.quiltStatusId;
      modalRef.result.then((resObject) => {
        debugger
        this.spinner.show();
        const { quiltStatusId, retiredStatusId, quiltRepairTypes } = resObject
        this.spinner.hide();
        this.updateStatus.emit({ quiltStatusId, retiredStatusId, quiltRepairTypes,quiltIds });
      }).catch((res) => { })
    }
  }

  assignQuiltsToCustomer() {
    if (this.selectedRows?.length && this.checkQuiltsForOnHoldStatus() === false) {
      this.toastrService.error('Only quilts with "On Hand" status can be assigned to customer')
    } else if (!this.selectedRows?.length) {
      this.toastrService.error("Please choose atleast one On Hand quilt")
    }
    else {
      const modalRef = this.modalService.open(AssignQuiltModalComponent, {
        size: "md",
        centered: true,
        windowClass: "modal-dialog-centered",
        backdrop: 'static'
      });

      let quiltIds: number[] = [];
      this.selectedRows.forEach((quilt) => quiltIds.push(quilt.id));
      modalRef.componentInstance.quiltsAssigned = this.selectedRows.length;
      modalRef.componentInstance.componentAccessFor = "Quilts";

      modalRef.result.then(({ orderNumber }) => {
        this.spinner.show();
        this.assignQuilts.emit({ orderNumber, quiltIds });
      }).catch((res) => { })
    }
  }

  checkQuiltsForOnHoldStatus(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    return selectedQuilts.every((quilt) => quilt.quiltStatusId === 4);
  }

  createPalletModal() {
    const selectedRows = this.selectedRows;

    if (!selectedRows?.length) {
      this.openMockPalletModal();
    }
    // else if (!selectedRows?.length && [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser].includes(this.loggedInUserRole)) {
    //   this.openScannerModal();
    // }
    else if (selectedRows?.length) {
      const isAllQuiltsStatuesSame: boolean = this.checkQuiltsForSameStatus();
      if (!!isAllQuiltsStatuesSame) {
        this.inventoryService.allQuiltsToCreatePallet.next(selectedRows);
        this.router.navigate(["/inventory/quilts-inventory/create-pallet"]);
      } else {
        this.showErrMsgForSameQuiltsStatus();
        this.selectedRows = []
      }
    } else {
      this.showErrMsgForSameQuiltsStatus();
    }
  }

  showErrMsgForSameQuiltsStatus() {
    const selection = this.selectedRows;
    if (!selection?.length && [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser].includes(this.loggedInUserRole)) {
      this.toastrService.error("To create a pallet, please choose at least one quilt.");
    }
    else {
      this.toastrService.error("To create a pallet, choose quilts with the same status and types.");
    }
  }

  checkQuiltsForSameStatus(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    let valueOf = selectedQuilts.every((quilt, i, selectedQuilts) => {
      if (selectedQuilts[0].quiltStatusId === undefined) {
        return selectedQuilts[i].statusId === selectedQuilts[0].statusId && quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId
      } else {
        return selectedQuilts[i].quiltStatusId === selectedQuilts[0].quiltStatusId && quilt.masterQuiltTypeId === selectedQuilts[0].masterQuiltTypeId
      }
    })
    return valueOf
  }

  openMockPalletModal() {
    const modalRef = this.modalService.open(CreatePalletModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    });
    if ([this.roleEnum.masterAdmin, this.roleEnum.warehouseUser].includes(this.loggedInUserRole)) {
      modalRef.componentInstance.masterUsers = true
    }
    modalRef.result.then((data) => {
      this.spinner.show();
      const typeOfData = typeof data;
      if (typeOfData == "number") {
        this.createMockPallet.emit(data);
      } else {
        this.spinner.hide();
        this.selectedRows = data;
        this.createPalletModal();
      }
    }).catch((res) => { })
  }

  openScannerModal() {
    const modalRef = this.modalService.open(ScannerModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })

    modalRef.result.then((result) => {
      this.spinner.show();
      this.quiltDetail = result.output;
      const detailsBySerialNumberSub = this.inventoryService.getQuiltPalletDetailsBySerialNumber(this.quiltDetail, false, true).subscribe(res => {
        this.spinner.hide();
        if (res.statusCode == 200) {
          res?.data?.forEach((quilt: any) => {
            if (quilt.quilts === null) {
              this.newQuilts.push(quilt);
              this.selectedRows = this.newQuilts
              const isAllQuiltsStatuesSame: boolean = this.checkQuiltsForSameStatus();
              if (!!isAllQuiltsStatuesSame) {
                this.inventoryService.allQuiltsToCreatePallet.next(this.selectedRows);
                // this.router.navigate(["/inventory/quilts-inventory/create-pallet"]);
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


}
