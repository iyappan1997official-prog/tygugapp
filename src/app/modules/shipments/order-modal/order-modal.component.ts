import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ShipmentsService } from '../shipments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewShipmentComponent } from '../view-shipment/view-shipment.component'
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss']
})
export class OrderModalComponent implements OnInit {
  private _items$ = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  shipId: number = this.activatedRoute?.snapshot?.params?.id
  get items$() {
    return this._items$.asObservable();
  }
  orderDetails: any;
  isLoading: boolean = false;
  // 🔽 Drill-down data
  groupedShipmentDetails: any[] = [];
  unassignedQuilts: any[] = [];
  sortByColumn: string;
  SortDescendingOrder: boolean = false;

  constructor(public modal: NgbActiveModal,
    private activatedRoute: ActivatedRoute,
    private shipmentsService: ShipmentsService,
    private pdfService: GeneratePdfService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,) { }


  ngOnInit(): void {
    this.getAllShipmentDetails();
  }

  getAllShipmentDetails() {
    this.isLoading = true;

    const shipmentDetailSub = this.shipmentsService
      .getShipmentDetails(this.shipId)
      .subscribe((res) => {

        if (res.statusCode === 200) {

          const details = res?.data?.shipmentInfo || [];
          this._items$.next(details);
          this.orderDetails = res?.data;
          this.groupedShipmentDetails = res?.data?.pallets || [];
          this.unassignedQuilts = res?.data?.unassignedQuilts || [];


        } else {

          this._items$.next([]);
          this.groupedShipmentDetails = [];
          this.unassignedQuilts = [];

          if (res.message) {
            this.toastr.error(res.message);
          }
        }

        this.isLoading = false;
      });

    this.unsubscribe.push(shipmentDetailSub);
  }


  togglePallet(index: number) {
    this.groupedShipmentDetails[index].isExpanded =
      !this.groupedShipmentDetails[index].isExpanded;
  }

  getBillOfLading() {
    const billOfLadingSub = this.pdfService.getBillOfLading(this.shipId);
  }

  extractNumber(value: string): number {
    if (!value) return 0;
    const match = value.match(/\d+/); // gets numeric part
    return match ? Number(match[0]) : 0;
  }
  sortPalletSerial(column: string) {

    if (this.sortByColumn === column) {
      this.SortDescendingOrder = !this.SortDescendingOrder;
    } else {
      this.sortByColumn = column;
      this.SortDescendingOrder = false;
    }

    this.groupedShipmentDetails.sort((a, b) => {

      const valA = this.extractNumber(a[column]);
      const valB = this.extractNumber(b[column]);

      if (this.SortDescendingOrder) {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });
  }

}

