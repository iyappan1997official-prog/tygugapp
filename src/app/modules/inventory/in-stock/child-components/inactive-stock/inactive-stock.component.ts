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
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';

@Component({
  selector: 'app-inactive-stock',
  templateUrl: './inactive-stock.component.html',
  styleUrls: ['./inactive-stock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveStockComponent implements OnChanges {
  private _items$ = new BehaviorSubject<[]>([]);
  @Input() inActiveStocks: any;
  @Input() loggedInUserRole: string;
  pageSizeOptions: number[];
  @Input() pageNumber: number;
  @Input() pageSize: number;
  @Input() sortDescendingOrder: boolean = false;
  @Input() sortByColumn: string;
  @Output() paginate: any = new EventEmitter();
  @Output() updateStatus: any = new EventEmitter();
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
    const { quilts, totalCount } = this.inActiveStocks || {};
    if (changes.inActiveStocks && !!quilts?.length) {
      this._items$.next(quilts);
      this.length = totalCount;
      this.pageSizeOptions = [5, 10, 50, 100, 500, 1000];
      if (this.length < 5) {
        this.pageSizeOptions = [5, 10];
      }
    } else {
      this._items$.next([]);
      this.length = 0;
      this.pageSizeOptions = [5, 10, 50, 100, 500, 1000];
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

  checkQuiltsForOnHoldStatus(): boolean {
    const selectedQuilts: any[] = this.selectedRows;
    return selectedQuilts.every((quilt) => quilt.quiltStatusId === 4);
  }

  updateQuiltStatus() {
    if (!this.selectedRows.length) {
      this.toastrService.error("Please select one or more quilts to restore.")
    } else {
      const modalRef = this.modalService.open(ConfirmActionComponent, {
        size: "md",
        centered: true,
        windowClass: "modal-dialog-centered",
        backdrop: 'static'
      });
      modalRef.componentInstance.title = 'Restore Quilt';
      modalRef.componentInstance.body =
        "Please confirm that you want to restore the quilt(s).";

      let quiltIds: number[] = [];
      this.selectedRows.forEach((quilt) => quiltIds.push(quilt.id));
      modalRef.result.then(() => {
        const quiltStatusId = 4;
        this.updateStatus.emit({ quiltStatusId, quiltIds });
      }).catch((res) => { })
    }
  }
}
