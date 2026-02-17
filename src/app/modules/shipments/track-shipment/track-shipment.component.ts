import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReceiveComponent } from '../receive/receive.component';
import { ShipComponent } from '../ship/ship.component';
import { ViewShipmentComponent } from '../view-shipment/view-shipment.component';

enum Tabs {
  "view-shipment" = 0,
  "ship" = 1,
  "receive" = 2,
}

@Component({
  selector: 'app-track-shipment',
  templateUrl: './track-shipment.component.html',
  styleUrls: ['./track-shipment.component.scss']
})
export class TrackShipmentComponent implements OnInit {
  tabChangeSub: Subscription;
  tabIndex: number | string = 0;
  @ViewChild(ViewShipmentComponent) viewShipmentComponent: ViewShipmentComponent;
  @ViewChild(ShipComponent) shipComponent: ShipComponent;
  @ViewChild(ReceiveComponent) receiveComponent: ReceiveComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.handleTabChangeSub();
  }

  handleTabChangeSub(): void {
    this.tabChangeSub = this.activatedRoute?.queryParams?.subscribe((queryParams) => {
      const tab: any = queryParams as { tab: string };

      if (!!tab.tab) {
        this.tabIndex = Tabs[tab.tab];
      }
    });
  }

  selectedTabChanged(event: any): void {
    const index: number = event.index;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: Tabs[event.index] }
    });

    if (index === 0) {
      this.viewShipmentComponent.shipmentTableCall();
    } else if (index === 1) {
      this.shipComponent.calltheApis();
    } else {
      this.receiveComponent.fetchOrderStatus();
    }
  }

  ngOnDestroy() {
    this.tabChangeSub?.unsubscribe();
  }
}
