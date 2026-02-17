import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchShipmentETAService implements OnDestroy {
 private unsubscribe: Subscription[] = [];
  allShipmentETAs: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

 getAllShipmentETAs() {
    const allShipmentETAsSub = this.http.get(`${this.API_USERS_URL}/Generic/shipmentETAs`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allShipmentETAs.next(res.data);
      } else {
        this.allShipmentETAs.next([])
      }
    })

    this.unsubscribe.push(allShipmentETAsSub);
  }

   ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
