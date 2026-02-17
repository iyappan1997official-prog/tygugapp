import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchShipmentTypesService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  allShipmentTypes: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllShipmentTypes() {
    const allShipmentTypesSub = this.http.get(`${this.API_USERS_URL}/Generic/shipmentTypes`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allShipmentTypes.next(res.data);
      } else {
        this.allShipmentTypes.next([])
      }
    })

    this.unsubscribe.push(allShipmentTypesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
