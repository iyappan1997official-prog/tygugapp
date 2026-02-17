import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import { DashboardService } from '../../dashboard.service';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { AuthService } from 'src/app/modules/auth/auth.service';

@Component({
  selector: 'app-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapLocationComponent implements OnInit {
  private unsubscribe: Subscription[] = [];
  mapLocationDetails: any[] = [];
  public roleEnum = Roles;
  orderTypeId: number;
  locationlat: any;
  markerData: any;
  locationlong: any;
  locationCoords?: google.maps.LatLng | null = null;
  mapCenter: google.maps.LatLng;
  markerInfoContent = '';
  markers: any = [];userDetails: any;
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 12,
  };
  mapZoom = 2;
  loggedInUserRole: Roles;
  constructor(
    public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.quiltLocationMark(this.locationlat, this.locationlong, this.markerData);
  }
  // getMapLoaction() {
  //   this.spinner.show();
  //   const totalQuilts = this.dashboardService.getMapData(this.orderTypeId).subscribe((res) => {
  //     if (res.statusCode == 200) {
  //       this.mapLocationDetails = res.data.mapLocations
  //       this.quiltLocationMark(this.locationlat, this.locationlong)
  //     }

  //     else {
  //       this.toastr.error(res.message);
  //     }
  //   })
  //   this.spinner.hide();
  //   this.unsubscribe.push(totalQuilts);
  // };
  quiltLocationMark(latitude: any, longitude: any, markerData:any) {
    let pinInfo: any[] = [];
    if (latitude && longitude) {
      const point: google.maps.LatLngLiteral = {
        lat: latitude,
        lng: longitude
      };
      markerData.forEach((item: any) => {
        let locObj1 = { size: item.size, quantity: item.quantity }
        pinInfo.push(locObj1);
      });

      this.locationCoords = new google.maps.LatLng(point);

      this.mapCenter = new google.maps.LatLng(point);
      // this.map.panTo(point);
      let address: string = '';

      let locObj = { mapCenter: this.mapCenter, address: address, pinArr: pinInfo }
      this.markers.push(locObj);
    }

  }
  openInfoWindow(marker: MapMarker, item: any) {
    this.markerInfoContent = item.pinArr;
    this.infoWindow.open(marker);
  }
}
