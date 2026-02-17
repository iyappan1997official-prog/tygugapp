import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { InventoryService } from '../inventory.service';
import { AddTableRowComponent } from './modal/add-table-row/add-table-row.component';

@Component({
  selector: 'quilt-definition',
  templateUrl: './quilt-definition.component.html',
  styleUrls: ['./quilt-definition.component.scss']
})
export class QuiltDefinitionComponent implements OnInit, OnDestroy {
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  private _items$ = new BehaviorSubject<any[]>([]);
  private _items$1 = new BehaviorSubject<any[]>([]);
  private _items$2 = new BehaviorSubject<any[]>([]);
  private subscriptions: Subscription[] = [];
  private unsubscribe: Subscription[] = [];
  isLoading: boolean = false;
  SortDescendingOrder: boolean = false;
  sortByColumn: string;

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private quiltService: InventoryService,
    private ngbModal: NgbModal,
    private activatedRoute: ActivatedRoute
  ) { }

  get items$() {
    return this._items$.asObservable();
  }

  get items$1() {
    return this._items$1.asObservable();
  }

  get items$2() {
    return this._items$2.asObservable();
  }

  ngOnInit(): void {
    if (this.tab === "quilt-definition") {
      this.getQuiltDefinition();
    }
  }


  getQuiltDefinition() {
    this.spinner.show();

    const quiltDef = this.quiltService.quiltDefinitionListing().subscribe((res) => {
      if (res.statusCode === 200) {
        this._items$.next(res.data);
        this.getQuiltConstruction();
      } else {
        this._items$.next([]);
        this.spinner.hide();

        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.subscriptions.push(quiltDef);
  };

  openConfirmDeleteModal(id: number, option: string) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
      backdrop: 'static'
    })

    modalRef.result.then(() => {
      if (option === "definition") {
        this.removeQuiltDefinition(id);
      } else if (option === "size") {
        this.removeQuiltSize(id);
      } else {
        this.removeQuiltConstruction(id);
      }
    }).catch((res) => { })
  }

  removeQuiltDefinition(id: number) {
    this.spinner.show();
    const deleteDef = this.quiltService.removeQuiltDefinition(id)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.getQuiltDefinition();
        } else if (res.message) {
          this.toastr.error(res.message);
          this.getQuiltDefinition();
        }
      }
      );
    this.unsubscribe.push(deleteDef);
  }

  getQuiltConstruction() {
    this.spinner.show();

    const quiltCons = this.quiltService.quiltConstructionListing().subscribe((res) => {
      if (res.statusCode === 200) {
        this._items$1.next(res.data);
        this.getQuiltSize();
      } else {
        this._items$1.next([]);
        this.spinner.hide();

        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.subscriptions.push(quiltCons);
  };

  removeQuiltConstruction(id: number) {
    this.spinner.show();
    const deleteCons = this.quiltService.removeQuiltConstruction(id)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.getQuiltConstruction();
        } else if (res.message) {
          this.toastr.error(res.message);
          this.getQuiltConstruction();
        }
      }
      );
    this.unsubscribe.push(deleteCons);
  }

  getQuiltSize() {
    this.spinner.show();

    const quiltSize = this.quiltService.quiltSizeListing().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this._items$2.next(res.data);
      } else {
        this._items$2.next([]);

        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.subscriptions.push(quiltSize);
  };

  openAddRowModal(addRowFor: string, option: string, id?: number) {
    const modalRef = this.ngbModal.open(AddTableRowComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    })

    modalRef.componentInstance.addRowFor = addRowFor;
    modalRef.componentInstance.rowId = id;
    modalRef.componentInstance.componentAccessFor = option;

    modalRef.result.then(({ id, construction, description, maxPallet, partNumber, size, type }) => {
      this.spinner.show();
      let body: any = { id, type };

      if (addRowFor === "definition") {
        body.description = description;
        body.partNumber = partNumber;
        body.maxPallet = maxPallet;
      } else if (addRowFor === "size") {
        body.size = size;
      } else {
        body.construction = construction;
      }

      this.callAddRowApi(body, addRowFor);
    }).catch((res) => { })
  }

  removeQuiltSize(id: number) {
    this.spinner.show();
    const deleteCons = this.quiltService.removeQuiltSize(id)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.getQuiltSize();
        } else if (res.message) {
          this.toastr.error(res.message);
          this.getQuiltSize();
        }
      }
      );
    this.unsubscribe.push(deleteCons);
  }

  callAddRowApi(body: any, option: string) {
    const quiltSize = this.quiltService.addRow(`inventory/quilt-${option}`, body).subscribe((res) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        if (option === "definition") {
          this.getQuiltDefinition();
        } else if (option === "size") {
          this.getQuiltSize();
        } else {
          this.getQuiltConstruction();
        }
        if (res.message) {
          this.toastr.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.subscriptions.push(quiltSize);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  sort(column: string, table: number) {

    // Toggle sorting direction
    if (this.sortByColumn === column) {
      this.SortDescendingOrder = !this.SortDescendingOrder;
    } else {
      this.sortByColumn = column;
      this.SortDescendingOrder = false;
    }

    let data: any[] = [];

    if (table === 1) { // Quilt Definition
      data = [...this._items$.value];
    }
    else if (table === 2) { // Quilt Construction
      data = [...this._items$1.value];
    }
    else if (table === 3) { // Quilt Size
      data = [...this._items$2.value];
    }

    // Perform sorting
    data.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Normalize null/undefined
      valA = valA == null ? '' : valA;
      valB = valB == null ? '' : valB;

      // Convert numbers to numbers, strings to lowercase strings
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();


      if (this.SortDescendingOrder)
        return valA < valB ? 1 : -1;

      return valA > valB ? 1 : -1;
    });

    // Push updates back into BehaviorSubject
    if (table === 1) {
      this._items$.next(data);
    }
    else if (table === 2) {
      this._items$1.next(data);
    }
    else if (table === 3) {
      this._items$2.next(data);
    }
  }
}
