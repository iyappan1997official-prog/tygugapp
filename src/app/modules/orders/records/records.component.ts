import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarrierComponent } from '../carrier/carrier.component';
import { LocationComponent } from '../location/location.component';
import { ViewCustomerDetailsComponent } from '../view-customer-details/view-customer-details.component';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from '../../auth/auth.service';
import { QuiltThresholdComponent } from '../quilt-threshold/quilt-threshold.component';
import { DataSharingService } from 'src/app/shared/services/data-sharing.service';

enum Tabs {
  "orders" = 0,
  "locations" = 1,
  "carrier" = 2,
  "threshold-limit" = 3
}
enum Tabs1 {
  "locations" = 0,
  "carrier" = 1,
}

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit, OnDestroy {
  tabChangeSub: Subscription;
  tabIndex: number | string = 0;
  public roleEnum = Roles;
  loggedInUserRole: Roles;
  customerName: string = this.activatedRoute?.snapshot?.queryParams?.customerName;
  customerNumber: string = this.activatedRoute?.snapshot?.queryParams?.customerNumber;

  @ViewChild(ViewCustomerDetailsComponent) viewCustomerDetailsComponent: ViewCustomerDetailsComponent;
  @ViewChild(LocationComponent) locationComponent: LocationComponent;
  @ViewChild(CarrierComponent) carrierComponent: CarrierComponent;
  @ViewChild(QuiltThresholdComponent) quiltThresholdComponent: QuiltThresholdComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    const userData = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = userData?.roles[0] || "";
    this.handleTabChangeSub();
  }

  handleTabChangeSub(): void {
    this.tabChangeSub = this.activatedRoute?.queryParams?.subscribe((queryParams) => {
      const tab: any = queryParams as { tab: string };
      if (!!tab.tab && ![this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        this.tabIndex = Tabs[tab.tab];
      } else if (!!tab.tab) {
        this.tabIndex = Tabs1[tab.tab];
      }
    });
  }

  selectedTabChanged(event: any): void {
    const index: number = event.index;
    if (![this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { tab: Tabs[index] }
      });
      if (index === 0) {
        this.viewCustomerDetailsComponent.getAllOrders();
      } else if (index === 1) {
        this.locationComponent.getAllLocations();
      } else if (index === 2) {
        this.carrierComponent.getAllCarriers();
      } else {
        this.quiltThresholdComponent.getAllThreshold()
      }
    } else {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { tab: Tabs1[index] }
      });
      if (index === 0) {
        this.locationComponent.getAllLocations();
      } else if (index === 1) {
        this.carrierComponent.getAllCarriers();
      }
    }
  }

  ngOnDestroy() {
    this.tabChangeSub?.unsubscribe();
  }

}
